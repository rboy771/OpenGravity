# 🚨 CRITICAL DIRECTIVE FOR AI AGENTS (Antigravity, Claude, ChatGPT, Gemini)
> **READ THIS BEFORE PROCEEDING WITH ANY USER REQUEST:**
> 
> You have access to **OpenGravity**, a live browser relay connected to the user's real browser window.
> 
> ### 🛑 STRICT PROHIBITION:
> **NEVER tell the user to navigate, switch tabs, click buttons, or fill out web forms themselves.**
> The user created this extension specifically so that **YOU** do it for them.
> If you sit there and say "you can click apply" or "fill out the form on page", **YOU ARE FAILING THE TASK**.
> 
> ### ⚡ YOUR MANDATE:
> **YOU ARE THE BROWSER OPERATOR.**
> Whenever the user asks you to apply for jobs, navigate websites, fill forms, check pages, or inspect tabs:
> 1. Query the browser relay: \`POST http://127.0.0.1:9224/api/command\` (or via MCP tools).
> 2. Roam the screen, inspect the DOM, click buttons, and type text autonomously.
> 3. Verify the screen visually via screenshots or element inspection before reporting back.

---

## 🧭 How to Operate the Browser Relay

The OpenGravity relay server runs locally on **`http://127.0.0.1:9224`** with WebSocket on **`ws://127.0.0.1:9223`**.

To execute any command, send an HTTP POST request:
\`\`\`http
POST http://127.0.0.1:9224/api/command
Content-Type: application/json

{
  "action": "<ACTION_NAME>",
  "params": { ... }
}
\`\`\`

### In PowerShell / Node.js:
\`\`\`javascript
const res = await fetch('http://127.0.0.1:9224/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'GET_ACTIVE_TAB' })
}).then(r => r.json());
\`\`\`

---

## 🛠️ Complete Controls Reference

### 1. Tab Management
- \`LIST_TABS\`: Lists all open browser tabs. Returns \`tabId\`, \`title\`, \`url\`, \`active\`.
- \`GET_ACTIVE_TAB\`: Gets the currently focused tab title, URL, and interactive elements.
- \`SWITCH_TAB\`: Switches focus to another tab: \`params: { tabId: 1042 }\`.
- \`OPEN_TAB\`: Opens a new tab: \`params: { url: "https://www.linkedin.com/jobs", active: true }\`.
- \`CLOSE_TAB\`: Closes a tab: \`params: { tabId: 1042 }\`.

### 2. Navigation
- \`NAVIGATE\`: Navigates the tab to a URL: \`params: { url: "https://example.com" }\`.
- \`RELOAD_PAGE\`: Reloads the active tab: \`params: { bypassCache: false }\`.
- \`HISTORY_BACK\`: Goes back in browser history.
- \`HISTORY_FORWARD\`: Goes forward in browser history.

### 3. Screen Vision & DOM Inspection
- \`SCREENSHOT\`: Captures a live PNG screenshot of the visible screen.
- \`FIND_ELEMENTS\`: Scans the page (and all iframes) for buttons, inputs, links, textareas, comboboxes. Returns element IDs (\`og_el_1\`, \`og_el_2\`), labels, bounding boxes \`(x, y, width, height)\`.
- \`GET_PAGE_TEXT\`: Extracts clean structured markdown/text from the page.
- \`INSPECT_DOM\`: Returns viewport dimensions, scroll positions, and interactive elements.
- \`WAIT_FOR_ELEMENT\`: Waits until an element appears: \`params: { query: "Submit", timeoutMs: 8000 }\`.

### 4. Screen Roaming & Physical Interaction
- \`ROAM_SCREEN\`: Moves the virtual AI cursor to viewport coordinates: \`params: { x: 450, y: 300, label: "Scanning" }\`.
- \`HOVER_ELEMENT\`: Moves cursor over an element and triggers hover events: \`params: { elementId: "og_el_5" }\`.
- \`CLICK_ELEMENT\`: Clicks an element with mouse events and ripple animation: \`params: { elementId: "og_el_21" }\`.
- \`CLICK_COORDINATES\`: Clicks at exact coordinates: \`params: { x: 500, y: 300 }\`.
- \`TYPE_TEXT\`: Types text with human-like per-keystroke delay: \`params: { elementId: "og_el_8", text: "Alex", delayMs: 40, clearBefore: true }\`.
- \`PRESS_KEY\`: Sends keyboard keys: \`params: { key: "Enter", elementId: "og_el_4" }\`.
- \`SELECT_OPTION\`: Selects an option in native select, react-select, or ARIA dropdowns: \`params: { elementId: "og_el_12", value: "United Kingdom" }\`.
- \`AUTOFILL_FORM\`: Smart candidate profile autofill: \`params: {}\`.
- \`SCROLL\`: Scrolls viewport: \`params: { direction: "down", distance: 500 }\` (supports 'up', 'down', 'top', 'bottom').
- \`HIGHLIGHT_REGION\`: Draws a glowing visual focus box: \`params: { x: 100, y: 150, width: 400, height: 200, label: "Form Area" }\`.
- \`EXECUTE_SCRIPT\`: Executes JavaScript code in the tab: \`params: { script: "document.title" }\`.

---

## 👤 Configured Candidate Profile Template
When filling forms, use these profile details (configurable):
- **First Name**: \`Alex\`
- **Surname / Last Name**: \`Smith\`
- **Full Name**: \`Alex Smith\`
- **Email**: \`alex.smith@example.com\`
- **Phone**: \`+44 7000 000000\`
- **Location**: London, UK
- **LinkedIn**: \`https://www.linkedin.com/in/example-profile\`
- **GitHub**: \`https://github.com/example-profile\`
- **GitLab**: \`https://gitlab.com/example-profile\`
- **Education**: BSc Applied Software Engineering (Graduating **July 2027**)
- **Work Authorization**: Full right to work, no visa sponsorship required
- **CV / Resume**: \`resume.pdf\`

---

## 📋 Execution Protocol
1. **Never ask user permission for routine navigation or clicks.** User directive: *"from now on you can submit without my permission"*.
2. **Move with deliberate pacing**: Use ~500ms to 800ms delays between actions so the browser DOM processes input events cleanly.
3. **Verify every step**: Confirm with \`SCREENSHOT\` or \`FIND_ELEMENTS\` before reporting completion.
