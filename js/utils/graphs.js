/**
 * FlowDiagrams - SVG diagram engine
 *
 * Requires: dagre.js for layout (loaded from CDN)
 * Uses: --fc-* CSS custom properties for theming
 * Hydrates: code.language-flow elements
 */

import { getIcon } from './icons.js';

// ─── Theme (using CSS variables directly for live updates) ───
const theme = () => ({
  fg:         'var(--fc-fg, #1a1a1a)',
  dim:        'var(--fc-dim, #999)',
  bg:         'var(--fc-bg, #fafaf8)',
  nodeFill:   'var(--fc-node-fill, #fff)',
  nodeStroke: 'var(--fc-node-stroke, #bbb)',
  edgeStroke: 'var(--fc-edge-stroke, #bbb)',
  surface:    'var(--fc-surface, #fff)',
});

// ─── Config ────────────────────────────────────────────
const C = {
  fontSize: 12,
  edgeFontSize: 10,
  padX: 16,
  padY: 10,
  minW: 72,
  cornerR: 5,
  rankSep: 56,
  nodeSep: 36,
  margin: 24,
  iconSize: 14,
  iconGap: 5,
};

// ─── Dagre loader ──────────────────────────────────────
let dagre = null;

async function loadDagre() {
  if (dagre) return dagre;
  if (typeof window !== 'undefined' && window.dagre) {
    dagre = window.dagre;
    return dagre;
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/dagre@0.8.5/dist/dagre.min.js';
    script.onload = () => { dagre = window.dagre; resolve(dagre); };
    script.onerror = () => reject(new Error('Failed to load Dagre'));
    document.head.appendChild(script);
  });
}

// ─── SVG primitives ────────────────────────────────────
const NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  return e;
}

function txt(x, y, str, o = {}) {
  const t = el('text', {
    x, y, fill: o.fill || theme().dim,
    'font-family': o.font || 'var(--fc-font, system-ui, sans-serif)',
    'font-size': o.size || C.fontSize,
    'text-anchor': o.anchor || 'middle',
    'dominant-baseline': o.baseline || 'central',
  });
  if (o.italic) t.setAttribute('font-style', 'italic');
  t.textContent = str;
  return t;
}

// ─── Text measurement ──────────────────────────────────
let _canvas = null;
function measure(text, size) {
  if (!_canvas) _canvas = document.createElement('canvas');
  const ctx = _canvas.getContext('2d');
  ctx.font = `${size}px system-ui, sans-serif`;
  return ctx.measureText(text).width;
}

// ─── Parser ────────────────────────────────────────────
export function parse(src) {
  const nodes = new Map();
  const edges = [];
  const meta = {};
  const lines = src.trim().split('\n').map(l => l.trim()).filter(l => l);

  let dataStart = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#')) { dataStart = i + 1; continue; }
    const m = lines[i].match(/^(\w+)\s*:\s*(.+)$/);
    if (m && !lines[i].includes('[') && !lines[i].includes('->')) {
      meta[m[1].toLowerCase()] = m[2].trim();
      dataStart = i + 1;
    } else {
      break;
    }
  }

  for (let i = 0; i < dataStart; i++) {
    if (lines[i].startsWith('#')) {
      meta.title = lines[i].replace(/^#+\s*/, '').trim();
      break;
    }
  }

  const nodeRe = /\[(?:<([\w\s:]+)>\s*)?([^\]]+)\]/g;

  for (let i = dataStart; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('#')) continue;

    const matches = [...line.matchAll(nodeRe)];
    for (const m of matches) {
      const mods = (m[1] || '').trim().split(/\s+/).filter(Boolean);
      let shape = 'roundrect', icon = null;
      for (const mod of mods) {
        if (mod.startsWith('icon:')) icon = mod.slice(5);
        else shape = mod;
      }
      const label = m[2].trim();
      if (!nodes.has(label)) nodes.set(label, { id: label, label, shape, icon });
    }

    if (matches.length >= 2) {
      for (let j = 0; j < matches.length - 1; j++) {
        const from = matches[j][2].trim();
        const to = matches[j + 1][2].trim();
        const between = line.slice(
          matches[j].index + matches[j][0].length,
          matches[j + 1].index
        ).trim();
        const lm = between.match(/^->\s*(.+?)\s*->$/);
        edges.push({ from, to, label: lm ? lm[1].trim() : '' });
      }
    }
  }

  return { nodes: [...nodes.values()], edges, meta };
}

