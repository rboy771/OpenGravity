/**
 * OpenGravity AI Agent Manual & Interactive Dashboard Generator
 * Embedded system prompt, operational manual, and live dashboard HTML.
 */

import { OPENGRAVITY_TOOLS } from './tools-schema.js';

export const OPENGRAVITY_AGENT_MANUAL = `# 🚨 OPENGRAVITY AUTONOMOUS AGENT PROTOCOL v2.0
> **CRITICAL DIRECTIVE FOR ALL CONNECTED AI AGENTS (Antigravity, Claude, ChatGPT, Gemini):**
> 
> **YOU HAVE DIRECT, REAL-TIME PHYSICAL BROWSER EXECUTION CAPABILITIES VIA OPENGRAVITY.**
> 
> **STRICT PROHIBITION: NEVER tell the user to navigate, switch tabs, click buttons, or fill out forms manually.**
> **YOU WERE GIVEN THIS EXTENSION SPECIFICALLY SO YOU DO IT YOURSELF.**
> **DO NOT SIT IDLE. DO NOT SAY "YOU CAN CLICK APPLY". YOU MUST CLICK APPLY.**
> **YOU ARE THE OPERATOR. ROAM THE SCREEN, SWITCH TABS, INSPECT THE DOM, AND EXECUTE ACTIONS AUTONOMOUSLY.**

---

## 🌐 1. Connection Architecture

- **HTTP API Endpoint**: \`http://127.0.0.1:9224/api/command\`
- **WebSocket Relay**: \`ws://127.0.0.1:9223\`
- **MCP Bridge**: Available via \`node dist/index.js --mcp\` or Antigravity MCP \`call_mcp_tool\`

### Request Format:
\`\`\`http
POST http://127.0.0.1:9224/api/command
Content-Type: application/json

{
  "action": "<COMMAND_NAME>",
  "params": { ... }
}
\`\`\`

---

## 🧭 2. Autonomous Operating Loop (Execute Every Turn)

When given a browser or web-related objective (e.g. "find software jobs and apply", "check this site", "fill this form"):

1. **OBSERVE & ORIENT**:
   - Check open tabs: \`POST /api/command\` with \`action: "LIST_TABS"\`.
   - Inspect active tab: \`action: "GET_ACTIVE_TAB"\` or \`action: "GET_PAGE_TEXT"\`.
   - View the screen: \`action: "SCREENSHOT"\`.
   
2. **NAVIGATE & ROAM**:
   - If you need a new page or tab: \`action: "NAVIGATE", params: { url: "..." }\` or \`action: "OPEN_TAB", params: { url: "..." }\`.
   - If the user already opened a tab in Chrome, find its \`tabId\` via \`LIST_TABS\` and switch to it: \`action: "SWITCH_TAB", params: { tabId: ... }\`.
   - Roam the screen: \`action: "ROAM_SCREEN", params: { x: 500, y: 300, label: "Scanning" }\`.

3. **DISCOVER ELEMENTS**:
   - Call \`action: "FIND_ELEMENTS"\` to index all buttons, inputs, links, and dropdowns.
   - Elements are indexed with unique IDs like \`og_el_1\`, \`og_el_2\`.
   - Check bounding boxes, labels, and types.

4. **INTERACT WITH HUMAN-PACED PRECISION**:
   - **Click**: \`action: "CLICK_ELEMENT", params: { elementId: "og_el_X" }\`.
   - **Type**: \`action: "TYPE_TEXT", params: { elementId: "og_el_X", text: "...", delayMs: 40 }\`. (Uses human keystrokes to prevent bot flags).
   - **Dropdowns**: \`action: "SELECT_OPTION", params: { elementId: "og_el_X", value: "..." }\`.
   - **Scroll**: \`action: "SCROLL", params: { direction: "down", distance: 500 }\`.

5. **VERIFY**:
   - Take a screenshot or call \`FIND_ELEMENTS\` to ensure the form advanced, modal closed, or confirmation screen appeared.
   - A task is ONLY complete when you observe explicit confirmation UI (e.g. "Submitted", "Thank you for applying", or confirmation URL).

---

## 🛠️ 3. Complete Command Reference

| Action | Description | Key Parameters |
| :--- | :--- | :--- |
| **LIST_TABS** | Lists all open tabs across windows | none |
| **GET_ACTIVE_TAB** | Gets active tab info & DOM summary | none |
| **SWITCH_TAB** | Focuses browser on a specific tab | \`tabId\` (number) |
| **OPEN_TAB** | Opens a new URL in a new tab | \`url\` (string), \`active\` (bool) |
| **CLOSE_TAB** | Closes a tab | \`tabId\` (number) |
| **NAVIGATE** | Navigates tab to URL | \`url\` (string), \`tabId\` (optional) |
| **RELOAD_PAGE** | Reloads tab | \`tabId\` (optional) |
| **SCREENSHOT** | Captures real-time PNG base64 | \`tabId\` (optional) |
| **FIND_ELEMENTS** | Indexes interactive controls on page | \`query\` (string filter) |
| **GET_PAGE_TEXT** | Extracts clean markdown text | \`maxLength\` (number) |
| **ROAM_SCREEN** | Moves virtual AI cursor to (x, y) | \`x\`, \`y\`, \`label\` |
| **HOVER_ELEMENT** | Hovers over an element | \`elementId\` (string) |
| **CLICK_ELEMENT** | Clicks element with mouse ripple | \`elementId\` (string) |
| **CLICK_COORDINATES** | Clicks at exact viewport coordinates | \`x\`, \`y\` |
| **TYPE_TEXT** | Types text with human delay | \`elementId\`, \`text\`, \`delayMs\` |
| **PRESS_KEY** | Presses keyboard key | \`key\` (e.g. "Enter", "Tab") |
| **SELECT_OPTION** | Selects dropdown option | \`elementId\`, \`value\` |
| **AUTOFILL_FORM** | Smart candidate profile autofill | \`profile\` (optional overrides) |
| **SCROLL** | Scrolls viewport | \`direction\` ('up','down','top','bottom') |
| **HIGHLIGHT_REGION** | Visual glowing AI focus box | \`x\`, \`y\`, \`width\`, \`height\`, \`label\` |
| **WAIT_FOR_ELEMENT** | Waits for dynamic element | \`query\`, \`timeoutMs\` |
| **EXECUTE_SCRIPT** | Evaluates JavaScript in tab | \`script\` (string) |

---

## 👤 4. Candidate Identity Template (Configurable)
When completing job applications or user forms, use configured candidate details:
- **First Name**: \`Alex\`
- **Surname / Last Name**: \`Smith\`
- **Full Name**: \`Alex Smith\`
- **Email**: \`alex.smith@example.com\`
- **Phone**: \`+44 7000 000000\`
- **Location**: London, UK
- **LinkedIn**: \`https://www.linkedin.com/in/example-profile\`
- **GitHub**: \`https://github.com/example-profile\`
- **GitLab**: \`https://gitlab.com/example-profile\`
- **Education**: BSc Applied Software Engineering (Graduating July 2027)
- **Work Authorization**: Full right to work, no visa sponsorship needed
- **CV / Resume**: \`resume.pdf\`
`;

