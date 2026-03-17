// Magnolia Education — Netlify serverless function
// Receives new content.js text from the admin panel,
// commits it to GitHub using a server-side token.
//
// Required Netlify environment variables (set in Netlify dashboard):
//   GH_TOKEN      — classic GitHub PAT with repo scope for Magnolia-Education org
//   ADMIN_PASSWORD — must match the password set in admin/index.html

const OWNER  = 'Magnolia-Education';
const REPO   = 'magnolia-education-site';
const BRANCH = 'main';
const PATH   = 'content.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Parse body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { content, password } = body;

  // Verify admin password
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'ADMIN_PASSWORD environment variable not set in Netlify dashboard' }) };
  }
  if (password !== expectedPassword) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Incorrect password' }) };
  }

  // Verify GitHub token
  const token = process.env.GH_TOKEN;
  if (!token) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'GH_TOKEN environment variable not set in Netlify dashboard' }) };
  }

  const ghHeaders = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Magnolia-Admin-Function',
    'Content-Type': 'application/json',
  };

  // Get current file SHA
  let sha;
  try {
    const getRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`,
      { headers: ghHeaders }
    );
    if (!getRes.ok) {
      const err = await getRes.text();
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: `GitHub GET failed (${getRes.status}): ${err}` }) };
    }
    const fileData = await getRes.json();
    sha = fileData.sha;
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: `Network error fetching file: ${e.message}` }) };
  }

  // Encode and commit
  const encoded = Buffer.from(content, 'utf8').toString('base64');
  try {
    const putRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
      {
        method: 'PUT',
        headers: ghHeaders,
        body: JSON.stringify({
          message: 'chore: update content.js via Magnolia Admin',
          content: encoded,
          sha,
          branch: BRANCH,
        }),
      }
    );
    if (putRes.ok) {
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ ok: true, message: 'Saved! Netlify is deploying your changes (~30 seconds).' }),
      };
    } else {
      const err = await putRes.json();
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message || 'GitHub commit failed' }) };
    }
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: `Network error committing: ${e.message}` }) };
  }
};
