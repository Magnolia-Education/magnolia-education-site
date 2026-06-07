// Magnolia Education — Onboarding webhook (Netlify Function)
//
// Entry point for the onboarding pipeline. Zapier (off the TutorBird "New
// Student" trigger) POSTs an HMAC-signed JSON payload here. We:
//   1. verify the HMAC signature           → 401 on mismatch
//   2. validate required fields            → 400 (with received_keys)
//   3. upsert the student + derive parent/enrollment/sessions/boards in the
//      MMS Supabase DB (idempotent on tutorbird_id)
//   4. create ONE onboarding task in TickTick (idempotent: skipped if the
//      student already has a stored task id), then store that id back.
//
// Required Netlify env: ZAPIER_WEBHOOK_SECRET, SUPABASE_URL,
//   SUPABASE_SERVICE_ROLE_KEY, TICKTICK_ONBOARDING_PROJECT_ID
// (TickTick OAuth env is owned by ticktick-mcp.js, which we call internally.)

const crypto = require('crypto');
const db = require('../lib/supabase');
const ticktick = require('../lib/ticktick');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Magnolia-Signature',
  'Content-Type': 'application/json',
};

const REQUIRED = [
  'tutorbird_id', 'first_name', 'last_name', 'email',
  'grade', 'enrollment_date', 'tutor_id_or_email', 'subject',
];

function json(statusCode, obj) {
  return { statusCode, headers: CORS, body: JSON.stringify(obj) };
}

// Constant-time compare of the HMAC-SHA256 hex digest of the raw body.
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

  // Raw body exactly as received (HMAC must run over the unparsed bytes).
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : (event.body || '');

  const sigHeader = event.headers['x-magnolia-signature'] || event.headers['X-Magnolia-Signature'];
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
    // Idempotency short-circuit: fully onboarded already → no-op.
    const existing = await db.getStudentByTutorbirdId(p.tutorbird_id);
    if (existing && existing.onboarding_ticktick_task_id) {
      return json(200, { ok: true, idempotent: true, student_id: existing.id });
    }

    // Parent (optional) → student upsert.
    let primaryParentId = existing?.primary_parent_id || null;
    if (!primaryParentId && p.parent_name) {
      primaryParentId = await db.findOrCreateParent({
        name: p.parent_name, email: p.parent_email, phone: p.parent_phone,
      });
    }

    const name = `${p.first_name} ${p.last_name}`.trim();
    const grade = Number.parseInt(p.grade, 10);
    const student = await db.upsertStudent({
      tutorbird_id: p.tutorbird_id,
      name,
      grade: Number.isNaN(grade) ? null : grade,
      ...(primaryParentId ? { primary_parent_id: primaryParentId } : {}),
    });

    // Tutor resolution. Spec §3.1 expects the tutor to exist; if it doesn't we
    // still create the student + a task FLAGGED for manual setup, rather than
    // hard-failing the pilot (see plan risk note).
    let tutorWarning = null;
    const tutor = await db.findTutor(String(p.tutor_id_or_email));
    if (tutor) {
      const enrollmentId = await db.findOrCreateEnrollment({
        student_id: student.id,
        tutor_id: tutor.id,
        subject: p.subject,
        sessions_purchased: p.sessions_purchased,
        sessions_remaining: p.sessions_remaining,
      });
      for (const s of Array.isArray(p.sessions) ? p.sessions : []) {
        if (!s || !s.scheduled_at) continue;
        await db.upsertSession({
          enrollment_id: enrollmentId,
          scheduled_at: s.scheduled_at,
          tutorbird_session_id: s.tutorbird_session_id,
        });
      }
      await db.findOrCreateBoard({ enrollment_id: enrollmentId, label: p.subject });
    } else {
      tutorWarning = `Tutor "${p.tutor_id_or_email}" not found — create the tutor + enrollment + board manually.`;
    }

    // Onboarding task (idempotent via the stored id).
    const proto = event.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${proto}://${event.headers.host}`;
    const taskId = await ticktick.createOnboardingTask(
      baseUrl,
      {
        name, email: p.email, grade,
        subject: p.subject, parent_name: p.parent_name, parent_email: p.parent_email,
        tutorWarning,
      },
      { adminUrl: `${baseUrl}/admin/onboarding.html` },
    );
    await db.setStudentTaskId(student.id, taskId);

    return json(200, { ok: true, student_id: student.id, ticktick_task_id: taskId, tutorWarning });
  } catch (err) {
    return json(500, { error: err.message });
  }
};