export function generateHtmlDashboard(status: { isConnected: boolean; wsPort: number; httpPort: number }): string {
  const toolsJson = JSON.stringify(OPENGRAVITY_TOOLS, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenGravity v2.0 - AI Browser Agent Control Center</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --border: rgba(255, 255, 255, 0.08);
      --emerald: #10b981;
      --mint: #34d399;
      --sky: #38bdf8;
      --rose: #f43f5e;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 24px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .status-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-badge.online {
      background: rgba(16, 185, 129, 0.15);
      color: var(--mint);
      border: 1px solid var(--emerald);
    }
    .status-badge.offline {
      background: rgba(244, 63, 94, 0.15);
      color: var(--rose);
      border: 1px solid var(--rose);
    }
    .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .card h2 { font-size: 18px; margin-bottom: 12px; color: var(--sky); display: flex; align-items: center; gap: 8px; }
    .callout-box {
      background: rgba(16, 185, 129, 0.08);
      border-left: 4px solid var(--emerald);
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .callout-box h3 { color: var(--mint); font-size: 14px; margin-bottom: 6px; }
    .callout-box p { font-size: 13px; color: var(--text-muted); }
    .btn {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 10px 18px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn:hover { background: #1d4ed8; }
    .btn-emerald { background: var(--emerald); }
    .btn-emerald:hover { background: #059669; }
    .tool-item {
      border-bottom: 1px solid var(--border);
      padding: 12px 0;
    }
    .tool-item:last-child { border-bottom: none; }
    .tool-name { font-weight: 700; color: var(--mint); font-family: monospace; font-size: 14px; }
    .tool-desc { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
    pre {
      background: #060911;
      padding: 14px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      color: #cbd5e1;
      overflow-x: auto;
      border: 1px solid var(--border);
    }
    .endpoint-badge {
      background: rgba(56, 189, 248, 0.15);
      color: var(--sky);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-family: monospace;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <span style="font-size: 28px;">🌌</span>
        <div>
          <h1>OpenGravity Agent Hub</h1>
          <p style="font-size: 12px; color: var(--text-muted);">Autonomous Browser Relay & AI Execution Engine v2.0</p>
        </div>
      </div>
      <div class="status-badge ${status.isConnected ? 'online' : 'offline'}">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: currentColor;"></span>
        ${status.isConnected ? 'Extension Connected & Ready' : 'Waiting for Extension Connection'}
      </div>
    </header>

    <div class="callout-box">
      <h3>🚨 CRITICAL DIRECTIVE FOR CONNECTED AI AGENTS</h3>
      <p>You have full, direct browser access via OpenGravity. <strong>NEVER tell the user to click, navigate, or fill out web forms themselves.</strong> You are the operator. Roam the screen, switch tabs, inspect DOM, type, click, and verify results autonomously!</p>
    </div>

    <div class="grid">
      <div>
        <div class="card">
          <h2>🛠️ Available Browser Controls (${OPENGRAVITY_TOOLS.length} Tools)</h2>
          <div style="max-height: 520px; overflow-y: auto; padding-right: 8px;">
            ${OPENGRAVITY_TOOLS.map(t => `
              <div class="tool-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span class="tool-name">${t.action}</span>
                  <span class="endpoint-badge">${t.category}</span>
                </div>
                <div class="tool-desc">${t.description}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <h2>📡 API Endpoints for AI Introspection</h2>
          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
            <div><span class="endpoint-badge">GET /api/agent-guide</span> - Pure Markdown operational manual for LLMs to ingest</div>
            <div><span class="endpoint-badge">GET /api/tools</span> - JSON array of all tool definitions & schemas</div>
            <div><span class="endpoint-badge">GET /api/openapi.json</span> - Complete OpenAPI 3.0 specification</div>
            <div><span class="endpoint-badge">POST /api/command</span> - Dispatch action to browser ({ action: "...", params: { ... } })</div>
          </div>
        </div>
      </div>

      <div>
        <div class="card">
          <h2>📋 Copy AI System Prompt</h2>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">Copy this directive and paste it into Antigravity, Claude, or ChatGPT to instantly grant them browser autonomy.</p>
          <button class="btn btn-emerald" style="width: 100%; margin-bottom: 14px;" onclick="copyPrompt()">Copy Complete AI Manual</button>
          <pre id="promptPreview" style="max-height: 250px;">${OPENGRAVITY_AGENT_MANUAL.slice(0, 500)}...</pre>
        </div>

        <div class="card">
          <h2>🚀 Quick Dispatch Example</h2>
          <pre>curl -X POST http://localhost:9224/api/command \\
  -H "Content-Type: application/json" \\
  -d '{"action": "GET_ACTIVE_TAB"}'</pre>
        </div>
      </div>
    </div>
  </div>

  <script>
    function copyPrompt() {
      fetch('/api/agent-guide')
        .then(r => r.text())
        .then(text => {
          navigator.clipboard.writeText(text);
          alert('✅ AI Agent Manual copied to clipboard! Paste this to your AI agent.');
        });
    }
  </script>
</body>
</html>`;
}
