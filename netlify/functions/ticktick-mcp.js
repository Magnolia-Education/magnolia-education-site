// Magnolia Education — TickTick MCP Server (Netlify Function)
// MCP HTTP transport, JSON-RPC 2.0, protocol version 2024-11-05
//
// Required Netlify environment variables:
//   TICKTICK_CLIENT_ID      — OAuth2 client ID
//   TICKTICK_CLIENT_SECRET  — OAuth2 client secret
//   TICKTICK_ACCESS_TOKEN   — Current access token (refreshed automatically)
//   TICKTICK_REFRESH_TOKEN  — Refresh token (updated on refresh)
//   NETLIFY_SITE_ID         — Site ID for persisting new tokens
//   NETLIFY_ACCESS_TOKEN    — Netlify personal access token for env var updates

const TICKTICK_API = 'https://ticktick.com/open/v1';
const TICKTICK_TOKEN_URL = 'https://ticktick.com/oauth/token';
const NETLIFY_API = 'https://api.netlify.com/api/v1';

// In-memory token cache (survives warm Lambda instances)
let _accessToken = null;

// ─── Token Management ────────────────────────────────────────────────────────

async function getAccessToken() {
  if (_accessToken) return _accessToken;
  const token = process.env.TICKTICK_ACCESS_TOKEN;
  if (token) {
    _accessToken = token;
    return token;
  }
  throw new Error('No TICKTICK_ACCESS_TOKEN configured. Complete OAuth flow via /ticktick-auth first.');
}

async function refreshAccessToken() {
  const clientId = process.env.TICKTICK_CLIENT_ID;
  const clientSecret = process.env.TICKTICK_CLIENT_SECRET;
  const refreshToken = process.env.TICKTICK_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing OAuth credentials for token refresh.');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(TICKTICK_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }).toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const tokens = await res.json();
  _accessToken = tokens.access_token;

  // Persist updated tokens to Netlify env vars (best-effort)
  await persistNetlifyEnv({
    TICKTICK_ACCESS_TOKEN: tokens.access_token,
    ...(tokens.refresh_token ? { TICKTICK_REFRESH_TOKEN: tokens.refresh_token } : {}),
  }).catch((err) => console.warn('Failed to persist tokens:', err.message));

  return tokens.access_token;
}

