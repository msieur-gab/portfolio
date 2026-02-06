/**
 * Proto-Sandbox: Shadow DOM container for isolated HTML prototypes
 *
 * Usage in markdown:
 *   ::prototype{src="prototypes/demo.html" height="400"}
 *
 * Renders as:
 *   <figure data-media data-type="prototype">
 *     <proto-sandbox src="..." height="..."></proto-sandbox>
 *   </figure>
 */

import { LitElement, html, css } from 'https://esm.sh/lit@3.1.0';

export class ProtoSandbox extends LitElement {
  static properties = {
    src: { type: String },
    height: { type: String },
    bg: { type: String },
    _content: { state: true },
    _loading: { state: true },
    _error: { state: true }
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      background: var(--proto-bg, transparent);
    }

    .sandbox-frame {
      width: 100%;
      border: none;
      border-radius: 8px;
      background: inherit;
    }

    .loading, .error {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: var(--color-muted, #666);
      font-family: var(--font-sans, system-ui);
      font-size: 0.875rem;
    }

    .error {
      color: #c0392b;
    }

    .label {
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: 0.625rem;
      font-family: var(--font-mono, monospace);
      color: var(--color-muted, #888);
      background: var(--color-surface, rgba(255,255,255,0.9));
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    :host-context([data-theme="dark"]) .label {
      background: rgba(0,0,0,0.6);
    }

    .container {
      position: relative;
    }
  `;

  constructor() {
    super();
    this.src = '';
    this.height = '300';
    this.bg = '';
    this._content = null;
    this._loading = true;
    this._error = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.src) {
      this._loadPrototype();
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('src') && this.src) {
      this._loadPrototype();
    }
    if (changedProperties.has('bg')) {
      if (this.bg) {
        this.style.setProperty('--proto-bg', this.bg);
      } else {
        this.style.removeProperty('--proto-bg');
      }
    }
  }

  async _loadPrototype() {
    this._loading = true;
    this._error = null;

    try {
      const response = await fetch(this.src);
      if (!response.ok) {
        throw new Error(`Failed to load: ${response.status}`);
      }
      this._content = await response.text();
    } catch (err) {
      this._error = err.message;
      console.error(`[proto-sandbox] Error loading ${this.src}:`, err);
    } finally {
      this._loading = false;
    }
  }

  /**
   * Extract and process prototype HTML for iframe srcdoc
   * Injects CSS variables from parent for theme consistency
   */
  _prepareSrcdoc() {
    if (!this._content) return '';

    // Get computed CSS variables from document for theme bridging
    const computedStyle = getComputedStyle(document.documentElement);
    const bgOverride = this.bg ? `body { background: ${this.bg}; }` : '';
    const themeVars = `
      <style>
        :root {
          --color-bg: ${computedStyle.getPropertyValue('--color-bg').trim() || '#ffffff'};
          --color-text: ${computedStyle.getPropertyValue('--color-text').trim() || '#1a1a1a'};
          --color-muted: ${computedStyle.getPropertyValue('--color-muted').trim() || '#666666'};
          --font-sans: ${computedStyle.getPropertyValue('--font-sans').trim() || 'system-ui'};
          --font-mono: ${computedStyle.getPropertyValue('--font-mono').trim() || 'monospace'};
        }
        ${bgOverride}
      </style>
    `;

    // Inject theme vars into <head> if it exists
    if (this._content.includes('</head>')) {
      return this._content.replace('</head>', `${themeVars}</head>`);
    }

    // Otherwise prepend
    return themeVars + this._content;
  }

  render() {
    if (this._loading) {
      return html`<div class="loading">Loading prototype...</div>`;
    }

    if (this._error) {
      return html`<div class="error">Error: ${this._error}</div>`;
    }

    const heightPx = this.height.includes('px') ? this.height : `${this.height}px`;

    return html`
      <div class="container">
        <span class="label">prototype</span>
        <iframe
          class="sandbox-frame"
          style="height: ${heightPx}"
          srcdoc=${this._prepareSrcdoc()}
          sandbox="allow-scripts"
          loading="lazy"
        ></iframe>
      </div>
    `;
  }
}

customElements.define('proto-sandbox', ProtoSandbox);
