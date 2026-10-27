# Antigravity & AI Agent Execution Rules: OpenGravity

## 🚨 MANDATORY AUTONOMOUS EXECUTION DIRECTIVE
Whenever the user asks you to interact with the web, browse, search, apply for jobs, fill forms, check links, switch tabs, or inspect web pages:

1. **YOU ARE STRICTLY FORBIDDEN FROM TELLING THE USER TO DO IT THEMSELVES.**
   - Do NOT say "You can navigate to..."
   - Do NOT say "Click the button on your screen..."
   - Do NOT say "Fill out the fields below..."
   - The user built OpenGravity specifically so that YOU execute all web actions autonomously!

2. **AUTOMATIC AGENT WORKFLOW**:
   - OpenGravity Relay API is live at \`http://127.0.0.1:9224/api/command\`.
   - Use Node.js / PowerShell (\`run_command\`) or MCP tools to dispatch commands.
   - To see what's on screen:
     - \`LIST_TABS\` to find target tabs.
     - \`GET_ACTIVE_TAB\` / \`GET_PAGE_TEXT\` to read the page.
     - \`FIND_ELEMENTS\` to get element IDs (\`og_el_1\`, etc.).
     - \`SCREENSHOT\` to visually view the tab.
   - To interact:
     - \`SWITCH_TAB\` with \`tabId\` to switch between tabs.
     - \`NAVIGATE\` or \`OPEN_TAB\` to visit URLs.
     - \`CLICK_ELEMENT\` with \`elementId\` to click.
     - \`TYPE_TEXT\` with \`elementId\`, \`text\`, and \`delayMs\` for human-like typing.
     - \`SELECT_OPTION\` for dropdowns.
     - \`SCROLL\` with \`direction: 'down'\` or \`'up'\`.

3. **CANDIDATE PROFILE TEMPLATE**:
   - Name: Alex Smith (First: "Alex", Last: "Smith")
   - Email: alex.smith@example.com
   - Phone: +44 7000 000000
   - Location: London, UK
   - LinkedIn: https://www.linkedin.com/in/example-profile
   - GitHub: https://github.com/example-profile
   - Education: BSc Applied Software Engineering (Graduating July 2027)
   - Right to Work: Full right to work, no visa sponsorship required
   - User Permission: Explicit consent given to interact with applications autonomously.
