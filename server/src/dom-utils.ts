/**
 * OpenGravity Server - DOM Utilities & Response Sanitizers
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InteractiveElement {
  elementId: string;
  tagName: string;
  type: string;
  placeholder?: string;
  name?: string;
  id?: string;
  value?: string;
  labelText?: string;
  ariaLabel?: string;
  bounds: BoundingBox;
}

export interface TabSummary {
  tabId: number;
  title: string;
  url: string;
  active: boolean;
  windowId: number;
}

/**
 * Formats raw DOM nodes into concise readable tree structure for system prompts
 */
export function formatDomSummary(elements: InteractiveElement[]): string {
  if (!elements || elements.length === 0) {
    return 'No interactive form elements found on current page.';
  }

  return elements.map(el => {
    const labelStr = el.labelText ? ` label="${el.labelText}"` : '';
    const placeholderStr = el.placeholder ? ` placeholder="${el.placeholder}"` : '';
    const nameStr = el.name ? ` name="${el.name}"` : '';
    const idStr = el.id ? ` id="#${el.id}"` : '';
    const valStr = el.value ? ` val="${el.value}"` : '';

    return `[ID:${el.elementId}] <${el.tagName} type="${el.type}"${idStr}${nameStr}${labelStr}${placeholderStr}${valStr}>`;
  }).join('\n');
}
