/**
 * OpenGravity Content Script v2.0.0
 * Live Interactive DOM Crawler, Virtual AI Screen Roaming & Human-Like Action Executor.
 * 
 * Supports:
 * - Real-time AI screen roaming & virtual mouse pointer (move, hover, click)
 * - Human-paced keyboard typing (per-character delay, realistic key events)
 * - Intelligent element discovery across iframes, shadow roots, and modern UI frameworks
 * - Universal dropdown option selection (native, react-select, combobox, flyouts)
 * - Structured page text extraction & visual laser pointer highlight overlays
 */

(() => {
  console.log('[OpenGravity Content v2.0.0] Active in:', window.location.href);

  let elementRegistry = new Map();
  let elementIdCounter = 0;
  let activeHighlightOverlay = null;
  let virtualCursorElement = null;

  // Listen for commands dispatched from OpenGravity background worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { action, params } = message;

    handleAction(action, params)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message || String(error) }));

    return true; // Asynchronous response
  });

  async function handleAction(action, params = {}) {
    switch (action) {
      case 'INSPECT_DOM':
        return inspectDom();

      case 'FIND_ELEMENTS':
        return findInteractiveElements(params?.query);

      case 'ROAM_SCREEN':
      case 'MOVE_MOUSE':
        return moveVirtualCursor(params?.x, params?.y, params?.label);

      case 'HOVER_ELEMENT':
        return hoverElement(params?.elementId);

      case 'CLICK_ELEMENT':
        return clickElement(params?.elementId);

      case 'CLICK_COORDINATES':
        return clickCoordinates(params?.x, params?.y);

      case 'TYPE_TEXT':
        return typeTextInElement(params?.elementId, params?.text, params);

      case 'PRESS_KEY':
        return pressKeyOnElement(params?.elementId, params?.key);

      case 'SELECT_OPTION':
        return selectOption(params?.elementId, params?.value || params?.text);

      case 'AUTOFILL_FORM':
        return autofillCandidateForm(params?.profile);

      case 'SELECT_ALL_DROPDOWNS':
        return selectAllDropdownsFallback();

      case 'GET_PAGE_TEXT':
        return extractPageText(params?.maxLength);

      case 'WAIT_FOR_ELEMENT':
        return waitForElement(params?.query || params?.selector, params?.timeoutMs);

      case 'HIGHLIGHT_REGION':
        return highlightRegion(params);

      case 'SCROLL':
        return scrollViewport(params?.direction, params?.distance, params?.target);

      default:
        throw new Error(`Unsupported OpenGravity content action: ${action}`);
    }
  }

  /* --------------------------------------------------------------------------
     1. Element Discovery & DOM Inspection
     -------------------------------------------------------------------------- */

  function findInteractiveElements(queryFilter = '') {
    elementRegistry.clear();
    elementIdCounter = 0;

    const selector = [
      'input', 'textarea', 'select', 'button', 'a[href]',
      '[role="button"]', '[role="checkbox"]', '[role="textbox"]',
      '[role="combobox"]', '[role="searchbox"]', '[role="option"]',
      '[role="menuitem"]', '[role="tab"]', '[role="switch"]',
      '[contenteditable="true"]', '[tabindex]:not([tabindex="-1"])',
      '#indeedApplyButton', '[data-indeed-apply-joburl]'
    ].join(',');

    function getAllNodes(root) {
      let list = [];
      try {
        list = Array.from(root.querySelectorAll(selector));
        const all = root.querySelectorAll('*');
        for (const el of all) {
          if (el.shadowRoot) {
            list = list.concat(getAllNodes(el.shadowRoot));
          }
        }
      } catch (_) {}
      return list;
    }

    const nodes = getAllNodes(document);
    const results = [];

    for (const node of nodes) {
      elementIdCounter++;
      const ogId = `og_el_${elementIdCounter}`;
      node.setAttribute('data-opengravity-id', ogId);
      elementRegistry.set(ogId, node);

      const rect = node.getBoundingClientRect();
      const ariaLabel = node.getAttribute('aria-label') || '';
      const innerText = (node.innerText?.trim() || node.textContent?.trim() || '').slice(0, 140);
      const isClose = ariaLabel.toLowerCase().includes('close') || 
                      (node.id || '').toLowerCase().includes('close') ||
                      innerText.toLowerCase() === 'close' ||
                      innerText.toLowerCase() === 'cancel';

      const elementInfo = {
        elementId: ogId,
        tagName: node.tagName.toLowerCase(),
        type: node.type || node.getAttribute('role') || 'generic',
        placeholder: node.placeholder || '',
        name: node.name || '',
        id: node.id || '',
        value: (node.value !== undefined && node.value !== '') ? String(node.value).slice(0, 120) : innerText,
        innerText,
        labelText: getAssociatedLabel(node),
        ariaLabel,
        isCloseButton: isClose,
        bounds: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        isVisible: isElementVisible(node)
      };

      if (queryFilter) {
        const q = queryFilter.toLowerCase();
        const matches = 
          elementInfo.tagName.includes(q) ||
          elementInfo.type.includes(q) ||
          elementInfo.placeholder.toLowerCase().includes(q) ||
          elementInfo.name.toLowerCase().includes(q) ||
          elementInfo.id.toLowerCase().includes(q) ||
          elementInfo.labelText.toLowerCase().includes(q) ||
          elementInfo.ariaLabel.toLowerCase().includes(q) ||
          elementInfo.innerText.toLowerCase().includes(q) ||
          (elementInfo.value && String(elementInfo.value).toLowerCase().includes(q));

        if (!matches) continue;
      }

      results.push(elementInfo);
    }

    return {
      count: results.length,
      elements: results
    };
  }

  function inspectDom() {
    const interactive = findInteractiveElements();
    return {
      title: document.title,
      url: window.location.href,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      interactiveElementCount: interactive.count,
      topElements: interactive.elements.slice(0, 35)
    };
  }

  function extractPageText(maxLength = 6000) {
    // Extract readable headings, paragraphs, and list items
    const elements = document.querySelectorAll('h1, h2, h3, h4, p, li, blockquote, [role="heading"]');
    const lines = [];
    let currentLength = 0;

    for (const el of elements) {
      if (!isElementVisible(el)) continue;
      const text = (el.innerText || el.textContent || '').trim();
      if (!text || text.length < 2) continue;

      let prefix = '';
      const tag = el.tagName.toLowerCase();
      if (tag === 'h1') prefix = '# ';
      else if (tag === 'h2') prefix = '## ';
      else if (tag === 'h3') prefix = '### ';
      else if (tag === 'li') prefix = '• ';

      const line = `${prefix}${text}`;
      if (currentLength + line.length > maxLength) break;
      lines.push(line);
      currentLength += line.length + 1;
    }

    return {
      title: document.title,
      url: window.location.href,
      extractedLinesCount: lines.length,
      content: lines.join('\n')
    };
  }

  /* --------------------------------------------------------------------------
     2. Virtual AI Cursor & Screen Roaming
     -------------------------------------------------------------------------- */

  function getOrCreateVirtualCursor() {
    if (!virtualCursorElement || !document.body.contains(virtualCursorElement)) {
      const cursor = document.createElement('div');
      cursor.className = 'opengravity-virtual-cursor';
      cursor.innerHTML = `
        <div class="opengravity-virtual-cursor-arrow"></div>
        <div class="opengravity-virtual-cursor-dot"></div>
        <div class="opengravity-virtual-cursor-label">AI Agent</div>
      `;
      document.body.appendChild(cursor);
      virtualCursorElement = cursor;
    }
    return virtualCursorElement;
  }

  function moveVirtualCursor(targetX, targetY, labelText = 'Roaming') {
    const x = Math.max(10, Math.min(window.innerWidth - 30, targetX ?? Math.round(window.innerWidth / 2)));
    const y = Math.max(10, Math.min(window.innerHeight - 30, targetY ?? Math.round(window.innerHeight / 2)));

    const cursor = getOrCreateVirtualCursor();
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    const label = cursor.querySelector('.opengravity-virtual-cursor-label');
    if (label) {
      label.innerText = `AI: ${labelText} (${x}, ${y})`;
    }

    // Trigger mousemove on element under cursor
    const el = document.elementFromPoint(x, y);
    if (el) {
      el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y, view: window }));
    }

    return {
      x,
      y,
      elementUnderCursor: el ? el.tagName.toLowerCase() : null
    };
  }

  async function hoverElement(elementId) {
    const node = getElementByOgId(elementId);
    if (!node) throw new Error(`Element '${elementId}' not found on page`);

    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await new Promise(r => setTimeout(r, 200));

    const rect = node.getBoundingClientRect();
    const centerX = Math.round(rect.x + rect.width / 2);
    const centerY = Math.round(rect.y + rect.height / 2);

    moveVirtualCursor(centerX, centerY, `Hovering <${node.tagName.toLowerCase()}>`);
    highlightElement(node, `AI Hover: <${node.tagName.toLowerCase()}>`);

    // Dispatch hover events sequence
    node.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY }));
    node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY }));
    node.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false, cancelable: true, view: window, clientX: centerX, clientY: centerY }));
    node.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false, cancelable: true, view: window, clientX: centerX, clientY: centerY }));

    return {
      elementId,
      success: true,
      bounds: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) }
    };
  }

  function spawnClickRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'opengravity-click-ripple';
    ripple.style.left = `${x + window.scrollX}px`;
    ripple.style.top = `${y + window.scrollY}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  /* --------------------------------------------------------------------------
     3. Human-Paced Actions: Click, Type, Keypress, Select
     -------------------------------------------------------------------------- */

  async function clickElement(elementId) {
    const node = getElementByOgId(elementId);
    if (!node) throw new Error(`Element '${elementId}' not found on page`);

    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await new Promise(r => setTimeout(r, 250));

    const rect = node.getBoundingClientRect();
    const clickX = Math.round(rect.x + (rect.width > 0 ? rect.width / 2 : 5));
    const clickY = Math.round(rect.y + (rect.height > 0 ? rect.height / 2 : 5));

    moveVirtualCursor(clickX, clickY, `Clicking`);
    highlightElement(node, `Click`);
    spawnClickRipple(clickX, clickY);

    node.focus();
    node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window, clientX: clickX, clientY: clickY }));
    node.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window, clientX: clickX, clientY: clickY }));
    node.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, view: window, clientX: clickX, clientY: clickY }));
    node.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window, clientX: clickX, clientY: clickY }));
    node.click();

    // Check if it's a link or form submit
    const href = node.href || node.getAttribute('href') || node.closest('a')?.href;
    if (href && href.startsWith('http')) {
      setTimeout(() => {
        if (window.location.href !== href) {
          window.location.href = href;
        }
      }, 300);
    }

    return {
      elementId,
      success: true,
      tagName: node.tagName,
      href: href || null
    };
  }

  async function clickCoordinates(x, y) {
    const targetX = x ?? 100;
    const targetY = y ?? 100;

    moveVirtualCursor(targetX, targetY, `Click (${targetX}, ${targetY})`);
    spawnClickRipple(targetX, targetY);

    const el = document.elementFromPoint(targetX, targetY) || document.body;
    el.focus();
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window, clientX: targetX, clientY: targetY }));
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window, clientX: targetX, clientY: targetY }));
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, view: window, clientX: targetX, clientY: targetY }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window, clientX: targetX, clientY: targetY }));
    el.click();

    return {
      success: true,
      x: targetX,
      y: targetY,
      clickedTag: el.tagName.toLowerCase()
    };
  }

  async function typeTextInElement(elementId, text, options = {}) {
    const node = getElementByOgId(elementId);
    if (!node) throw new Error(`Element '${elementId}' not found on page`);

    const delayMs = options.delayMs ?? 35; // Human typing pace
    const clearBefore = options.clearBefore ?? true;
    const submitAfter = options.submitAfter ?? false;

    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await new Promise(r => setTimeout(r, 200));

    const rect = node.getBoundingClientRect();
    moveVirtualCursor(Math.round(rect.x + 10), Math.round(rect.y + 10), `Typing`);
    highlightElement(node, `Typing`);
    node.focus();

    function setNativeValue(el, val) {
      if (el.isContentEditable) {
        el.innerText = val;
        el.dispatchEvent(new InputEvent('input', { bubbles: true, data: val }));
        return;
      }
      const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
      if (descriptor && descriptor.set) {
        descriptor.set.call(el, val);
      } else {
        el.value = val;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (clearBefore) {
      setNativeValue(node, '');
    }

    if (delayMs > 0 && typeof text === 'string' && text.length > 0) {
      // Natural human-like keystroke by keystroke typing
      let currentVal = clearBefore ? '' : (node.isContentEditable ? (node.innerText || '') : (node.value || ''));
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        currentVal += char;
        
        node.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
        node.dispatchEvent(new KeyboardEvent('keypress', { key: char, bubbles: true }));

        setNativeValue(node, currentVal);

        node.dispatchEvent(new InputEvent('input', { bubbles: true, data: char }));
        node.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));

        const jitter = Math.floor(Math.random() * (delayMs * 0.4));
        await new Promise(r => setTimeout(r, delayMs + jitter));
      }
      node.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // Fast paste mode
      setNativeValue(node, text);
    }

    if (submitAfter) {
      await new Promise(r => setTimeout(r, 300));
      if (node.form) {
        node.form.requestSubmit ? node.form.requestSubmit() : node.form.submit();
      } else {
        node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
      }
    }

    return {
      elementId,
      success: true,
      currentValue: node.value || node.innerText
    };
  }

  async function pressKeyOnElement(elementId, key = 'Enter') {
    let target = elementId ? getElementByOgId(elementId) : document.activeElement;
    if (!target) target = document.body;

    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    target.dispatchEvent(new KeyboardEvent('keypress', { key, bubbles: true, cancelable: true }));
    target.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }));

    if (key === 'Enter' && target.form) {
      target.form.requestSubmit ? target.form.requestSubmit() : target.form.submit();
    }

    return { success: true, key, targetTag: target.tagName.toLowerCase() };
  }

  async function selectOption(elementId, optionValueOrText) {
    const node = getElementByOgId(elementId);
    if (!node) throw new Error(`Element '${elementId}' not found on page`);

    const query = String(optionValueOrText || '').toLowerCase();
    highlightElement(node, `Selecting Option`);

    // Case 1: Standard HTML <select>
    if (node.tagName.toLowerCase() === 'select') {
      const options = Array.from(node.options);
      let match = options.find(o => o.value.toLowerCase() === query || o.text.toLowerCase().includes(query));
      if (!match && options.length > 1) match = options[1]; // Pick first valid if not matched

      if (match) {
        node.value = match.value;
        node.dispatchEvent(new Event('change', { bubbles: true }));
        return { success: true, selectedValue: match.value, selectedText: match.text };
      }
    }

    // Case 2: Modern Custom Dropdown (React-Select, HeadlessUI, Combobox)
    node.click();
    await new Promise(r => setTimeout(r, 300));

    // Look for floating option elements
    const floatingOptions = Array.from(document.querySelectorAll('[role="option"], [class*="option"], .select__option, li'));
    let matchedOption = floatingOptions.find(opt => (opt.innerText || opt.textContent || '').toLowerCase().includes(query));

    if (matchedOption) {
      matchedOption.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      matchedOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
      matchedOption.click();
      return { success: true, selectedText: matchedOption.innerText?.trim() };
    }

    return { success: false, message: `Option '${optionValueOrText}' not found in dropdown list.` };
  }

  /* --------------------------------------------------------------------------
     4. Smart Form Autofill & Fallbacks
     -------------------------------------------------------------------------- */

  function autofillCandidateForm(profile = {}) {
    const defaultProfile = {
      firstName: "Alex",
      lastName: "Smith",
      email: "alex.smith@example.com",
      phone: "+44 7000 000000",
      location: "London, UK",
      github: "https://github.com/example-profile",
      linkedin: "https://www.linkedin.com/in/example-profile",
      school: "University",
      degree: "BSc Software Engineering",
      gradYear: "2027",
      ...profile
    };

    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    let filledCount = 0;

    for (const input of inputs) {
      const id = (input.id || '').toLowerCase();
      const name = (input.name || '').toLowerCase();
      const label = (input.labels?.[0]?.innerText || input.closest('label')?.innerText || input.getAttribute('aria-label') || '').toLowerCase();
      const autocomplete = (input.autocomplete || '').toLowerCase();

      function setValue(val) {
        input.focus();
        input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
      }

      if (id.includes('first') || name.includes('first') || label.includes('first') || autocomplete.includes('given-name') || label.includes('forename')) {
        setValue(defaultProfile.firstName);
      } else if (id.includes('last') || name.includes('last') || label.includes('last') || label.includes('surname') || autocomplete.includes('family-name')) {
        setValue(defaultProfile.lastName);
      } else if (id.includes('fullname') || name.includes('fullname') || label.includes('full name')) {
        setValue(`${defaultProfile.firstName} ${defaultProfile.lastName}`);
      } else if (id.includes('email') || name.includes('email') || label.includes('email')) {
        setValue(defaultProfile.email);
      } else if (id.includes('phone') || name.includes('phone') || label.includes('phone') || label.includes('mobile') || label.includes('tel')) {
        setValue(defaultProfile.phone);
      } else if (id.includes('github') || name.includes('github') || label.includes('github') || label.includes('git')) {
        setValue(defaultProfile.github);
      } else if (id.includes('linkedin') || name.includes('linkedin') || label.includes('linkedin')) {
        setValue(defaultProfile.linkedin);
      } else if (id.includes('city') || id.includes('location') || label.includes('city') || label.includes('location')) {
        setValue(defaultProfile.location);
      }
    }

    return { success: true, filledCount, totalInputs: inputs.length };
  }

  function selectAllDropdownsFallback() {
    const controls = Array.from(document.querySelectorAll('[class*="control"], .select__control, div[aria-expanded]'));
    let selected = 0;
    for (const ctrl of controls) {
      try {
        ctrl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
        ctrl.click();
        const option = document.querySelector('[role="option"], [class*="option"]');
        if (option) {
          option.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
          option.click();
          selected++;
        }
      } catch (_) {}
    }
    return { success: true, selectedCount: selected, totalControls: controls.length };
  }

  /* --------------------------------------------------------------------------
     5. Utilities & Visual Highlights
     -------------------------------------------------------------------------- */

  function highlightElement(node, labelText = '') {
    if (activeHighlightOverlay) {
      activeHighlightOverlay.remove();
    }

    const rect = node.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'opengravity-target-highlight';
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    const badge = document.createElement('div');
    badge.className = 'opengravity-target-badge';
    badge.innerText = `🌌 OpenGravity: ${labelText}`;
    overlay.appendChild(badge);

    document.body.appendChild(overlay);
    activeHighlightOverlay = overlay;

    setTimeout(() => {
      if (activeHighlightOverlay === overlay) {
        overlay.remove();
        activeHighlightOverlay = null;
      }
    }, 2800);
  }

  function highlightRegion(params) {
    const { x = 100, y = 100, width = 200, height = 100, label = 'Inspecting' } = params;
    const box = document.createElement('div');
    box.className = 'opengravity-laser-box';
    box.style.left = `${x + window.scrollX}px`;
    box.style.top = `${y + window.scrollY}px`;
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;

    const badge = document.createElement('div');
    badge.className = 'opengravity-laser-label';
    badge.innerText = `AI Focus: ${label}`;
    box.appendChild(badge);

    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3500);

    return { success: true, region: { x, y, width, height, label } };
  }

  function scrollViewport(direction = 'down', distance = 450, target = null) {
    if (target === 'top' || direction === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'bottom' || direction === 'bottom') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } else {
      const delta = direction === 'up' ? -distance : distance;
      window.scrollBy({ top: delta, behavior: 'smooth' });
    }

    return {
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      maxScrollY: document.body.scrollHeight - window.innerHeight
    };
  }

  async function waitForElement(queryOrSelector, timeoutMs = 8000) {
    const startTime = Date.now();
    const query = (queryOrSelector || '').toLowerCase();

    while (Date.now() - startTime < timeoutMs) {
      const found = findInteractiveElements(query);
      if (found.count > 0) {
        return { success: true, matchedElement: found.elements[0], waitTimeMs: Date.now() - startTime };
      }
      await new Promise(r => setTimeout(r, 400));
    }

    throw new Error(`Timeout waiting for element matching '${queryOrSelector}' after ${timeoutMs}ms.`);
  }

  function getElementByOgId(ogId) {
    if (elementRegistry.has(ogId)) {
      return elementRegistry.get(ogId);
    }
    return document.querySelector(`[data-opengravity-id="${ogId}"]`);
  }

  function isElementVisible(elem) {
    if (!elem) return false;
    try {
      const style = window.getComputedStyle(elem);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      const rect = elem.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return false;
    } catch (_) {}
    return true;
  }

  function getAssociatedLabel(elem) {
    if (elem.id) {
      const label = document.querySelector(`label[for="${elem.id}"]`);
      if (label) return label.innerText.trim();
    }
    const parentLabel = elem.closest('label');
    if (parentLabel) return parentLabel.innerText.trim();
    return '';
  }

})();
