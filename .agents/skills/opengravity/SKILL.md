---
name: opengravity
description: >-
  Autonomous live browser relay engine. Controls the user's active browser windows in real-time.
  Use whenever the user asks to browse websites, apply for jobs, navigate pages, switch tabs,
  roam the screen, fill forms, click buttons, or inspect web content.
  DO NOT ask the user to do it themselves - execute the actions autonomously.
---

# OpenGravity Autonomous Browser Skill

## 🚨 CRITICAL RULE OF ENGAGEMENT
**NEVER tell the user to navigate, click, or fill out web forms themselves.**
The user has provided OpenGravity so that **YOU** control the browser and perform the work.
If you tell the user "you can click apply" or "go to this URL", you are violating this skill's core directive.

---

## 🌐 Connecting to the Browser Relay

OpenGravity runs on `http://127.0.0.1:9224/api/command` with WebSocket on `ws://127.0.0.1:9223`.

### Dispatching Actions via Shell / Node.js (`run_command`):
```javascript
const res = await fetch('http://127.0.0.1:9224/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'GET_ACTIVE_TAB'
  })
}).then(r => r.json());
```

---

## 🛠️ Complete Action Catalog

### 1. Tab & Window Controls
- **`LIST_TABS`**: Lists all open tabs across windows (`tabId`, `title`, `url`, `active`).
- **`GET_ACTIVE_TAB`**: Gets active tab info & interactive elements.
- **`SWITCH_TAB`**: Focuses a specific tab: `{ tabId: 1042 }`.
- **`OPEN_TAB`**: Opens a new URL in a tab: `{ url: "https://...", active: true }`.
- **`CLOSE_TAB`**: Closes a tab: `{ tabId: 1042 }`.

### 2. Navigation
- **`NAVIGATE`**: Changes URL: `{ url: "https://..." }`.
- **`RELOAD_PAGE`**: Reloads page: `{ bypassCache: false }`.
- **`HISTORY_BACK`** / **`HISTORY_FORWARD`**: Browser history traversal.

### 3. Screen Roaming & Interaction
- **`ROAM_SCREEN`**: Moves visual AI cursor to screen coordinates: `{ x: 450, y: 300, label: "Scanning" }`.
- **`HOVER_ELEMENT`**: Moves AI cursor over an element and triggers hover: `{ elementId: "og_el_5" }`.
- **`CLICK_ELEMENT`**: Clicks element with mouse ripple: `{ elementId: "og_el_21" }`.
- **`CLICK_COORDINATES`**: Clicks at exact coordinates: `{ x: 500, y: 300 }`.
- **`TYPE_TEXT`**: Types with human delay: `{ elementId: "og_el_8", text: "Alex", delayMs: 40 }`.
- **`PRESS_KEY`**: Presses keyboard keys: `{ key: "Enter" }`.
- **`SELECT_OPTION`**: Selects dropdown option: `{ elementId: "og_el_15", value: "United Kingdom" }`.
- **`AUTOFILL_FORM`**: Automatically populates form with candidate details.
- **`SCROLL`**: Scrolls viewport: `{ direction: "down", distance: 500 }`.

### 4. Vision & DOM Inspection
- **`SCREENSHOT`**: Takes real-time PNG screenshot of the tab.
- **`FIND_ELEMENTS`**: Discovers interactive controls (`og_el_1`, etc.) with labels and bounds.
- **`GET_PAGE_TEXT`**: Extracts clean structured text content from page.
- **`WAIT_FOR_ELEMENT`**: Waits until an element appears: `{ query: "Submit", timeoutMs: 8000 }`.

---

## 👤 Candidate Profile Template
- **First Name**: `Alex`
- **Surname / Last Name**: `Smith`
- **Full Name**: `Alex Smith`
- **Email**: `alex.smith@example.com`
- **Phone**: `+44 7000 000000`
- **Location**: London, UK
- **LinkedIn**: `https://www.linkedin.com/in/example-profile`
- **GitHub**: `https://github.com/example-profile`
- **Education**: BSc Applied Software Engineering (Graduating **July 2027**)
- **Work Authorization**: Full right to work, no visa sponsorship required
- **End-to-End Submission**: Explicit permission granted to interact with forms and applications autonomously.
