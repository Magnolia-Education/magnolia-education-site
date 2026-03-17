// Magnolia Education — TickTick Auth URL Helper (Netlify Function)
// Returns the TickTick OAuth authorization URL without exposing client ID in HTML.
//
// Required Netlify environment variables:
//   TICKTICK_CLIENT_ID — OAuth2 client ID

const TICKTICK_AUTH_URL = 'https://ticktick.com/oauth/authorize';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const clientId = process.env.TICKTICK_CLIENT_ID;
  if (!clientId) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'TICKTICK_CLIENT_ID not configured.' }),
    };
  }

  const host = event.headers?.host || event.headers?.Host || '';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/.netlify/functions/ticktick-callback`;

  const url = new URL(TICKTICK_AUTH_URL);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'tasks:read tasks:write');

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ url: url.toString() }),
  };
};
