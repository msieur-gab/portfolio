import { LitElement, html, css } from 'https://esm.sh/lit@3.1.0';

/**
 * ScrollSync - Synchronized scroll-based media viewing
 *
 * Watches figure[data-media] elements in slotted content,
 * tracks scroll position, and displays active media in sticky aside.
 *
 * @element scroll-sync
 * @slot content - Article content containing figure[data-media] anchors
 */
export class ScrollSync extends LitElement {
  static properties = {
    stickyHeaders: { type: String, attribute: 'sticky-headers' },
    mediaPosition: { type: String, attribute: 'media-position' },
    split: { type: String },
    maxWidth: { type: String, attribute: 'max-width' },
    zoneDown: { type: Number, attribute: 'zone-down' },
    zoneUp: { type: Number, attribute: 'zone-up' },
    bottomThreshold: { type: Number, attribute: 'bottom-threshold' },
    debug: { type: Boolean, reflect: true },
    _currentIndex: { state: true },
    _scrollDirection: { state: true },
    _mediaCount: { state: true }
  };

  static styles = css`
    :host {
      display: grid;
      grid-template-columns: var(--scroll-sync-columns, 1fr 1fr);
      gap: var(--scroll-sync-gap, 32px);
      max-width: var(--scroll-sync-max-width, 100%);
      margin: 0 auto;
      padding: var(--scroll-sync-padding, 32px);
      overflow-y: auto;
      height: 100%;
    }

    :host([media-position="left"]) ::slotted(article) {
      order: 2;
    }

    :host([media-position="left"]) .media-container {
      order: 1;
    }

    ::slotted(article) {
      max-width: none;
      min-width: 0;
    }

    .media-container {
      position: sticky;
      top: 0;
      height: calc(100vh - 100px);
      min-width: 200px;
      /* background: var(--scroll-sync-media-bg, #d0d0d0); */
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 8px;
    }

    .media-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 32px;
      text-align: center;
    }

    .media-slot img {
      max-width: 100%;
      max-height: 80%;
      object-fit: contain;
      transition: filter 0.3s ease;
    }

    /* Dark mode image treatment */
    :host-context([data-theme="dark"]) .media-slot img {
      filter: brightness(0.8) grayscale(1);
    }

    :host-context([data-theme="dark"]) .media-slot img:hover,
    :host-context([data-theme="dark"]) .media-slot img:active {
      filter: brightness(1) grayscale(0);
    }

    .media-slot figcaption {
      margin-top: 16px;
      font-size: 0.875rem;
      color: var(--push-50, #666);
    }

    /* Quote figures */
    .media-slot blockquote {
      font-family: var(--font-serif);
      font-size: 1.5rem;
      font-style: normal;
      line-height: 1.6;
      max-width: 50ch;
      text-align: center;
      border: none;
      padding: 0;
      margin: 0;
    }

    .media-slot blockquote cite {
      display: block;
      font-family: var(--font-sans);
      font-style: normal;
      font-size: 0.8125rem;
      margin-top: 0.5rem;
      opacity: 0.5;
    }

    /* Code figures */
    .media-slot pre {
      background: var(--color-text, #1a1a1a);
      color: var(--color-bg, #fafafa);
      padding: 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      max-width: 100%;
      font-size: 0.875rem;
      line-height: 1.5;
      text-align: left;
    }

    .media-slot code {
      font-family: 'SF Mono', Monaco, Consolas, monospace;
    }

    /* Debug UI */
    .debug-panel {
      display: none;
      position: fixed;
      bottom: 16px;
      left: 16px;
      background: rgba(0,0,0,0.85);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 4px;
      z-index: 1000;
      pointer-events: none;
    }

    :host([debug]) .debug-panel {
      display: block;
    }

    .trigger-line {
      display: none;
      position: absolute;
      height: 1px;
      background: rgba(255, 0, 0, 0.6);
      z-index: 999;
      pointer-events: none;
      left: 0;
      right: 50%;
    }

    :host([debug]) .trigger-line {
      display: block;
    }

    :host([media-position="left"]) .trigger-line {
      left: 50%;
      right: 0;
    }

    .trigger-line::after {
      content: 'reading zone';
      position: absolute;
      left: 0.5rem;
      top: 4px;
      font-size: 10px;
      font-family: monospace;
      color: rgba(255, 0, 0, 0.8);
    }

    @media (max-width: 900px) {
      :host {
        display: block;
      }

      .media-container,
      .debug-panel,
      .trigger-line {
        display: none !important;
      }
    }
  `;