// ─── Layout (dagre) ────────────────────────────────────
async function layout(parsed) {
  const d = await loadDagre();
  const dir = (parsed.meta.dir || 'TB').toUpperCase();
  const g = new d.graphlib.Graph();
  g.setGraph({
    rankdir: dir,
    nodesep: C.nodeSep,
    ranksep: C.rankSep,
    marginx: C.margin,
    marginy: C.margin,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of parsed.nodes) {
    const hasIcon = node.icon && getIcon(node.icon);
    const iconExtra = hasIcon ? C.iconSize + C.iconGap : 0;
    const tw = measure(node.label, C.fontSize);
    const w = Math.max(C.minW, tw + iconExtra + C.padX * 2);
    const h = C.fontSize + C.padY * 2;
    g.setNode(node.id, { ...node, width: w, height: h });
  }

  for (const edge of parsed.edges) {
    const opts = {};
    if (edge.label) {
      opts.label = edge.label;
      opts.width = measure(edge.label, C.edgeFontSize) + 12;
      opts.height = C.edgeFontSize + 8;
    }
    g.setEdge(edge.from, edge.to, opts);
  }

  d.layout(g);
  return { graph: g, meta: parsed.meta };
}

// ─── Edge path (curved) ────────────────────────────────
function edgePath(points) {
  if (!points || points.length < 2) return '';
  const f = v => v.toFixed(1);

  if (points.length === 2) {
    const [a, b] = points;
    return `M${f(a.x)},${f(a.y)} L${f(b.x)},${f(b.y)}`;
  }
  if (points.length === 3) {
    const [a, cp, b] = points;
    return `M${f(a.x)},${f(a.y)} Q${f(cp.x)},${f(cp.y)} ${f(b.x)},${f(b.y)}`;
  }

  let d = `M${f(points[0].x)},${f(points[0].y)}`;
  for (let i = 1; i < points.length - 1; i += 2) {
    const cp = points[i];
    const end = points[Math.min(i + 1, points.length - 1)];
    d += ` S${f(cp.x)},${f(cp.y)} ${f(end.x)},${f(end.y)}`;
  }
  const last = points[points.length - 1];
  if (!d.endsWith(`${f(last.x)},${f(last.y)}`)) {
    d += ` L${f(last.x)},${f(last.y)}`;
  }
  return d;
}

// ─── Shape paths ───────────────────────────────────────
function shapePath(shape, x, y, w, h) {
  const r = C.cornerR, hw = w / 2, hh = h / 2;
  const l = x - hw, ri = x + hw, t = y - hh, b = y + hh;

  switch (shape) {
    case 'rect':
      return `M${l},${t}H${ri}V${b}H${l}Z`;
    case 'diamond':
      return `M${x},${t - 4}L${ri + 8},${y}L${x},${b + 4}L${l - 8},${y}Z`;
    case 'ellipse':
      return `M${l},${y}A${hw},${hh} 0 1,1 ${ri},${y}A${hw},${hh} 0 1,1 ${l},${y}Z`;
    case 'database': {
      const ry = 6;
      return `M${l},${t + ry}A${hw},${ry} 0 0,1 ${ri},${t + ry}V${b - ry}A${hw},${ry} 0 0,1 ${l},${b - ry}Z` +
             ` M${l},${t + ry}A${hw},${ry} 0 0,0 ${ri},${t + ry}`;
    }
    case 'hexagon': {
      const ins = 12;
      return `M${l + ins},${t}H${ri - ins}L${ri},${y}L${ri - ins},${b}H${l + ins}L${l},${y}Z`;
    }
    default: // roundrect
      return `M${l + r},${t}H${ri - r}Q${ri},${t} ${ri},${t + r}V${b - r}Q${ri},${b} ${ri - r},${b}H${l + r}Q${l},${b} ${l},${b - r}V${t + r}Q${l},${t} ${l + r},${t}Z`;
  }
}

// ─── Edge label collision resolution ───────────────────
function resolveCollisions(labels) {
  const pad = 4;
  for (let iter = 0; iter < 8; iter++) {
    let moved = false;
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i], b = labels[j];
        const ox = (a.w / 2 + b.w / 2 + pad) - Math.abs(a.x - b.x);
        const oy = (a.h / 2 + b.h / 2 + pad) - Math.abs(a.y - b.y);
        if (ox > 0 && oy > 0) {
          if (oy < ox) {
            const s = oy / 2 + 1;
            if (a.y < b.y) { a.y -= s; b.y += s; } else { a.y += s; b.y -= s; }
          } else {
            const s = ox / 2 + 1;
            if (a.x < b.x) { a.x -= s; b.x += s; } else { a.x += s; b.x -= s; }
          }
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return labels;
}

// ─── Renderer ──────────────────────────────────────────
function renderSVG({ graph: g, meta }) {
  const t = theme();
  const gInfo = g.graph();
  const w = gInfo.width || 400;
  const h = gInfo.height || 300;
  const totalH = meta.title ? h + 28 : h;
  const titleOff = meta.title ? 28 : 0;

  const root = el('svg', {
    viewBox: `0 0 ${w} ${totalH}`,
    preserveAspectRatio: 'xMidYMid meet',
    width: '100%', height: '100%',
  });
  root.style.cssText = 'overflow:visible;display:block;';

  // Arrow marker
  const defs = el('defs');
  const marker = el('marker', {
    id: 'fc-arrow', viewBox: '0 0 10 10',
    refX: 9, refY: 5,
    markerWidth: 7, markerHeight: 7,
    orient: 'auto-start-reverse',
  });
  marker.appendChild(el('path', { d: 'M0,1.5L9,5L0,8.5z', fill: t.edgeStroke }));
  defs.appendChild(marker);
  root.appendChild(defs);

  // Title
  if (meta.title) {
    const title = txt(C.margin, 16, meta.title, {
      anchor: 'start', size: 11, fill: t.fg,
      font: 'var(--fc-mono, monospace)',
    });
    title.style.opacity = '0.5';
    root.appendChild(title);
  }

  // Offset group for title spacing
  const main = el('g');
  if (titleOff) main.setAttribute('transform', `translate(0,${titleOff})`);
  root.appendChild(main);

  // Edges
  for (const e of g.edges()) {
    const ed = g.edge(e);
    const d = edgePath(ed.points || []);
    if (d) {
      main.appendChild(el('path', {
        d, fill: 'none',
        stroke: t.edgeStroke,
        'stroke-width': 1.25,
        'stroke-linecap': 'round',
        'marker-end': 'url(#fc-arrow)',
      }));
    }
  }

  // Edge labels
  const edgeLabels = [];
  for (const e of g.edges()) {
    const ed = g.edge(e);
    if (ed.label) {
      const tw = measure(ed.label, C.edgeFontSize);
      edgeLabels.push({
        text: ed.label, x: ed.x, y: ed.y,
        w: tw + 12, h: C.edgeFontSize + 8,
      });
    }
  }
  resolveCollisions(edgeLabels);

  for (const lb of edgeLabels) {
    main.appendChild(el('rect', {
      x: lb.x - lb.w / 2, y: lb.y - lb.h / 2,
      width: lb.w, height: lb.h,
      rx: 3, fill: t.bg,
      stroke: t.edgeStroke,
      'stroke-width': 0.5,
      opacity: 0.9,
    }));
    main.appendChild(txt(lb.x, lb.y, lb.text, {
      size: C.edgeFontSize, fill: t.dim, italic: true,
    }));
  }

  // Nodes
  for (const nid of g.nodes()) {
    const n = g.node(nid);
    if (!n) continue;

    // Shape
    const d = shapePath(n.shape || 'roundrect', n.x, n.y, n.width, n.height);
    main.appendChild(el('path', {
      d, fill: t.nodeFill,
      stroke: t.nodeStroke,
      'stroke-width': 1.25,
    }));

    // Icon + label
    const iconPath = n.icon && getIcon(n.icon);
    if (iconPath) {
      const tw = measure(n.label, C.fontSize);
      const total = tw + C.iconSize + C.iconGap;
      const ix = n.x - total / 2;
      const iy = n.y - C.iconSize / 2;

      const iconG = el('g', { transform: `translate(${ix},${iy})` });
      iconG.appendChild(el('path', {
        d: iconPath,
        fill: t.fg,
        'fill-rule': 'evenodd',
        opacity: 0.55,
      }));
      main.appendChild(iconG);

      const tx = ix + C.iconSize + C.iconGap + tw / 2;
      main.appendChild(txt(tx, n.y, n.label, { size: C.fontSize, fill: t.fg }));
    } else {
      main.appendChild(txt(n.x, n.y, n.label, { size: C.fontSize, fill: t.fg }));
    }
  }

  return root;
}

// ─── Public API ────────────────────────────────────────

/**
 * Render a flow diagram into a container
 * @param {Element} container - Target container
 * @param {string} src - Diagram source
 * @param {Object} opts - Options (dir: 'TB'|'LR')
 * @returns {Promise<SVGElement>}
 */
export async function render(container, src, opts = {}) {
  const parsed = parse(src);
  if (opts.dir) parsed.meta.dir = opts.dir;

  if (parsed.nodes.length === 0) {
    container.innerHTML = '<svg viewBox="0 0 200 50"><text x="100" y="25" text-anchor="middle" font-size="12" fill="#999">No nodes defined</text></svg>';
    return;
  }

  const laid = await layout(parsed);
  const svg = renderSVG(laid);
  container.innerHTML = '';
  container.appendChild(svg);
  return svg;
}

/**
 * Hydrate all flow diagram code blocks in a container
 * Finds <code class="language-flow"> elements
 * @param {Element} root - Root element to search
 */
export async function hydrate(root) {
  const codeBlocks = (root || document).querySelectorAll('code.language-flow');

  for (const code of codeBlocks) {
    const content = code.textContent;
    const wrap = document.createElement('div');
    wrap.className = 'fc-diagram';
    wrap.style.cssText = 'display:flex;justify-content:center;align-items:center;width:100%;height:100%;';

    const pre = code.closest('pre');
    if (pre) {
      pre.replaceWith(wrap);
    } else {
      code.replaceWith(wrap);
    }

    await render(wrap, content);
  }
}
