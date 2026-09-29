// Magnolia Education — Onboarding webhook (Netlify Function)
//
// Zapier (off the TutorBird "New Student" trigger) POSTs an HMAC-signed JSON
// payload here. We:
//   1. verify the HMAC signature          → 401 on mismatch
//   2. validate required fields           → 400 (with received_keys)
//   3. upsert the student into the MMS Supabase DB (idempotent on tutorbird_id)
//
// That is the whole job now. No tutor, enrollment, sessions, or board are created.
//
// THIS USED TO FILE A TICKTICK TASK. Step 4 created one "Create board for {student}" task in
// the Onboarding Ops list and stored its id back on the student row. It is gone: the task
// fired on student CREATION, which is before any enrollment exists, and boards in MMS are
// keyed per enrollment — so it asked for work nobody could do yet and sat in a list until
// someone remembered it. MMS now chips the pairing itself on the CRM worklist once the parent
// has confirmed, which is the first moment the board is actually makeable.
//
// The task id also served as the idempotency guard here, and that is NOT a loss:
// students.tutorbird_id carries a UNIQUE constraint and upsertStudent posts with
// resolution=merge-duplicates, so a Zapier retry merges into the same row at the database
// level. The guard only ever prevented a duplicate TICKTICK TASK, never a duplicate student.
//
// Required Netlify env: ZAPIER_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

const crypto = require('crypto');
const db = require('../lib/supabase');
const parse = require('../lib/parse');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Magnolia-Signature',
  'Content-Type': 'application/json',
};

// The student's own `email` is NOT required. A younger child often has no address and the parent
// handles everything; TutorBird then sends a blank student email. Requiring it returned 400 and
// created nothing -- no parent, no student -- and a failed Zap run alerts nobody, so the family
// simply never appeared in MMS (a grade 9 family, Sep 18 2026). What IS required is some address to
// reach the family by: the student's or the parent's. See the check below.
const REQUIRED = ['tutorbird_id', 'first_name', 'last_name'];

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

  // Some address to reach the family by. The student's own when they have one; otherwise the
  // parent's, which is what MMS already routes a student with no email through (sign-in, offers,
  // reminders -- 43 students were already in that shape via the roster import).
  const parentEmail = p.parent_email ? String(p.parent_email).trim() : '';
  const typedStudentEmail = p.email ? String(p.email).trim().toLowerCase() : '';
  if (!typedStudentEmail && !parentEmail) {
    return json(400, { error: 'Missing required fields', missing: ['email or parent_email'], received_keys: Object.keys(p) });
  }
  // A parent who typed their OWN address into the student field has not given the child an
  // address; they have told us they handle everything. Stored on the student, it would make the
  // parent sign in AS the child (MMS resolves a login to a student before a parent), with no child
  // picker and no way to reach a sibling. So it is treated as absent and lives on the parent row.
  const studentEmail =
    typedStudentEmail && typedStudentEmail !== parentEmail.toLowerCase() ? typedStudentEmail : null;

  try {
    const name = `${p.first_name} ${p.last_name}`.trim();

    // Heuristically parse the free-text/structured intake fields. Anything unparseable is
    // skipped and noted in `warnings` -- we never reject. The warnings used to be rendered
    // into the TickTick task body as well; they are still persisted on the student row as
    // intake_raw.parse_warnings, which was always the durable copy.
    const { warnings } = parse.parseIntake(p);

    // Create / link the parent (idempotent on email, migration 0013). Skip when no parent
    // email was provided -- the unique index is partial, so a null-email upsert wouldn't merge.
    let parentId = null;
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
      // Student's OWN contact info, lowercased to match the students.email backfill (MMS
      // migration 0015) that the student-portal login allow-list reads. Previously these only
      // survived inside intake_raw.payload.
      //
      // OMITTED, not sent as null, when the student has no address of their own (see the
      // studentEmail note above) -- for the merge-duplicates reason spelled out under the intake
      // columns below: a Zap re-fire with a blank email must not wipe an address an admin added
      // to the row later.
      ...(studentEmail ? { email: studentEmail } : {}),
      // Phone is load-bearing beyond CRM display: lib/quo/group-chat.ts builds the pairing
      // group chat from it, and a student without one blocks that chat entirely.
      phone: p.phone ? String(p.phone).trim() : null,
      // INTAKE COLUMNS ARE DELIBERATELY ABSENT. The MMS wizard at /onboarding owns grade,
      // school, device, subject_requested, previous_subject_mark, sessions_per_week,
      // session_length_min, preferred_times, unavailable_times, earliest_start_after_school
      // and spare_period now.
      //
      // They are OMITTED, not sent as null, and that distinction is the entire point:
      // upsertStudent posts with PostgREST `resolution=merge-duplicates`, so a key PRESENT
      // with a null value OVERWRITES the stored column, while an absent key leaves it alone.
      // parseIntake returns null (never undefined) for missing input, so keeping these lines
      // would null a family's wizard answers on every Zap re-fire — silently, because none of
      // these columns is required and nothing would error.
      primary_parent_id: parentId,
      intake_raw: { payload: p, parse_warnings: warnings },
    });

    return json(200, { ok: true, student_id: student.id });
  } catch (err) {
    console.error('onboarding error:', err.message);
    return json(500, { error: 'Internal error — check Netlify function logs' });
  }
};
