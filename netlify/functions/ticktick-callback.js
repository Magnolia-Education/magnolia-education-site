// Magnolia Education — TickTick OAuth Callback (Netlify Function)
// Handles the OAuth 2.0 authorization code redirect from TickTick.
// Exchanges the code for tokens and persists them to Netlify env vars.
//
// Required Netlify environment variables (set before first OAuth):
//   TICKTICK_CLIENT_ID     — OAuth2 client ID
//   TICKTICK_CLIENT_SECRET — OAuth2 client secret
//   NETLIFY_SITE_ID        — Site ID for persisting tokens
//   NETLIFY_ACCESS_TOKEN   — Netlify personal access token

const TICKTICK_TOKEN_URL = 'https://ticktick.com/oauth/token';
const NETLIFY_API = 'https://api.netlify.com/api/v1';

async function persistNetlifyEnv(vars) {
  const siteId = process.env.NETLIFY_SITE_ID;
  const netlifyToken = process.env.NETLIFY_ACCESS_TOKEN;

  if (!siteId || !netlifyToken) {
    console.warn('NETLIFY_SITE_ID or NETLIFY_ACCESS_TOKEN not set — tokens not persisted.');
    return false;
  }

  const results = await Promise.all(
    Object.entries(vars).map(async ([key, value]) => {
      const res = await fetch(`${NETLIFY_API}/sites/${siteId}/env/${key}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${netlifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        // Variable may not exist yet — try POST to create it
        const createRes = await fetch(`${NETLIFY_API}/sites/${siteId}/env`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${netlifyToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([{ key, values: [{ value, context: 'all' }] }]),
        });
        return createRes.ok;
      }
      return true;
    })
  );

  return results.every(Boolean);
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const { code, state, error, error_description } = params;

  // Handle OAuth errors from TickTick
  if (error) {
    const msg = error_description || error;
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: errorPage(`TickTick authorization failed: ${msg}`),
    };
  }

  if (!code) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: errorPage('No authorization code received.'),
    };
  }

  const clientId = process.env.TICKTICK_CLIENT_ID;
  const clientSecret = process.env.TICKTICK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: errorPage('Server configuration error: missing client credentials.'),
    };
  }

  // Determine redirect URI (must match what was used in the authorization request)
  const host = event.headers?.host || event.headers?.Host || '';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/.netlify/functions/ticktick-callback`;

  try {
    // Exchange authorization code for tokens
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch(TICKTICK_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      throw new Error(`Token exchange failed (${tokenRes.status}): ${text}`);
    }

    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      throw new Error('No access_token in response: ' + JSON.stringify(tokens));
    }

    // Persist tokens to Netlify env vars
    const varsToSave = {
      TICKTICK_ACCESS_TOKEN: tokens.access_token,
    };
    if (tokens.refresh_token) {
      varsToSave.TICKTICK_REFRESH_TOKEN = tokens.refresh_token;
    }

    const persisted = await persistNetlifyEnv(varsToSave);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: successPage(persisted, tokens.access_token, tokens.refresh_token || null),
    };

  } catch (err) {
    console.error('TickTick OAuth callback error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: errorPage(`Authentication failed: ${err.message}`),
    };
  }
};

function successPage(persisted, accessToken, refreshToken) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TickTick Connected — Magnolia Education</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8f6f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 3rem 2.5rem;
      max-width: 560px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { color: #3D4466; font-size: 1.75rem; margin-bottom: 0.75rem; }
    p { color: #666; line-height: 1.6; margin-bottom: 1rem; }
    .status {
      background: ${persisted ? '#e8f5e9' : '#fff3e0'};
      border: 1px solid ${persisted ? '#a5d6a7' : '#ffcc80'};
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: ${persisted ? '#2e7d32' : '#e65100'};
      margin-top: 1.5rem;
      text-align: left;
    }
    .token-section {
      margin-top: 2rem;
      text-align: left;
    }
    .token-section h2 {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #999;
      margin-bottom: 1rem;
    }
    .token-row {
      margin-bottom: 1rem;
    }
    .token-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #3D4466;
      margin-bottom: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .token-value {
      background: #f4f4f4;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 0.6rem 0.75rem;
      font-family: monospace;
      font-size: 0.8rem;
      word-break: break-all;
      color: #333;
      cursor: pointer;
      transition: background 0.15s;
      position: relative;
    }
    .token-value:hover { background: #ebebeb; }
    .copy-btn {
      display: inline-block;
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      background: #3D4466;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
    }
    .copy-btn:hover { background: #2c3350; }
    .copy-btn.copied { background: #2e7d32; }
    a {
      display: inline-block;
      margin-top: 1.5rem;
      color: #3D4466;
      font-weight: 600;
      text-decoration: none;
    }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>TickTick Connected!</h1>
    <p>Your TickTick account has been successfully linked to Claude.</p>
    <div class="status">
      ${persisted
        ? '✓ Tokens saved to Netlify automatically — connection is persistent.'
        : '⚠️ Auto-save failed (NETLIFY_SITE_ID or NETLIFY_ACCESS_TOKEN not set). Copy the tokens below and add them manually as Netlify environment variables.'
      }
    </div>

    <div class="token-section">
      <h2>Environment Variables — copy into Netlify dashboard</h2>

      <div class="token-row">
        <div class="token-label">
          TICKTICK_ACCESS_TOKEN
          <button class="copy-btn" onclick="copyToken('access', this)">Copy</button>
        </div>
        <div class="token-value" id="token-access" onclick="copyToken('access', document.querySelector('[onclick*=access]'))">${accessToken}</div>
      </div>

      ${refreshToken ? `
      <div class="token-row">
        <div class="token-label">
          TICKTICK_REFRESH_TOKEN
          <button class="copy-btn" onclick="copyToken('refresh', this)">Copy</button>
        </div>
        <div class="token-value" id="token-refresh" onclick="copyToken('refresh', document.querySelector('[onclick*=refresh]'))">${refreshToken}</div>
      </div>` : ''}
    </div>

    <a href="/">← Back to Magnolia Education</a>
  </div>

  <script>
    function copyToken(id, btn) {
      const text = document.getElementById('token-' + id).textContent;
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
      });
    }
  </script>
</body>
</html>`;
}

function errorPage(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connection Failed — Magnolia Education</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8f6f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 3rem 2.5rem;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { color: #c0392b; font-size: 1.75rem; margin-bottom: 0.75rem; }
    p { color: #666; line-height: 1.6; margin-bottom: 1rem; }
    .error {
      background: #fdecea;
      border: 1px solid #f5c6c3;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: #c0392b;
      margin-top: 1rem;
      word-break: break-word;
    }
    a {
      display: inline-block;
      margin-top: 1.5rem;
      color: #3D4466;
      font-weight: 600;
      text-decoration: none;
    }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">❌</div>
    <h1>Connection Failed</h1>
    <p>Could not connect your TickTick account to Claude.</p>
    <div class="error">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    <a href="/ticktick-auth.html">← Try again</a>
  </div>
</body>
</html>`;
}
