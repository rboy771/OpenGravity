/**
 * OpenGravity Tool Schemas & Definitions
 * Canonical definitions used across MCP, HTTP OpenAPI, and AI Agent Prompts.
 */

export interface ToolDefinition {
  name: string;
  action: string;
  description: string;
  category: 'tabs' | 'navigation' | 'vision' | 'interaction' | 'utility';
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  example: Record<string, any>;
}

export const OPENGRAVITY_TOOLS: ToolDefinition[] = [
  // 1. Tabs & Windows
  {
    name: 'browser_list_tabs',
    action: 'LIST_TABS',
    category: 'tabs',
    description: 'Lists all open browser tabs across all windows with tabId, title, URL, and active status.',
    inputSchema: {
      type: 'object',
      properties: {}
    },
    example: {}
  },
  {
    name: 'browser_get_active_tab',
    action: 'GET_ACTIVE_TAB',
    category: 'tabs',
    description: 'Retrieves details and initial DOM summary of the currently active browser tab.',
    inputSchema: {
      type: 'object',
      properties: {}
    },
    example: {}
  },
  {
    name: 'browser_switch_tab',
    action: 'SWITCH_TAB',
    category: 'tabs',
    description: 'Switches browser focus to a specific tab by its tabId.',
    inputSchema: {
      type: 'object',
      properties: {
        tabId: { type: 'number', description: 'The ID of the tab to switch to.' }
      },
      required: ['tabId']
    },
    example: { tabId: 1042 }
  },
  {
    name: 'browser_open_tab',
    action: 'OPEN_TAB',
    category: 'tabs',
    description: 'Opens a new browser tab with the specified URL.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to open in the new tab.' },
        active: { type: 'boolean', description: 'Whether the new tab should become immediately active (default: true).' }
      },
      required: ['url']
    },
    example: { url: 'https://www.linkedin.com/jobs', active: true }
  },
  {
    name: 'browser_close_tab',
    action: 'CLOSE_TAB',
    category: 'tabs',
    description: 'Closes a browser tab by its tabId, or closes current active tab if omitted.',
    inputSchema: {
      type: 'object',
      properties: {
        tabId: { type: 'number', description: 'Optional ID of the tab to close.' }
      }
    },
    example: { tabId: 1042 }
  },

  // 2. Navigation
  {
    name: 'browser_navigate',
    action: 'NAVIGATE',
    category: 'navigation',
    description: 'Navigates the current active tab (or specified tabId) to a new URL.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Full URL to navigate to (e.g. https://google.com).' },
        tabId: { type: 'number', description: 'Optional target tab ID.' }
      },
      required: ['url']
    },
    example: { url: 'https://github.com' }
  },
  {
    name: 'browser_reload_page',
    action: 'RELOAD_PAGE',
    category: 'navigation',
    description: 'Reloads the current active tab or specified tab.',
    inputSchema: {
      type: 'object',
      properties: {
        tabId: { type: 'number', description: 'Optional target tab ID.' },
        bypassCache: { type: 'boolean', description: 'Whether to ignore cached assets.' }
      }
    },
    example: { bypassCache: false }
  },
  {
    name: 'browser_history_back',
    action: 'HISTORY_BACK',
    category: 'navigation',
    description: 'Navigates back in browser history for the active tab.',
    inputSchema: {
      type: 'object',
      properties: {
        tabId: { type: 'number', description: 'Optional target tab ID.' }
      }
    },
    example: {}
  },
  {
    name: 'browser_history_forward',
    action: 'HISTORY_FORWARD',
    category: 'navigation',
    description: 'Navigates forward in browser history for the active tab.',
    inputSchema: {
      type: 'object',
      properties: {
        tabId: { type: 'number', description: 'Optional target tab ID.' }
      }
    },
    example: {}
  },

  // 3. Vision & DOM Discovery
  {
    name: 'browser_take_screenshot',
    action: 'SCREENSHOT',
    category: 'vision',
    description: 'Captures a real-time base64 visual screenshot of the specified tab or active window.',
    inputSchema: {
      type: 'object',
      properties: {
        tabId: { type: 'number', description: 'Optional target tab ID.' }
      }
    },
    example: {}
  },
  {
    name: 'browser_find_elements',
    action: 'FIND_ELEMENTS',
    category: 'vision',
    description: 'Scans the page for interactive inputs, buttons, links, dropdowns across main DOM and iframes, assigning each a unique og_el_X ID.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Optional search filter (e.g. "submit", "first name", "email", "button").' }
      }
    },
    example: { query: 'apply' }
  },
  {
    name: 'browser_get_page_text',
    action: 'GET_PAGE_TEXT',
    category: 'vision',
    description: 'Extracts clean structured markdown and readable text content from the current page.',
    inputSchema: {
      type: 'object',
      properties: {
        maxLength: { type: 'number', description: 'Max characters to extract (default: 6000).' }
      }
    },
    example: { maxLength: 4000 }
  },
  {
    name: 'browser_inspect_dom',
    action: 'INSPECT_DOM',
    category: 'vision',
    description: 'Returns viewport dimensions, scroll offsets, total element count, and top interactive controls.',
    inputSchema: {
      type: 'object',
      properties: {}
    },
    example: {}
  },
  {
    name: 'browser_wait_for_element',
    action: 'WAIT_FOR_ELEMENT',
    category: 'vision',
    description: 'Polls the page until an interactive element matching query or selector appears.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Label, text, or selector of the element to wait for.' },
        timeoutMs: { type: 'number', description: 'Max wait time in milliseconds (default: 8000).' }
      },
      required: ['query']
    },
    example: { query: 'Submit Application', timeoutMs: 6000 }
  },

  // 4. Roaming & Screen Interaction
  {
    name: 'browser_roam_screen',
    action: 'ROAM_SCREEN',
    category: 'interaction',
    description: 'Roams the screen by moving the virtual AI cursor to viewport coordinates (x, y) with visible animation.',
    inputSchema: {
      type: 'object',
      properties: {
        x: { type: 'number', description: 'Viewport X coordinate.' },
        y: { type: 'number', description: 'Viewport Y coordinate.' },
        label: { type: 'string', description: 'Optional label displayed on AI cursor badge.' }
      },
      required: ['x', 'y']
    },
    example: { x: 450, y: 320, label: 'Scanning form' }
  },
  {
    name: 'browser_hover_element',
    action: 'HOVER_ELEMENT',
    category: 'interaction',
    description: 'Moves the virtual AI cursor over an element, scrolls it into view, and dispatches pointerover/mouseover/mouseenter events.',
    inputSchema: {
      type: 'object',
      properties: {
        elementId: { type: 'string', description: 'Target element ID (e.g. og_el_5).' }
      },
      required: ['elementId']
    },
    example: { elementId: 'og_el_7' }
  },
  {
    name: 'browser_click_element',
    action: 'CLICK_ELEMENT',
    category: 'interaction',
    description: 'Executes a physical click on an element with mouse events, visual ripple animation, and link handling.',
    inputSchema: {
      type: 'object',
      properties: {
        elementId: { type: 'string', description: 'Target element ID to click (e.g. og_el_12).' }
      },
      required: ['elementId']
    },
    example: { elementId: 'og_el_21' }
  },
  {
    name: 'browser_click_coordinates',
    action: 'CLICK_COORDINATES',
    category: 'interaction',
    description: 'Clicks directly at specific viewport coordinates (x, y).',
    inputSchema: {
      type: 'object',
      properties: {
        x: { type: 'number', description: 'Viewport X coordinate.' },
        y: { type: 'number', description: 'Viewport Y coordinate.' }
      },
      required: ['x', 'y']
    },
    example: { x: 500, y: 300 }
  },
  {
    name: 'browser_type_text',
    action: 'TYPE_TEXT',
    category: 'interaction',
    description: 'Focuses an input/textarea and types text. Supports human typing delay (delayMs) and form submission.',
    inputSchema: {
      type: 'object',
      properties: {
        elementId: { type: 'string', description: 'Target element ID (e.g. og_el_8).' },
        text: { type: 'string', description: 'Text string to type into the element.' },
        delayMs: { type: 'number', description: 'Keystroke delay in ms for human-like typing (default: 35, set 0 for instant).' },
        clearBefore: { type: 'boolean', description: 'Whether to clear existing text before typing (default: false).' },
        submitAfter: { type: 'boolean', description: 'Whether to submit the form/press Enter after typing.' }
      },
      required: ['elementId', 'text']
    },
    example: { elementId: 'og_el_9', text: 'alex.smith@example.com', delayMs: 40, clearBefore: true }
  },
  {
    name: 'browser_press_key',
    action: 'PRESS_KEY',
    category: 'interaction',
    description: 'Sends keyboard key events (e.g. "Enter", "Tab", "Escape", "ArrowDown", "Backspace") to the focused element.',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Key name (e.g. Enter, Tab, Escape, ArrowDown).' },
        elementId: { type: 'string', description: 'Optional target element ID.' }
      },
      required: ['key']
    },
    example: { key: 'Enter', elementId: 'og_el_4' }
  },
  {
    name: 'browser_select_option',
    action: 'SELECT_OPTION',
    category: 'interaction',
    description: 'Selects an option in native select, react-select, or ARIA combobox dropdowns by text or value.',
    inputSchema: {
      type: 'object',
      properties: {
        elementId: { type: 'string', description: 'Target dropdown element ID.' },
        value: { type: 'string', description: 'Option label or value to select.' }
      },
      required: ['elementId', 'value']
    },
    example: { elementId: 'og_el_15', value: 'United Kingdom' }
  },
  {
    name: 'browser_autofill_form',
    action: 'AUTOFILL_FORM',
    category: 'interaction',
    description: 'Autofills application form fields using strict profile data (First Name, Surname, Email, Phone, LinkedIn, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        profile: { type: 'object', description: 'Optional candidate profile overrides.' }
      }
    },
    example: {}
  },
  {
    name: 'browser_scroll',
    action: 'SCROLL',
    category: 'interaction',
    description: 'Scrolls the page up, down, to top, or to bottom.',
    inputSchema: {
      type: 'object',
      properties: {
        direction: { type: 'string', enum: ['up', 'down', 'top', 'bottom'], description: 'Scroll direction.' },
        distance: { type: 'number', description: 'Pixel distance to scroll (default: 450).' }
      }
    },
    example: { direction: 'down', distance: 600 }
  },
  {
    name: 'browser_highlight_region',
    action: 'HIGHLIGHT_REGION',
    category: 'vision',
    description: 'Draws a glowing visual focus box on screen with a custom label to show where the AI is looking.',
    inputSchema: {
      type: 'object',
      properties: {
        x: { type: 'number', description: 'X coordinate.' },
        y: { type: 'number', description: 'Y coordinate.' },
        width: { type: 'number', description: 'Width in pixels.' },
        height: { type: 'number', description: 'Height in pixels.' },
        label: { type: 'string', description: 'Label text to display above box.' }
      },
      required: ['x', 'y', 'width', 'height']
    },
    example: { x: 200, y: 150, width: 400, height: 250, label: 'Job Requirements' }
  },
  {
    name: 'browser_execute_script',
    action: 'EXECUTE_SCRIPT',
    category: 'utility',
    description: 'Executes arbitrary JavaScript in the context of the active tab and returns the evaluated result.',
    inputSchema: {
      type: 'object',
      properties: {
        script: { type: 'string', description: 'JavaScript code snippet to execute.' },
        tabId: { type: 'number', description: 'Optional target tab ID.' }
      },
      required: ['script']
    },
    example: { script: 'document.title' }
  }
];