  constructor() {
    super();
    this.stickyHeaders = '';
    this.mediaPosition = 'right';
    this.split = '1:1';
    this.maxWidth = '100%';
    this.zoneDown = 0.30;
    this.zoneUp = 0.45;
    this.bottomThreshold = 0.95;
    this.debug = false;

    this._currentIndex = -1;
    this._scrollDirection = 'down';
    this._mediaCount = 0;
    this._mediaElements = [];
    this._anchorPositions = [];
    this._lastScrollY = 0;
    this._ticking = false;
    this._resizeTimeout = null;
    this._resizeObserver = null;
    this._stickyOffset = 0;
    this._scrollContainer = null;

    this._onScroll = this._onScroll.bind(this);
    this._onResize = this._onResize.bind(this);
  }

  firstUpdated() {
    this._initialize();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanup();
  }

  render() {
    const zoneY = this._getReadingZoneY();
    const gridColumns = this._getGridColumns();

    return html`
      <style>:host { --scroll-sync-columns: ${gridColumns}; --scroll-sync-max-width: ${this.maxWidth}; }</style>

      <slot name="content" @slotchange=${this._onContentSlotChange}></slot>

      <div class="media-container" part="media-container">
        <figure class="media-slot" part="media-slot"></figure>
      </div>

      <div class="debug-panel" part="debug">
        dir: ${this._scrollDirection} |
        zone: ${Math.round(zoneY)}px |
        active: ${this._currentIndex + 1}/${this._mediaCount}
      </div>

      <div class="trigger-line" part="trigger-line" style="top: ${zoneY}px"></div>
    `;
  }

  _getGridColumns() {
    let content = 1, media = 1;

    if (this.split?.includes(':')) {
      const parts = this.split.split(':').map(s => parseInt(s.trim(), 10));
      if (!isNaN(parts[0]) && !isNaN(parts[1])) {
        content = parts[0];
        media = parts[1];
      }
    }

    return this.mediaPosition === 'left'
      ? `${media}fr ${content}fr`
      : `${content}fr ${media}fr`;
  }

  recompute() {
    this._discoverMediaElements();
    this._computeStickyOffset();
    this._computeAnchorPositions();

    if (this._mediaElements.length > 0) {
      this._currentIndex = -1;
      this._showMedia(0);
    }

    this._update();
  }

  getState() {
    return {
      currentIndex: this._currentIndex,
      total: this._mediaCount,
      direction: this._scrollDirection
    };
  }

  _initialize() {
    // Use self as scroll container (host element)
    this._scrollContainer = this;

    this._discoverMediaElements();
    this._computeStickyOffset();
    this._computeAnchorPositions();

    if (this._mediaElements.length > 0) {
      this._showMedia(0);
    }

    // Listen to own scroll events
    this.addEventListener('scroll', this._onScroll, { passive: true });
    window.addEventListener('resize', this._onResize, { passive: true });
    this._setupResizeObserver();
  }

  _cleanup() {
    this.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('resize', this._onResize);
    clearTimeout(this._resizeTimeout);
    this._resizeObserver?.disconnect();
  }

  _setupResizeObserver() {
    const contentSlot = this.shadowRoot.querySelector('slot[name="content"]');
    const assignedNodes = contentSlot?.assignedElements() || [];

    if (assignedNodes.length > 0 && 'ResizeObserver' in window) {
      this._resizeObserver = new ResizeObserver(() => this._onResize());
      assignedNodes.forEach(node => this._resizeObserver.observe(node));
    }
  }

  _onContentSlotChange() {
    this._discoverMediaElements();
    this._computeAnchorPositions();

    if (this._mediaElements.length > 0 && this._currentIndex === -1) {
      this._showMedia(0);
    }
  }

