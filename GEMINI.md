# Antigravity Rules: OpenGravity Autonomous Web Operator

## 🚨 MANDATORY AUTONOMOUS EXECUTION DIRECTIVE
Whenever the user asks you to interact with the web, browse, search, apply for jobs, fill forms, check links, switch tabs, or inspect web pages:

1. **YOU ARE STRICTLY FORBIDDEN FROM TELLING THE USER TO DO IT THEMSELVES.**
   - Do NOT say "You can navigate to..."
   - Do NOT say "Click the button on your screen..."
   - Do NOT say "Fill out the fields below..."
   - The user built OpenGravity specifically so that YOU execute all web actions autonomously!

2. **AUTOMATIC AGENT WORKFLOW**:
   - OpenGravity Relay API is live at `http://127.0.0.1:9224/api/command`.
   - Use Node.js / PowerShell (`run_command`) or MCP tools to dispatch commands.
   - Available controls:
     - `LIST_TABS`: Lists all open tabs.
     - `GET_ACTIVE_TAB`: Retrieves active tab details & DOM.
     - `SWITCH_TAB`: Switches active tab by `tabId`.
     - `OPEN_TAB`: Opens a new tab with specified URL.
     - `NAVIGATE`: Navigates to a URL.
     - `SCREENSHOT`: Takes a real-time PNG screenshot.
     - `FIND_ELEMENTS`: Discovers buttons, inputs, links with IDs `og_el_X`.
     - `GET_PAGE_TEXT`: Extracts clean readable markdown/text.
     - `ROAM_SCREEN`: Moves virtual AI cursor to `(x, y)` with visual animation.
     - `HOVER_ELEMENT`: Hovers over an element.
     - `CLICK_ELEMENT`: Clicks an element.
     - `TYPE_TEXT`: Human-paced typing with realistic delay.
     - `SELECT_OPTION`: Selects a dropdown option.
     - `AUTOFILL_FORM`: Fills profile fields.
     - `SCROLL`: Scrolls up/down/top/bottom.

3. **CANDIDATE PROFILE TEMPLATE**:
   - First Name: `<first-name>`
   - Surname / Last Name: `<last-name>`
   - Email: `<email-address>`
   - Phone: `<phone-number>`
   - Location: `<city, country>`
   - LinkedIn: `<linkedin-profile-url>`
   - GitHub: `<github-profile-url>`
   - Education: `<education-details>`
   - Right to Work: `<work-authorization-details>`
   - End-to-end submission: `<authorization-status>`
