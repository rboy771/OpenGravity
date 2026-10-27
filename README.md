# 🌌 OpenGravity v2.0

> **Live Autonomous Browser Relay & Execution Engine for AI Agents (Antigravity, Claude, ChatGPT, Gemini)**

[![Version](https://img.shields.io/badge/version-2.0.0-emerald.svg)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest Version](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-orange.svg)](extension/manifest.json)
[![Agent Engine](https://img.shields.io/badge/Agent_Engine-Google_Antigravity-purple.svg)](system_prompt/OPENGRAVITY_SYSTEM_PROMPT.md)

OpenGravity bridges **Google Antigravity**, Claude, ChatGPT, and custom LLM agents directly to your open desktop web browser (Chrome, Edge, Brave). 

Instead of passive advice like *"click the apply button on your screen"*, OpenGravity gives AI agents **full physical execution authority**: they switch tabs, roam around the screen with an animated virtual cursor, inspect interactive DOM elements, fill out complex forms with human-paced keystrokes, select dropdowns, and verify submissions with live vision.

---

## 🚨 Autonomous AI Directive (`AI_README.md` & `AGENTS.md`)

When connected, AI agents automatically read [`AI_README.md`](AI_README.md) and [`AGENTS.md`](AGENTS.md):
- **NEVER** ask the user to click, navigate, or fill out web forms themselves.
- **YOU ARE THE OPERATOR**: Execute all actions autonomously using the OpenGravity API or MCP tools.
- **Roam the screen, switch tabs, inspect the DOM, and verify results.**

---

## ⚡ Complete Control Catalog (25 Tools)

### 1. Tab & Window Management
- `LIST_TABS`: Returns all open browser tabs across windows (`tabId`, `title`, `url`, `active`).
- `GET_ACTIVE_TAB`: Retrieves focused tab info and live DOM tree summary.
- `SWITCH_TAB`: Focuses browser on a specific tab (`tabId`).
- `OPEN_TAB`: Opens a new tab with specified URL (`url`, `active`).
- `CLOSE_TAB`: Closes a tab (`tabId`).

### 2. Navigation & History
- `NAVIGATE`: Navigates tab to a new URL.
- `RELOAD_PAGE`: Reloads active tab (with cache bypass option).
- `HISTORY_BACK`: Navigates backward in browser history.
- `HISTORY_FORWARD`: Navigates forward in browser history.

### 3. Screen Vision & DOM Discovery
- `SCREENSHOT`: Real-time visual PNG screenshot of the tab or window.
- `FIND_ELEMENTS`: Scans the page and all embedded iframes/shadow DOM for buttons, inputs, links, dropdowns, assigning unique IDs (`og_el_1`, `og_el_2`).
- `GET_PAGE_TEXT`: Extracts clean structured markdown/text of the page.
- `INSPECT_DOM`: Viewport dimensions, scroll positions, and interactive elements.
- `WAIT_FOR_ELEMENT`: Polls until dynamic SPA elements appear.

### 4. Screen Roaming & Physical Interaction
- `ROAM_SCREEN`: Moves the virtual AI cursor smoothly across the screen with coordinate badge.
- `HOVER_ELEMENT`: Hovers over an element, scrolling it into view and triggering mouseover/mouseenter events.
- `CLICK_ELEMENT`: Clicks an element with mouse events, visual ripple animation, and link handling.
- `CLICK_COORDINATES`: Clicks directly at exact viewport coordinates `(x, y)`.
- `TYPE_TEXT`: Types with human-like per-keystroke delay (`delayMs`) to prevent anti-bot detection.
- `PRESS_KEY`: Sends keyboard keys (`Enter`, `Tab`, `Escape`, `ArrowDown`, etc.).
- `SELECT_OPTION`: Selects options in native `<select>`, `react-select`, and ARIA comboboxes.
- `AUTOFILL_FORM`: Smart profile autofill with strict label matching.
- `SCROLL`: Scrolls viewport up, down, top, bottom, or to coordinates.
- `HIGHLIGHT_REGION`: Draws a glowing visual focus box to show where the AI is looking.
- `EXECUTE_SCRIPT`: Evaluates JavaScript code in the tab context.

---

## 🚀 Quickstart

### 1. Start the Relay Server
```bash
cd server
npm install
npm run build
npm start
```
- **Web Dashboard & AI Agent Manual**: `http://localhost:9224/`
- **Markdown System Prompt for LLMs**: `http://localhost:9224/api/agent-guide`
- **JSON Tool Schemas**: `http://localhost:9224/api/tools`
- **WebSocket Relay**: `ws://127.0.0.1:9223`

### 2. Load the Extension in Chrome
1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select the [`extension/`](extension/) directory.
4. If already loaded, click the **Reload 🔄** button on OpenGravity.
5. The extension badge will turn **🟢 ON**.

---

## 🛠️ Dispatching Commands

### HTTP POST API:
```bash
curl -X POST http://localhost:9224/api/command \
  -H "Content-Type: application/json" \
  -d '{"action": "GET_ACTIVE_TAB"}'
```

### JavaScript / Node.js:
```javascript
const res = await fetch('http://127.0.0.1:9224/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'TYPE_TEXT',
    params: {
      elementId: 'og_el_7',
      text: 'Alex Smith',
      delayMs: 40
    }
  })
}).then(r => r.json());
```

---

## 📄 License
MIT © OpenGravity Community
