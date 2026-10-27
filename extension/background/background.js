/**
 * OpenGravity Background Service Worker v2.0.0
 * Manages browser tab lifecycle, WebSocket relay link, and content script coordination.
 * 
 * Supports:
 * - Tab Management: LIST_TABS, GET_ACTIVE_TAB, SWITCH_TAB, OPEN_TAB, CLOSE_TAB
 * - Navigation: NAVIGATE, RELOAD_PAGE, HISTORY_BACK, HISTORY_FORWARD
 * - Visual Capture: SCREENSHOT
 * - Dynamic Script Execution: EXECUTE_SCRIPT, GET_FRAMES
 * - Action Forwarding: ROAM_SCREEN, HOVER_ELEMENT, CLICK_ELEMENT, TYPE_TEXT, PRESS_KEY, SELECT_OPTION, AUTOFILL_FORM, etc.
 */

const SERVER_URL = 'ws://127.0.0.1:9223';
let socket = null;
let isConnected = false;
let reconnectTimer = null;
let heartbeatInterval = null;

function connectRelayServer() {
  if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
    return;
  }

  console.log('[OpenGravity Relay] Connecting to server at', SERVER_URL);
  
  try {
    socket = new WebSocket(SERVER_URL);

    socket.onopen = () => {
      console.log('[OpenGravity Relay] Connected to Relay Server');
      isConnected = true;
      updateBadge('ON', '#10B981');
      broadcastState({ connected: true });

      sendMsg({
        type: 'HANDSHAKE',
        extensionVersion: '2.0.0',
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        capabilities: [
          'LIST_TABS', 'GET_ACTIVE_TAB', 'SWITCH_TAB', 'OPEN_TAB', 'CLOSE_TAB',
          'NAVIGATE', 'RELOAD_PAGE', 'HISTORY_BACK', 'HISTORY_FORWARD', 'SCREENSHOT',
          'FIND_ELEMENTS', 'ROAM_SCREEN', 'MOVE_MOUSE', 'HOVER_ELEMENT', 'CLICK_ELEMENT',
          'CLICK_COORDINATES', 'TYPE_TEXT', 'PRESS_KEY', 'SELECT_OPTION', 'AUTOFILL_FORM',
          'GET_PAGE_TEXT', 'WAIT_FOR_ELEMENT', 'HIGHLIGHT_REGION', 'SCROLL', 'INSPECT_DOM',
          'EXECUTE_SCRIPT', 'GET_FRAMES'
        ]
      });

      startHeartbeat();
    };

    socket.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'PONG') return;
        await handleServerCommand(payload);
      } catch (err) {
        console.error('[OpenGravity Relay] Error processing message:', err);
      }
    };

    socket.onclose = () => {
      isConnected = false;
      stopHeartbeat();
      updateBadge('OFF', '#EF4444');
      broadcastState({ connected: false });
      scheduleReconnect();
    };

    socket.onerror = (err) => {
      console.error('[OpenGravity Relay] WebSocket Error:', err);
      socket.close();
    };
  } catch (err) {
    console.error('[OpenGravity Relay] Exception setting up WebSocket:', err);
    scheduleReconnect();
  }
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'PING', timestamp: Date.now() }));
    }
  }, 4000);
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

function scheduleReconnect() {
  if (!reconnectTimer) {
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connectRelayServer();
    }, 2500);
  }
}

function sendMsg(obj) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(obj));
  }
}

function updateBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

function broadcastState(state) {
  chrome.storage.local.set({ opengravity_state: state });
}

