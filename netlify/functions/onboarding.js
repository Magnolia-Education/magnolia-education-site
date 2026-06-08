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
    // Idempotency: a stored task id means we already onboarded this student.
    const existing = await db.getStudentByTutorbirdId(p.tutorbird_id);
    if (existing && existing.onboarding_ticktick_task_id) {
      return json(200, { ok: true, idempotent: true, student_id: existing.id });
    }

    const name = `${p.first_name} ${p.last_name}`.trim();
    const grade = Number.parseInt(p.grade, 10);
    const student = await db.upsertStudent({
      tutorbird_id: p.tutorbird_id,
      name,
      grade: Number.isNaN(grade) ? null : grade,
    });

    const proto = event.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${proto}://${event.headers.host}`;
    const taskId = await ticktick.createOnboardingTask(baseUrl, {
      name,
      email: p.email,
      grade: Number.isNaN(grade) ? null : grade,
      school: p.school,
      phone: p.phone,
      parent_name: p.parent_name,
      parent_email: p.parent_email,
      parent_phone: p.parent_phone,
      subject: p.subject,
    });
    await db.setStudentTaskId(student.id, taskId);

    return json(200, { ok: true, student_id: student.id, ticktick_task_id: taskId });
  } catch (err) {
    return json(500, { error: err.message });
  }
};
