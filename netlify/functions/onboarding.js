// Magnolia Education — Onboarding webhook (Netlify Function)
//
// Zapier (off the TutorBird "New Student" trigger) POSTs an HMAC-signed JSON
// payload here. We:
//   1. verify the HMAC signature          → 401 on mismatch
//   2. validate required fields           → 400 (with received_keys)
//   3. upsert the student into the MMS Supabase DB (idempotent on tutorbird_id)
//   4. create ONE task in the TickTick "Onboarding Ops" list — "Create board
//      for {student}" for Rachit — idempotent (skipped if a task id is stored),
//      then store that id back on the student.
//
// No tutor, enrollment, sessions, or board are created — those happen later when
// staff work the TickTick task.
//
// Required Netlify env: ZAPIER_WEBHOOK_SECRET, SUPABASE_URL,
//   SUPABASE_SERVICE_ROLE_KEY, TICKTICK_ONBOARDING_PROJECT_ID

const crypto = require('crypto');
const db = require('../lib/supabase');
const ticktick = require('../lib/ticktick');
const parse = require('../lib/parse');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Magnolia-Signature',
  'Content-Type': 'application/json',
};

const REQUIRED = ['tutorbird_id', 'first_name', 'last_name', 'email'];

function json(statusCode, obj) {
  return { statusCode, headers: CORS, body: JSON.stringify(obj) };
}

function verifySignature(rawBody, header, secret) {
  if (!header) return false;
  const provided = header.replace(/^sha256=/i, '').trim();
  const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  const a = Buffer.from(provided, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const secret = process.env.ZAPIER_WEBHOOK_SECRET;
  if (!secret) return json(500, { error: 'ZAPIER_WEBHOOK_SECRET not set' });

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : (event.body || '');

  const sigHeader = event.headers['x-magnolia-signature']; // Netlify lowercases all header keys
  if (!verifySignature(rawBody, sigHeader, secret)) {
    return json(401, { error: 'Invalid signature' });
  }

  let p;
  try {
    p = JSON.parse(rawBody);
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const missing = REQUIRED.filter((k) => p[k] === undefined || p[k] === null || p[k] === '');
  if (missing.length) {
    return json(400, { error: 'Missing required fields', missing, received_keys: Object.keys(p) });
  }

  try {
    // Idempotency: a stored task id means we already onboarded this student.
    const existing = await db.getStudentByTutorbirdId(p.tutorbird_id);
    if (existing && existing.onboarding_ticktick_task_id) {
      return json(200, { ok: true, idempotent: true, student_id: existing.id });
    }

    const name = `${p.first_name} ${p.last_name}`.trim();

    // Heuristically parse the free-text/structured intake fields. Anything unparseable is
    // skipped and noted in `warnings` (surfaced in the TickTick task) -- we never reject.
    const { fields, warnings } = parse.parseIntake(p);

    // Create / link the parent (idempotent on email, migration 0013). Skip when no parent
    // email was provided -- the unique index is partial, so a null-email upsert wouldn't merge.
    let parentId = null;
    const parentEmail = p.parent_email && String(p.parent_email).trim();
    if (parentEmail) {
      const parentFirst = (p.parent_first_name || '').trim();
      const parentLast = (p.parent_last_name || '').trim();
      const parent = await db.upsertParent({
        first_name: parentFirst || null,
        last_name: parentLast || null,
        name: `${parentFirst} ${parentLast}`.trim() || p.parent_name || parentEmail,
        email: parentEmail,
        phone: p.parent_phone || null,
      });
      parentId = parent.id;
    } else {
      warnings.push('No parent email provided — parent not linked.');
    }

    const student = await db.upsertStudent({
      tutorbird_id: p.tutorbird_id,
      name,
      first_name: p.first_name,
      last_name: p.last_name,
      grade: fields.grade,
      school: p.school || null,
      device: fields.device,
      subject_requested: p.subject_requested || p.subject || null,
      previous_subject_mark: fields.previous_subject_mark,
      sessions_per_week: fields.sessions_per_week,
      session_length_min: fields.session_length_min,
      preferred_times: fields.preferred_times,
      unavailable_times: fields.unavailable_times,
      earliest_start_after_school: fields.earliest_start_after_school,
      spare_period: p.spare_period ? String(p.spare_period).trim() : null,
      primary_parent_id: parentId,
      intake_raw: { ...p, _parse_warnings: warnings },
    });

    const proto = event.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${proto}://${event.headers.host}`;
    const taskId = await ticktick.createOnboardingTask(baseUrl, {
      name,
      email: p.email,
      grade: fields.grade,
      school: p.school,
      phone: p.phone,
      parent_name: p.parent_name || `${p.parent_first_name || ''} ${p.parent_last_name || ''}`.trim(),
      parent_email: p.parent_email,
      parent_phone: p.parent_phone,
      subject: p.subject_requested || p.subject,
      device: fields.device,
      session_plan: p.session_plan,
      warnings,
    });
    // Persist the task id. If this PATCH fails we still return 200 so Zapier does NOT
    // retry — the TickTick task already exists and a retry would create a duplicate.
    // The student row is left without a stored task id, which means the idempotency
    // guard above won't fire on a future manual retry, but that's the safer trade-off
    // vs silently creating duplicate tasks for every transient Supabase blip.
    try {
      await db.setStudentTaskId(student.id, taskId);
    } catch (patchErr) {
      console.error('setStudentTaskId failed (task was created):', patchErr.message);
    }

    return json(200, { ok: true, student_id: student.id, ticktick_task_id: taskId });
  } catch (err) {
    console.error('onboarding error:', err.message);
    return json(500, { error: 'Internal error — check Netlify function logs' });
  }
};