async function handleServerCommand(cmd) {
  const { requestId, action, params } = cmd;

  try {
    let result = null;

    switch (action) {
      // 1. Tab Management
      case 'LIST_TABS':
        result = await handleListTabs();
        break;

      case 'GET_ACTIVE_TAB':
        result = await handleGetActiveTab();
        break;

      case 'SWITCH_TAB':
        result = await handleSwitchTab(params?.tabId);
        break;

      case 'OPEN_TAB':
        result = await handleOpenTab(params?.url, params?.active !== false);
        break;

      case 'CLOSE_TAB':
        result = await handleCloseTab(params?.tabId);
        break;

      // 2. Navigation
      case 'NAVIGATE':
        result = await handleNavigate(params?.url, params?.tabId);
        break;

      case 'RELOAD_PAGE':
        result = await handleReloadPage(params?.tabId, params?.bypassCache);
        break;

      case 'HISTORY_BACK':
        result = await handleHistory(params?.tabId, -1);
        break;

      case 'HISTORY_FORWARD':
        result = await handleHistory(params?.tabId, 1);
        break;

      // 3. Vision & Execution
      case 'SCREENSHOT':
        result = await handleScreenshot(params?.tabId);
        break;

      case 'GET_FRAMES':
        result = await handleGetFrames(params?.tabId);
        break;

      case 'EXECUTE_SCRIPT':
        result = await handleExecuteScript(params?.script, params?.tabId);
        break;

      case 'RELOAD':
        chrome.runtime.reload();
        result = { status: 'reloading' };
        break;

      // 4. Content Script Actions (Roaming, Clicking, Typing, Selecting, Inspecting)
      case 'FIND_ELEMENTS':
      case 'ROAM_SCREEN':
      case 'MOVE_MOUSE':
      case 'HOVER_ELEMENT':
      case 'CLICK_ELEMENT':
      case 'CLICK_COORDINATES':
      case 'TYPE_TEXT':
      case 'PRESS_KEY':
      case 'SELECT_OPTION':
      case 'AUTOFILL_FORM':
      case 'SELECT_ALL_DROPDOWNS':
      case 'GET_PAGE_TEXT':
      case 'WAIT_FOR_ELEMENT':
      case 'HIGHLIGHT_REGION':
      case 'SCROLL':
      case 'INSPECT_DOM':
        result = await forwardToContentScript(action, params);
        break;

      default:
        throw new Error(`Unknown OpenGravity action: ${action}`);
    }

    sendMsg({
      type: 'RESPONSE',
      requestId,
      success: true,
      data: result
    });

  } catch (err) {
    console.error(`[OpenGravity Relay] Command ${action} failed:`, err);
    sendMsg({
      type: 'RESPONSE',
      requestId,
      success: false,
      error: err.message || String(err)
    });
  }
}

/* --------------------------------------------------------------------------
   Tab Management Implementations
   -------------------------------------------------------------------------- */

async function handleListTabs() {
  const tabs = await chrome.tabs.query({});
  return tabs.map(t => ({
    tabId: t.id,
    title: t.title,
    url: t.url,
    active: t.active,
    windowId: t.windowId,
    status: t.status,
    favIconUrl: t.favIconUrl
  }));
}

async function handleGetActiveTab() {
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!activeTab) {
    const [fallbackTab] = await chrome.tabs.query({ active: true });
    if (!fallbackTab) throw new Error('No active browser tab found');
    return buildTabResponse(fallbackTab);
  }
  return buildTabResponse(activeTab);
}

async function buildTabResponse(tab) {
  const contentInfo = await forwardToContentScript('INSPECT_DOM', { tabId: tab.id, frameId: 0 }).catch(() => null);
  return {
    tabId: tab.id,
    title: tab.title,
    url: tab.url,
    windowId: tab.windowId,
    domSummary: contentInfo || { note: 'Content script ready' }
  };
}

async function handleSwitchTab(tabId) {
  if (!tabId) throw new Error('Missing tabId parameter for SWITCH_TAB');
  const tab = await chrome.tabs.get(tabId);
  if (!tab) throw new Error(`Tab ${tabId} not found`);

  await chrome.tabs.update(tabId, { active: true });
  await chrome.windows.update(tab.windowId, { focused: true }).catch(() => {});

  return {
    success: true,
    tabId,
    title: tab.title,
    url: tab.url
  };
}

async function handleOpenTab(url, active = true) {
  const targetUrl = url || 'https://www.google.com';
  const newTab = await chrome.tabs.create({ url: targetUrl, active });
  return {
    success: true,
    tabId: newTab.id,
    url: newTab.url || targetUrl,
    active
  };
}

async function handleCloseTab(tabId) {
  let targetId = tabId;
  if (!targetId) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    targetId = activeTab?.id;
  }
  if (!targetId) throw new Error('No target tab found to close');

  await chrome.tabs.remove(targetId);
  return { success: true, closedTabId: targetId };
}

async function handleNavigate(url, tabId) {
  if (!url) throw new Error('Missing url parameter for NAVIGATE');
  let targetTabId = tabId;
  if (!targetTabId) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    targetTabId = activeTab?.id;
  }

  if (!targetTabId) {
    const newTab = await chrome.tabs.create({ url });
    return { tabId: newTab.id, url: newTab.url };
  }

  const updatedTab = await chrome.tabs.update(targetTabId, { url });
  return { tabId: updatedTab.id, url: updatedTab.url || url };
}