async function persistNetlifyEnv(vars) {
  const siteId = process.env.NETLIFY_SITE_ID;
  const netlifyToken = process.env.NETLIFY_ACCESS_TOKEN;
  if (!siteId || !netlifyToken) return;

  await Promise.all(
    Object.entries(vars).map(([key, value]) =>
      fetch(`${NETLIFY_API}/sites/${siteId}/env/${key}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${netlifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      })
    )
  );
}

// ─── TickTick API Client ──────────────────────────────────────────────────────

async function ticktick(method, path, body) {
  const token = await getAccessToken();
  return ticktickWithToken(method, path, body, token, false);
}

async function ticktickWithToken(method, path, body, token, retried) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${TICKTICK_API}${path}`, opts);

  // On 401, try refreshing once
  if (res.status === 401 && !retried) {
    const newToken = await refreshAccessToken();
    return ticktickWithToken(method, path, body, newToken, true);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TickTick API error (${res.status}): ${text}`);
  }

  // Some endpoints return empty body on success
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── MCP Tool Handlers ────────────────────────────────────────────────────────

async function handleToolCall(name, args) {
  switch (name) {

    case 'get_projects': {
      return ticktick('GET', '/project');
    }

    case 'get_project': {
      const { projectId } = args;
      return ticktick('GET', `/project/${projectId}`);
    }

    case 'get_project_data': {
      const { projectId } = args;
      return ticktick('GET', `/project/${projectId}/data`);
    }

    case 'create_project': {
      const { name, color, viewMode, kind } = args;
      const body = { name };
      if (color !== undefined) body.color = color;
      if (viewMode !== undefined) body.viewMode = viewMode;
      if (kind !== undefined) body.kind = kind;
      return ticktick('POST', '/project', body);
    }

    case 'update_project': {
      const { projectId, ...rest } = args;
      const body = { id: projectId };
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined) body[k] = v;
      }
      return ticktick('POST', `/project/${projectId}`, body);
    }

    case 'delete_project': {
      const { projectId } = args;
      return ticktick('DELETE', `/project/${projectId}`);
    }

    case 'get_task': {
      const { projectId, taskId } = args;
      return ticktick('GET', `/project/${projectId}/task/${taskId}`);
    }

    case 'create_task': {
      const { dueDate, startDate, ...rest } = args;
      const body = { ...rest };
      // Only include dates if provided
      if (dueDate !== undefined && dueDate !== null) body.dueDate = dueDate;
      if (startDate !== undefined && startDate !== null) body.startDate = startDate;
      return ticktick('POST', '/task', body);
    }

    case 'update_task': {
      // CRITICAL: dueDate null → omit field entirely (clears in TickTick)
      //           dueDate string → include (sets due date)
      //           dueDate undefined → omit (preserves existing value)
      const { taskId, projectId, dueDate, startDate, ...rest } = args;
      const body = { id: taskId, projectId };
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined) body[k] = v;
      }
      if (dueDate !== undefined && dueDate !== null) body.dueDate = dueDate;
      if (startDate !== undefined && startDate !== null) body.startDate = startDate;
      return ticktick('POST', `/task/${taskId}`, body);
    }

    case 'complete_task': {
      const { projectId, taskId } = args;
      return ticktick('POST', `/project/${projectId}/task/${taskId}/complete`);
    }

    case 'delete_task': {
      const { projectId, taskId } = args;
      return ticktick('DELETE', `/project/${projectId}/task/${taskId}`);
    }

    case 'get_closed_tasks': {
      const params = new URLSearchParams();
      if (args.projectId) params.set('projectId', args.projectId);
      // TickTick API accepts ISO 8601 strings e.g. "2026-03-23T00:00:00+0000"
      if (args.from) params.set('from', args.from);
      if (args.to) params.set('to', args.to);
      if (args.limit) params.set('limit', String(args.limit));
      const qs = params.toString();
      // Correct endpoint is /project/all/completed
      const result = await ticktick('GET', `/project/all/completed${qs ? '?' + qs : ''}`);
      // Return empty array instead of null when no completed tasks exist
      return result ?? [];
    }

    case 'get_tags': {
      return ticktick('GET', '/tag');
    }

    case 'get_user_statistics': {
      return ticktick('GET', '/user/statistics');
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── MCP Tool Definitions ─────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'get_projects',
    description: 'List all TickTick projects (inboxes, lists, folders).',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_project',
    description: 'Get a single TickTick project by ID.',
    inputSchema: {
      type: 'object',
      properties: { projectId: { type: 'string', description: 'Project ID' } },
      required: ['projectId'],
    },
  },
  {
    name: 'get_project_data',
    description: 'Get all tasks and columns within a project.',
    inputSchema: {
      type: 'object',
      properties: { projectId: { type: 'string', description: 'Project ID' } },
      required: ['projectId'],
    },
  },
  {
    name: 'create_project',
    description: 'Create a new TickTick project/list.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        color: { type: 'string', description: 'Hex color e.g. #FF0000' },
        viewMode: { type: 'string', enum: ['list', 'kanban', 'timeline'], description: 'View mode' },
        kind: { type: 'string', enum: ['TASK', 'NOTE'], description: 'Project kind' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_project',
    description: 'Update a TickTick project.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        name: { type: 'string' },
        color: { type: 'string' },
        viewMode: { type: 'string', enum: ['list', 'kanban', 'timeline'] },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'delete_project',
    description: 'Delete a TickTick project.',
    inputSchema: {
      type: 'object',
      properties: { projectId: { type: 'string', description: 'Project ID' } },
      required: ['projectId'],
    },
  },
  {
    name: 'get_task',
    description: 'Get a single task by project and task ID.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        taskId: { type: 'string', description: 'Task ID' },
      },
      required: ['projectId', 'taskId'],
    },
  },
  {
    name: 'create_task',
    description: 'Create a new task in TickTick.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        projectId: { type: 'string', description: 'Project ID (omit for Inbox)' },
        content: { type: 'string', description: 'Task description/notes' },
        priority: { type: 'integer', enum: [0, 1, 3, 5], description: '0=none, 1=low, 3=medium, 5=high' },
        dueDate: { type: 'string', description: 'Due date in ISO 8601 format e.g. 2024-12-31T23:59:59+0000' },
        startDate: { type: 'string', description: 'Start date in ISO 8601 format' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tag names' },
        isAllDay: { type: 'boolean', description: 'Whether it is an all-day task' },
        timeZone: { type: 'string', description: 'Timezone e.g. America/New_York' },
      },
      required: ['title'],
    },
  },
  {
    name: 'update_task',
    description: 'Update an existing task. Pass dueDate: null to CLEAR the due date (removes it entirely). Pass dueDate: "ISO string" to set it. Omit dueDate to leave it unchanged.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task ID' },
        projectId: { type: 'string', description: 'Project ID the task belongs to' },
        title: { type: 'string' },
        content: { type: 'string' },
        priority: { type: 'integer', enum: [0, 1, 3, 5] },
        dueDate: {
          description: 'ISO 8601 string to set due date, null to CLEAR it, omit to leave unchanged',
          oneOf: [{ type: 'string' }, { type: 'null' }],
        },
        startDate: {
          description: 'ISO 8601 string to set start date, null to CLEAR it, omit to leave unchanged',
          oneOf: [{ type: 'string' }, { type: 'null' }],
        },
        tags: { type: 'array', items: { type: 'string' } },
        isAllDay: { type: 'boolean' },
        timeZone: { type: 'string' },
      },
      required: ['taskId', 'projectId'],
    },
  },
  {
    name: 'complete_task',
    description: 'Mark a task as complete.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        taskId: { type: 'string', description: 'Task ID' },
      },
      required: ['projectId', 'taskId'],
    },
  },
  {
    name: 'delete_task',
    description: 'Permanently delete a task.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        taskId: { type: 'string', description: 'Task ID' },
      },
      required: ['projectId', 'taskId'],
    },
  },
  {
    name: 'get_closed_tasks',
    description: 'Get completed/closed tasks, optionally filtered by project and date range. Returns an empty array if no tasks match.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Filter by project ID' },
        from: { type: 'string', description: 'Start of date range as ISO 8601 string, e.g. 2026-03-23T00:00:00+0000' },
        to: { type: 'string', description: 'End of date range as ISO 8601 string, e.g. 2026-03-23T23:59:59+0000' },
        limit: { type: 'integer', description: 'Max results (default 20)' },
      },
      required: [],
    },
  },
  {
    name: 'get_tags',
    description: 'List all tags in the TickTick account.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_user_statistics',
    description: 'Get user productivity statistics from TickTick.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
];

// ─── MCP Protocol Handler ─────────────────────────────────────────────────────

function mcpError(code, message, id) {
  return {
    jsonrpc: '2.0',
    id: id ?? null,
    error: { code, message },
  };
}

function mcpResult(result, id) {
  return {
    jsonrpc: '2.0',
    id,
    result,
  };
}

async function handleMcpRequest(req) {
  const { jsonrpc, method, params, id } = req;

  if (jsonrpc !== '2.0') {
    return mcpError(-32600, 'Invalid JSON-RPC version', id);
  }

  try {
    switch (method) {
      case 'initialize':
        return mcpResult({
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'ticktick-mcp', version: '1.0.0' },
        }, id);

      case 'notifications/initialized':
        return null; // notification, no response

      case 'ping':
        return mcpResult({}, id);

      case 'tools/list':
        return mcpResult({ tools: TOOLS }, id);

      case 'tools/call': {
        const toolName = params?.name;
        const toolArgs = params?.arguments ?? {};
        if (!toolName) return mcpError(-32602, 'Missing tool name', id);

        const data = await handleToolCall(toolName, toolArgs);
        return mcpResult({
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        }, id);
      }

      default:
        return mcpError(-32601, `Method not found: ${method}`, id);
    }
  } catch (err) {
    return mcpError(-32603, err.message, id);
  }
}

// ─── Netlify Handler ──────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let request;
  try {
    request = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify(mcpError(-32700, 'Parse error', null)),
    };
  }

  const response = await handleMcpRequest(request);

  // Notifications return null — no response body needed
  if (response === null) {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify(response),
  };
};
