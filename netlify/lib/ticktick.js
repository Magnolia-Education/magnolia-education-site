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

  const text0 = await res.text();
  if (!res.ok) {
    throw new Error(`ticktick-mcp HTTP ${res.status}: ${text0.slice(0, 200)}`);
  }
  const json = JSON.parse(text0);
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
    s.grade != null ? `- Grade: ${s.grade}` : null,
    s.school ? `- School: ${s.school}` : null,
    s.phone ? `- Phone: ${s.phone}` : null,
    s.parent_name ? `- Parent: ${s.parent_name}` : null,
    s.parent_email ? `- Parent email: ${s.parent_email}` : null,
    s.parent_phone ? `- Parent phone: ${s.parent_phone}` : null,
    s.subject ? `- Subject (from signup): ${s.subject}` : null,
    s.device ? `- Device: ${s.device}` : null,
    s.session_plan ? `- Session plan: ${s.session_plan}` : null,
  ].filter((l) => l !== null && l !== undefined);

  // Flag anything the heuristic parser couldn't read so Rachit can fix the student row.
  if (Array.isArray(s.warnings) && s.warnings.length) {
    lines.push('', '## ⚠️ Needs review', ...s.warnings.map((w) => `- ${w}`));
  }

  return lines.join('\n');
}

// Create the onboarding task in the Onboarding Ops list. Returns the new id.
async function createOnboardingTask(baseUrl, student) {
  const projectId = process.env.TICKTICK_ONBOARDING_PROJECT_ID;
  if (!projectId) throw new Error('TICKTICK_ONBOARDING_PROJECT_ID not set in Netlify env');

  // Due 2 days after sign-up (all-day, Eastern) so board setup stays timely and the
  // task surfaces in TickTick's dated views. TickTick can't set a real assignee via the
  // API (see buildTaskBody) -- only the due date is settable.
  const due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const dueDate = `${due.toISOString().slice(0, 10)}T00:00:00+0000`;

  const task = await callTickTick(baseUrl, 'create_task', {
    title: `Create board for ${student.name}`,
    projectId,
    content: buildTaskBody(student),
    priority: 3,
    dueDate,
    isAllDay: true,
    timeZone: 'America/Toronto',
  });
  if (!task || !task.id) {
    throw new Error(`create_task returned no task id: ${JSON.stringify(task)}`);
  }
  return task.id;
}

module.exports = { callTickTick, buildTaskBody, createOnboardingTask };