async function handleReloadPage(tabId, bypassCache = false) {
  let targetTabId = tabId;
  if (!targetTabId) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    targetTabId = activeTab?.id;
  }
  if (!targetTabId) throw new Error('No tab available to reload');

  await chrome.tabs.reload(targetTabId, { bypassCache });
  return { success: true, reloadedTabId: targetTabId };
}

async function handleHistory(tabId, delta) {
  let targetTabId = tabId;
  if (!targetTabId) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    targetTabId = activeTab?.id;
  }
  if (!targetTabId) throw new Error('No tab available for history navigation');

  await chrome.scripting.executeScript({
    target: { tabId: targetTabId },
    func: (d) => window.history.go(d),
    args: [delta]
  });

  return { success: true, tabId: targetTabId, historyDelta: delta };
}

async function handleScreenshot(tabId) {
  let targetTabId = tabId;
  if (!targetTabId) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    targetTabId = activeTab?.id;
  }

  if (!targetTabId) throw new Error('No active tab available for screenshot');

  const tab = await chrome.tabs.get(targetTabId);
  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
  return { tabId: targetTabId, dataUrl, capturedAt: Date.now() };
}

async function handleGetFrames(tabId) {
  let targetTabId = tabId;
  if (!targetTabId) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab) throw new Error('No active tab available');
    targetTabId = activeTab.id;
  }
  const frames = await chrome.webNavigation.getAllFrames({ tabId: targetTabId });
  return { tabId: targetTabId, frames: frames || [] };
}

async function handleExecuteScript(code, tabId) {
  let targetTabId = tabId;
  if (!targetTabId) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab) throw new Error('No active tab available');
    targetTabId = activeTab.id;
  }
  const results = await chrome.scripting.executeScript({
    target: { tabId: targetTabId },
    func: (scriptStr) => {
      try {
        const fn = new Function(scriptStr);
        return fn();
      } catch (e) {
        return { error: e.message };
      }
    },
    args: [code]
  });
  return results[0]?.result;
}

/* --------------------------------------------------------------------------
   Content Script Injection & Message Forwarding
   -------------------------------------------------------------------------- */

async function ensureContentScriptInjected(tabId) {
  try {
    await chrome.scripting.insertCSS({
      target: { tabId, allFrames: true },
      files: ['content/content.css']
    }).catch(() => {});
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: ['content/content.js']
    });
  } catch (e) {
    console.warn(`[OpenGravity] Failed to inject content script into tab ${tabId}:`, e);
  }
}

async function forwardToContentScript(action, params) {
  let tabId = params?.tabId;
  let frameId = params?.frameId ?? null;

  if (!tabId) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab) throw new Error('No active tab available');
    tabId = activeTab.id;
  }

  const sendMsgToTab = (options) => {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, { action, params }, options, (response) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        if (!response) {
          return reject(new Error('No response from content script'));
        }
        if (response.error) {
          return reject(new Error(response.error));
        }
        resolve(response.data);
      });
    });
  };

  // For FIND_ELEMENTS, query all frames and aggregate elements
  if (action === 'FIND_ELEMENTS' && frameId === null) {
    try {
      const frames = await chrome.webNavigation.getAllFrames({ tabId }).catch(() => []);
      const allElements = [];
      for (const frame of frames || []) {
        try {
          await ensureContentScriptInjected(tabId);
          const resp = await sendMsgToTab({ frameId: frame.frameId });
          if (resp?.elements) {
            const tagged = resp.elements.map(el => ({ ...el, _frameId: frame.frameId, _frameUrl: frame.url }));
            allElements.push(...tagged);
          }
        } catch (_) {}
      }
      if (allElements.length > 0) {
        return { count: allElements.length, elements: allElements };
      }
    } catch (_) {}
  }

  const msgOptions = { frameId: frameId ?? 0 };

  try {
    return await sendMsgToTab(msgOptions);
  } catch (err) {
    if (err.message && err.message.includes('Could not establish connection')) {
      console.log(`[OpenGravity] Injecting content script dynamically into tab ${tabId}...`);
      await ensureContentScriptInjected(tabId);
      await new Promise(r => setTimeout(r, 350));
      return await sendMsgToTab(msgOptions);
    }
    throw err;
  }
}

// Lifecycle listeners
chrome.runtime.onLaunched?.addListener(connectRelayServer);
chrome.runtime.onStartup.addListener(connectRelayServer);
connectRelayServer();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_STATUS') {
    sendResponse({ connected: isConnected, serverUrl: SERVER_URL });
  } else if (request.action === 'RECONNECT') {
    connectRelayServer();
    sendResponse({ status: 'reconnecting' });
  }
  return true;
});
