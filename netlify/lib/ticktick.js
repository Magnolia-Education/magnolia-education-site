// Magnolia Education — TickTick onboarding helper (shared module)
//
// We REUSE the existing ticktick-mcp function (which owns the OAuth tokens +
// auto-refresh) by calling it over HTTP with the same JSON-RPC the MCP speaks.
// This keeps the working token path untouched — no second copy of the refresh
// logic. No npm dependencies (global fetch only).

// Call a tool on our own ticktick-mcp function. `baseUrl` is this site's origin
// (e.g. https://magnolia-education.com), derived from the incoming request.
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
  if (json.error) {
    throw new Error(`TickTick MCP error: ${json.error.message}`);
  }
  // The MCP wraps tool results as { content: [{ type:'text', text: <json> }] }.
  const text = json.result?.content?.[0]?.text;
  return text ? JSON.parse(text) : null;
}

// Build the onboarding task body. TickTick can't create individually-tickable
// checklist items via the API, so the steps live in the description as a
// markdown checklist plus the student's details for the staff member.
function buildTaskBody(student, { adminUrl }) {
  const lines = [
    '## Onboarding checklist',
    '- [ ] Create the BitPaper board',
    '- [ ] Confirm the welcome email went out',
    '- [ ] Schedule the first session',
    `- [ ] Paste the board URL back: ${adminUrl}`,
    '- [ ] First-session follow-up',
    '',
    '## Student',
    `- Name: ${student.name}`,
    student.email ? `- Email: ${student.email}` : null,
    student.grade ? `- Grade: ${student.grade}` : null,
    student.subject ? `- Subject: ${student.subject}` : null,
    student.parent_name ? `- Parent: ${student.parent_name}` : null,
    student.parent_email ? `- Parent email: ${student.parent_email}` : null,
    student.tutorWarning ? `\n⚠️ ${student.tutorWarning}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

// Create the onboarding task in the Onboarding Ops list. Returns the new task id.
async function createOnboardingTask(baseUrl, student, { adminUrl }) {
  const projectId = process.env.TICKTICK_ONBOARDING_PROJECT_ID;
  if (!projectId) {
    throw new Error('TICKTICK_ONBOARDING_PROJECT_ID not set in Netlify env');
  }
  const task = await callTickTick(baseUrl, 'create_task', {
    title: `Onboard ${student.name}`,
    projectId,
    content: buildTaskBody(student, { adminUrl }),
    priority: 3,
  });
  if (!task || !task.id) {
    throw new Error(`create_task returned no task id: ${JSON.stringify(task)}`);
  }
  return task.id;
}

module.exports = { callTickTick, buildTaskBody, createOnboardingTask };
