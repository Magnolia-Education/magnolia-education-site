// Magnolia Education — Supabase REST client (shared module for Netlify functions)
//
// The MMS student database lives in a separate project/repo, but it is the
// single source of truth for students/enrollments/sessions/boards. These
// functions write to it over the PostgREST REST API using the SERVICE-ROLE key
// (bypasses RLS), so this module is SERVER-ONLY — never ship it to the browser.
//
// No npm dependencies: uses global fetch only, matching ticktick-mcp.js.
//
// Required Netlify environment variables:
//   SUPABASE_URL               — e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  — service-role key (server-only, all-powerful)

function restConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set in Netlify env');
  }
  return { base: `${url.replace(/\/$/, '')}/rest/v1`, key };
}

// Low-level PostgREST call. `path` starts with the table, e.g. '/students?...'.
async function sb(path, { method = 'GET', body, prefer } = {}) {
  const { base, key } = restConfig();
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  if (prefer) headers.Prefer = prefer;

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Supabase ${method} ${path} failed (${res.status}): ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

const enc = encodeURIComponent;

// ─── Students ─────────────────────────────────────────────────────────────────

async function getStudentByTutorbirdId(tutorbirdId) {
  const rows = await sb(`/students?tutorbird_id=eq.${enc(tutorbirdId)}&select=*`);
  return rows[0] || null;
}

// Idempotent upsert keyed on the UNIQUE students.tutorbird_id. Only the columns
// in `row` are written, so user_id / onboarding_ticktick_task_id are preserved.
async function upsertStudent(row) {
  const rows = await sb('/students?on_conflict=tutorbird_id', {
    method: 'POST',
    body: [row],
    prefer: 'resolution=merge-duplicates,return=representation',
  });
  return rows[0];
}

async function setStudentTaskId(studentId, taskId) {
  await sb(`/students?id=eq.${enc(studentId)}`, {
    method: 'PATCH',
    body: { onboarding_ticktick_task_id: taskId },
    prefer: 'return=minimal',
  });
}

// ─── Parents ──────────────────────────────────────────────────────────────────

// parents.email has no unique constraint, so look up before inserting to stay
// idempotent across webhook retries.
async function findOrCreateParent({ name, email, phone }) {
  if (email) {
    const existing = await sb(`/parents?email=eq.${enc(email)}&select=id&limit=1`);
    if (existing[0]) return existing[0].id;
  }
  const rows = await sb('/parents', {
    method: 'POST',
    body: [{ name, email: email || null, phone: phone || null }],
    prefer: 'return=representation',
  });
  return rows[0].id;
}

// ─── Tutors ───────────────────────────────────────────────────────────────────

// tutor_id_or_email may be a UUID (tutors.id) or an email. Returns the tutor row
// or null. M1: tutor must already exist (per spec §3.1).
async function findTutor(idOrEmail) {
  const filter = idOrEmail.includes('@')
    ? `email=eq.${enc(idOrEmail)}`
    : `id=eq.${enc(idOrEmail)}`;
  const rows = await sb(`/tutors?${filter}&active=eq.true&select=*&limit=1`);
  return rows[0] || null;
}

// ─── Enrollments / sessions / boards ───────────────────────────────────────────

async function findOrCreateEnrollment({ student_id, tutor_id, subject, sessions_purchased, sessions_remaining }) {
  const existing = await sb(
    `/enrollments?student_id=eq.${enc(student_id)}&subject=eq.${enc(subject)}&select=id&limit=1`,
  );
  if (existing[0]) return existing[0].id;
  const rows = await sb('/enrollments', {
    method: 'POST',
    body: [{
      student_id,
      tutor_id,
      subject,
      sessions_purchased: sessions_purchased ?? 0,
      sessions_remaining: sessions_remaining ?? 0,
    }],
    prefer: 'return=representation',
  });
  return rows[0].id;
}

// sessions.tutorbird_session_id is UNIQUE → upsert is naturally idempotent.
async function upsertSession({ enrollment_id, scheduled_at, tutorbird_session_id }) {
  await sb('/sessions?on_conflict=tutorbird_session_id', {
    method: 'POST',
    body: [{ enrollment_id, scheduled_at, status: 'scheduled', tutorbird_session_id }],
    prefer: 'resolution=merge-duplicates,return=minimal',
  });
}

async function findOrCreateBoard({ enrollment_id, label }) {
  const existing = await sb(
    `/boards?enrollment_id=eq.${enc(enrollment_id)}&type=eq.bitpaper&select=id&limit=1`,
  );
  if (existing[0]) return existing[0].id;
  const rows = await sb('/boards', {
    method: 'POST',
    body: [{ enrollment_id, type: 'bitpaper', url: null, label: label || null }],
    prefer: 'return=representation',
  });
  return rows[0].id;
}

// ─── Board link-back (admin) ────────────────────────────────────────────────────

// Boards still missing a URL, with student name + subject for the admin list.
async function listBoardsMissingUrl() {
  return sb(
    '/boards?url=is.null&select=id,label,enrollment:enrollments(subject,student:students(name))&order=created_at.asc',
  );
}

async function updateBoardUrl(boardId, url) {
  await sb(`/boards?id=eq.${enc(boardId)}`, {
    method: 'PATCH',
    body: { url },
    prefer: 'return=minimal',
  });
}

module.exports = {
  getStudentByTutorbirdId,
  upsertStudent,
  setStudentTaskId,
  findOrCreateParent,
  findTutor,
  findOrCreateEnrollment,
  upsertSession,
  findOrCreateBoard,
  listBoardsMissingUrl,
  updateBoardUrl,
};
