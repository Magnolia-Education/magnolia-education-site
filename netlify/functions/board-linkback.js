// Magnolia Education — Board link-back (Netlify Function)
//
// Lets a staff member paste a BitPaper board URL back into the MMS DB after they
// create the board (the last step of the TickTick onboarding task). Two actions,
// both gated by the SAME admin password the content admin uses:
//   { action: 'list', password }                  → boards still missing a URL
//   { action: 'save', password, boardId, url }     → set boards.url (https only)
//
// The real security is THIS server-side password check — never trust the page.
// Required Netlify env: ADMIN_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

const db = require('../lib/supabase');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function json(statusCode, obj) {
  return { statusCode, headers: CORS, body: JSON.stringify(obj) };
}

// Mirror the portal's safeBoardUrl(): https:// only, else reject (stored-XSS
// guard — the value is rendered as a link in the authenticated portal origin).
function isHttpsUrl(u) {
  try {
    return new URL(u).protocol === 'https:';
  } catch {
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return json(500, { error: 'ADMIN_PASSWORD not set in Netlify dashboard' });
  if (body.password !== expected) return json(401, { error: 'Incorrect password' });

  try {
    if (body.action === 'list') {
      const boards = await db.listBoardsMissingUrl();
      return json(200, { ok: true, boards });
    }

    if (body.action === 'save') {
      const { boardId, url } = body;
      if (!boardId || !url) return json(400, { error: 'boardId and url are required' });
      if (!isHttpsUrl(url)) return json(400, { error: 'URL must be https://' });
      await db.updateBoardUrl(boardId, url);
      return json(200, { ok: true });
    }

    return json(400, { error: 'Unknown action (expected "list" or "save")' });
  } catch (err) {
    return json(500, { error: err.message });
  }
};
