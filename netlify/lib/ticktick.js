// Magnolia Education — TickTick onboarding helper (shared module)
//
// REUSES the existing ticktick-mcp function (which owns the OAuth tokens +
// auto-refresh) by calling it over HTTP with the JSON-RPC it speaks. No second
// copy of the token logic, no npm deps (global fetch only).

// Call a tool on our own ticktick-mcp function. `baseUrl` is this site's origin.
async function callTickTick(baseUrl, toolName, args) {
  const res = await fetch(`${baseUrl}/.netlify/functions/ticktick-mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: toolName, arguments: args },
    }),
  });

  const json = await res.json();
  if (json.error) throw new Error(`TickTick MCP error: ${json.error.message}`);
  // The MCP wraps tool results as { content: [{ type:'text', text: <json> }] }.
  const text = json.result?.content?.[0]?.text;
  return text ? JSON.parse(text) : null;
}

// The onboarding task body: the "create the board" instruction for Rachit plus
// every detail he needs, since the API can't set a real assignee or store the
// extra fields in the student row.
function buildTaskBody(s) {
  const lines = [
    'New student signed up — create their BitPaper board.',
    '',
    'Assignee: Rachit',
    '',
    '## Student',
    `- Name: ${s.name}`,
    s.email ? `- Email: ${s.email}` : null,
    s.grade ? `- Grade: ${s.grade}` : null,
    s.school ? `- School: ${s.school}` : null,
    s.phone ? `- Phone: ${s.phone}` : null,
    s.parent_name ? `- Parent: ${s.parent_name}` : null,
    s.parent_email ? `- Parent email: ${s.parent_email}` : null,
    s.parent_phone ? `- Parent phone: ${s.parent_phone}` : null,
    s.subject ? `- Subject (from signup): ${s.subject}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

// Create the onboarding task in the Onboarding Ops list. Returns the new id.
async function createOnboardingTask(baseUrl, student) {
  const projectId = process.env.TICKTICK_ONBOARDING_PROJECT_ID;
  if (!projectId) throw new Error('TICKTICK_ONBOARDING_PROJECT_ID not set in Netlify env');

  const task = await callTickTick(baseUrl, 'create_task', {
    title: `Create board for ${student.name}`,
    projectId,
    content: buildTaskBody(student),
    priority: 3,
  });
  if (!task || !task.id) {
    throw new Error(`create_task returned no task id: ${JSON.stringify(task)}`);
  }
  return task.id;
}

module.exports = { callTickTick, buildTaskBody, createOnboardingTask };