  _discoverMediaElements() {
    const contentSlot = this.shadowRoot.querySelector('slot[name="content"]');
    const assignedNodes = contentSlot?.assignedElements() || [];

    this._mediaElements = [];

    assignedNodes.forEach(node => {
      const figures = node.querySelectorAll('figure[data-media]');
      this._mediaElements.push(...figures);
    });

    this._mediaCount = this._mediaElements.length;
  }

  _computeStickyOffset() {
    if (!this.stickyHeaders) {
      this._stickyOffset = 0;
      return;
    }

    const headers = this.stickyHeaders.split(',').map(h => h.trim());
    let maxOffset = 0;

    const contentSlot = this.shadowRoot.querySelector('slot[name="content"]');
    const assignedNodes = contentSlot?.assignedElements() || [];

    assignedNodes.forEach(node => {
      headers.forEach(tag => {
        const elements = node.querySelectorAll(tag);
        elements.forEach(el => {
          const style = getComputedStyle(el);
          if (style.position === 'sticky') {
            maxOffset = Math.max(maxOffset, el.offsetHeight);
          }
        });
      });
    });

    this._stickyOffset = maxOffset;
  }

  _computeAnchorPositions() {
    const scrollY = this.scrollTop;
    const containerRect = this.getBoundingClientRect();

    this._anchorPositions = this._mediaElements.map((el, index) => {
      const rect = el.getBoundingClientRect();
      return {
        element: el,
        index,
        // Position relative to scroll container
        offsetTop: rect.top - containerRect.top + scrollY
      };
    });
  }

  _getReadingZoneY() {
    const containerHeight = this.clientHeight || window.innerHeight;
    const baseZone = this._scrollDirection === 'down'
      ? containerHeight * this.zoneDown
      : containerHeight * this.zoneUp;

    return baseZone + this._stickyOffset;
  }

  _showMedia(index) {
    if (index === this._currentIndex) return;
    if (index < 0 || index >= this._mediaElements.length) return;

    const sourceEl = this._mediaElements[index];

    // Remove previous active state
    if (this._currentIndex >= 0 && this._currentIndex < this._mediaElements.length) {
      this._mediaElements[this._currentIndex].removeAttribute('data-active');
    }

    sourceEl.setAttribute('data-active', '');

    const mediaSlot = this.shadowRoot.querySelector('.media-slot');
    if (mediaSlot) {
      mediaSlot.innerHTML = sourceEl.innerHTML;
    }

    const oldIndex = this._currentIndex;
    this._currentIndex = index;

    this.dispatchEvent(new CustomEvent('media-change', {
      bubbles: true,
      composed: true,
      detail: {
        index,
        element: sourceEl,
        isFirst: index === 0,
        isLast: index === this._mediaElements.length - 1,
        previousIndex: oldIndex
      }
    }));
  }

  _update() {
    if (this._mediaElements.length === 0) return;

    const scrollY = this.scrollTop;
    const containerHeight = this.clientHeight;
    const scrollHeight = this.scrollHeight;
    const scrollableHeight = scrollHeight - containerHeight;
    const scrollProgress = scrollableHeight > 0 ? scrollY / scrollableHeight : 0;

    const zoneY = this._getReadingZoneY();
    const readingZoneAbsolute = scrollY + zoneY;

    let activeIndex = 0;

    for (const pos of this._anchorPositions) {
      if (pos.offsetTop <= readingZoneAbsolute) {
        activeIndex = pos.index;
      } else {
        break;
      }
    }

    if (scrollProgress > this.bottomThreshold) {
      activeIndex = this._mediaElements.length - 1;
    }

    this._showMedia(activeIndex);
    this.requestUpdate();
  }

  _onScroll() {
    const currentScrollY = this.scrollTop;

    if (Math.abs(currentScrollY - this._lastScrollY) > 5) {
      this._scrollDirection = currentScrollY > this._lastScrollY ? 'down' : 'up';
      this._lastScrollY = currentScrollY;
    }

    if (!this._ticking) {
      requestAnimationFrame(() => {
        this._update();
        this._ticking = false;
      });
      this._ticking = true;
    }
  }

  _onResize() {
    clearTimeout(this._resizeTimeout);
    this._resizeTimeout = setTimeout(() => {
      this._computeStickyOffset();
      this._computeAnchorPositions();
      this._update();
    }, 150);
  }
}

customElements.define('scroll-sync', ScrollSync);
