// Magnolia Education — Supabase REST client (shared module for Netlify functions)
//
// Writes the student into the MMS student database (separate project) over the
// PostgREST REST API using the SERVICE-ROLE key (bypasses RLS). SERVER-ONLY —
// never ship to the browser. No npm deps: global fetch only.
//
// Required Netlify env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

function restConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set in Netlify env');
  }
  return { base: `${url.replace(/\/$/, '')}/rest/v1`, key };
}

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

module.exports = { getStudentByTutorbirdId, upsertStudent, setStudentTaskId };
