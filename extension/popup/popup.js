document.addEventListener('DOMContentLoaded', () => {
  const badge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');
  const serverUrl = document.getElementById('serverUrl');
  const activeTabTitle = document.getElementById('activeTabTitle');
  const activeTabUrl = document.getElementById('activeTabUrl');

  const reconnectBtn = document.getElementById('reconnectBtn');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const openDashboardBtn = document.getElementById('openDashboardBtn');
  const testRoamBtn = document.getElementById('testRoamBtn');

  function updateUI() {
    // 1. Get Extension Background Status
    chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        badge.innerText = 'OFFLINE';
        badge.className = 'badge disconnected';
        statusText.innerText = 'Extension service worker not active. Click below to reconnect.';
        return;
      }

      if (response.connected) {
        badge.innerText = 'CONNECTED';
        badge.className = 'badge connected';
        statusText.innerText = '🟢 Live relay active. AI agents have full autonomous control to roam, click, type, and switch tabs.';
      } else {
        badge.innerText = 'DISCONNECTED';
        badge.className = 'badge disconnected';
        statusText.innerText = '🔴 Disconnected from OpenGravity Relay Server. Ensure server is running at ws://127.0.0.1:9223';
      }

      if (response.serverUrl) {
        serverUrl.innerText = response.serverUrl;
      }
    });

    // 2. Fetch Active Tab Details
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        activeTabTitle.innerText = tabs[0].title || 'Untitled Tab';
        activeTabUrl.innerText = tabs[0].url || '';
      }
    });
  }

  // Reconnect
  reconnectBtn.addEventListener('click', () => {
    badge.innerText = 'CONNECTING';
    badge.className = 'badge';
    statusText.innerText = 'Connecting to OpenGravity server...';
    chrome.runtime.sendMessage({ action: 'RECONNECT' }, () => {
      setTimeout(updateUI, 1200);
    });
  });

  // Copy AI System Prompt / Instructions
  copyPromptBtn.addEventListener('click', async () => {
    const aiPrompt = `[CRITICAL DIRECTIVE FOR AI AGENTS (Antigravity / Claude / ChatGPT)]
You have direct, real-time live browser execution capability via the OpenGravity Browser Relay at http://localhost:9224/api/command and WebSocket ws://127.0.0.1:9223.

RULES OF ENGAGEMENT:
1. NEVER tell the user to navigate, click, or fill out web forms themselves.
2. YOU ARE THE BROWSER OPERATOR. Execute all actions autonomously using the OpenGravity API.
3. AVAILABLE CONTROLS:
   - Tab Management: LIST_TABS, GET_ACTIVE_TAB, SWITCH_TAB, OPEN_TAB, CLOSE_TAB
   - Navigation: NAVIGATE, RELOAD_PAGE, HISTORY_BACK, HISTORY_FORWARD
   - Vision & Inspection: SCREENSHOT, FIND_ELEMENTS, GET_PAGE_TEXT, INSPECT_DOM
   - Roaming & Interaction: ROAM_SCREEN, HOVER_ELEMENT, CLICK_ELEMENT, CLICK_COORDINATES, TYPE_TEXT, PRESS_KEY, SELECT_OPTION, AUTOFILL_FORM, SCROLL
4. DISPATCH FORMAT:
   POST http://localhost:9224/api/command
   Content-Type: application/json
   {"action": "<ACTION_NAME>", "params": {...}}
5. Full documentation & tools schema: http://localhost:9224/`;

    await navigator.clipboard.writeText(aiPrompt);
    copyPromptBtn.innerText = '✅ Copied!';
    setTimeout(() => { copyPromptBtn.innerText = '📋 Copy AI Prompt'; }, 2000);
  });

  // Open Dashboard
  openDashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:9224/' });
  });

  // Test Roam Cursor
  testRoamBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const tabId = tabs[0].id;
        testRoamBtn.innerText = 'Roaming...';
        
        // Sweep virtual cursor across screen
        let step = 0;
        const interval = setInterval(() => {
          step++;
          const x = 150 + Math.sin(step * 0.6) * 120 + step * 30;
          const y = 200 + Math.cos(step * 0.6) * 90;
          chrome.tabs.sendMessage(tabId, {
            action: 'ROAM_SCREEN',
            params: { x: Math.round(x), y: Math.round(y), label: 'Test Sweep' }
          });

          if (step >= 8) {
            clearInterval(interval);
            testRoamBtn.innerText = '✨ Test Screen Roam';
          }
        }, 150);
      }
    });
  });

  updateUI();
  setInterval(updateUI, 2500);
});
