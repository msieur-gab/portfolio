/**
 * FlowCharts - SVG chart rendering
 *
 * Supports: bar, hbar, line, area, stacked, pie, donut, scatter
 *
 * Data format:
 *   title: Chart Title
 *   description: Optional description
 *
 *   Category, A, B, C
 *   Series1, 10, 20, 30
 */

// ─── Theme (CSS variables for live theme switching) ─────
const pal = () => [
  'var(--fc-p1, #c8a030)',
  'var(--fc-p2, #a07828)',
  'var(--fc-p3, #d4b450)',
  'var(--fc-p4, #8a6020)',
  'var(--fc-p5, #e0c868)',
  'var(--fc-p6, #705018)',
];
const col = () => ({
  fg: 'var(--fc-fg, #1a1a1a)',
  dim: 'var(--fc-dim, #888)',
  grid: 'var(--fc-grid, #e0e0de)',
  bg: 'var(--fc-bg, #fafaf8)',
  surface: 'var(--fc-surface, #fff)',
});

// ─── SVG primitives ────────────────────────────────────
const NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  return e;
}

function txt(x, y, str, o = {}) {
  const t = el('text', {
    x, y, fill: o.fill || col().dim,
    'font-family': "var(--fc-mono, ui-monospace, 'SF Mono', monospace)",
    'font-size': o.size || 8,
    'text-anchor': o.anchor || 'middle',
    'dominant-baseline': o.baseline || 'auto',
  });
  t.textContent = str;
  return t;
}

function tip(node, label) {
  node.classList.add('fc-hoverable');
  node.dataset.tip = label;
  return node;
}

// ─── Math ──────────────────────────────────────────────
function niceMax(v) {
  if (!isFinite(v) || isNaN(v) || v <= 0) return 10;
  const m = Math.pow(10, Math.floor(Math.log10(v))), n = v / m;
  return (n <= 1.2 ? 1.2 : n <= 1.5 ? 1.5 : n <= 2 ? 2 : n <= 3 ? 3 : n <= 5 ? 5 : n <= 7.5 ? 7.5 : 10) * m;
}

function niceStep(max) {
  if (!isFinite(max) || max <= 0) return 1;
  const r = max / 5, m = Math.pow(10, Math.floor(Math.log10(r))), n = r / m;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * m;
}

// ─── Bézier ────────────────────────────────────────────
function bzLine(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i], cx = (p.x + c.x) / 2;
    d += ` C${cx},${p.y} ${cx},${c.y} ${c.x},${c.y}`;
  }
  return d;
}

function bzArea(pts, baseY, lx, rx) {
  if (pts.length < 2) return '';
  let d = `M${lx},${baseY} L${lx},${pts[0].y} L${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i], cx = (p.x + c.x) / 2;
    d += ` C${cx},${p.y} ${cx},${c.y} ${c.x},${c.y}`;
  }
  return d + ` L${rx},${pts[pts.length - 1].y} L${rx},${baseY} Z`;
}

// ─── Parser ────────────────────────────────────────────
export function parseSource(src) {
  const lines = src.trim().split('\n').map(l => l.trim()).filter(l => l);
  const meta = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const m = lines[i].match(/^(\w+)\s*:\s*(.+)$/);
    if (m) meta[m[1].toLowerCase()] = m[2].trim();
    else break;
  }
  const rows = lines.slice(i).map(l => l.split(',').map(s => s.trim()));
  return { meta, header: rows[0] || [], rows: rows.slice(1) };
}

function parseSeries(d) {
  return {
    cats: d.header.slice(1),
    series: d.rows.map(r => ({ label: r[0], values: r.slice(1).map(Number) })),
  };
}

function parsePie(d) {
  const rows = isNaN(Number(d.header[1])) ? d.rows : [d.header, ...d.rows];
  return rows.map(r => ({ label: r[0], value: Number(r[1]) }));
}

function parseScatter(d) {
  const has = isNaN(Number(d.header[0]));
  return {
    labels: has ? { x: d.header[0], y: d.header[1] } : { x: 'X', y: 'Y' },
    points: (has ? d.rows : [d.header, ...d.rows]).map(r => ({ x: +r[0], y: +r[1], label: r[2] || '' })),
  };
}

// ─── Scaffold ──────────────────────────────────────────
const LEGEND_H = 32;
const DESC_H = 20;

function frame(data, opts = {}) {
  const { cats, series } = parseSeries(data);

  // Guard against empty data
  if (!cats.length || !series.length) {
    return null;
  }

  const hasTitle = !!data.meta.title;
  const hasDesc = !!data.meta.description;
  const W = opts.W || 600;
  const H = (opts.H || 340) + (hasTitle ? 28 : 0) + (hasDesc ? DESC_H : 0) + LEGEND_H;
  const pad = {
    t: (opts.padT || 20) + (hasTitle ? 28 : 0) + (hasDesc ? DESC_H : 0),
    r: opts.padR || 24,
    b: (opts.padB || 40) + LEGEND_H,
    l: opts.padL || 56,
  };
  const p = pal(), c = col();
  const maxVal = niceMax(Math.max(...(
    opts.maxFrom ? opts.maxFrom(series, cats) : series.flatMap(s => s.values).filter(v => isFinite(v))
  )));
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const baseY = pad.t + plotH;

  const root = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', width: '100%', height: '100%' });
  root.style.cssText = 'overflow:visible;display:block;';

  // Title
  if (hasTitle) {
    const t = txt(pad.l, 18, data.meta.title, { anchor: 'start', size: 14, fill: c.fg });
    t.style.fontWeight = '500';
    t.style.opacity = '0.8';
    root.appendChild(t);
  }

  // Description
  if (hasDesc) {
    const d = txt(pad.l, hasTitle ? 38 : 18, data.meta.description, { anchor: 'start', size: 11, fill: c.dim });
    d.style.opacity = '0.6';
    root.appendChild(d);
  }

  // Y grid + labels
  const step = niceStep(maxVal);
  for (let v = 0; v <= maxVal; v += step) {
    const y = baseY - (v / maxVal) * plotH;
    root.appendChild(el('line', { x1: pad.l, x2: W - pad.r, y1: y, y2: y, stroke: c.grid, 'stroke-width': 1 }));
    root.appendChild(txt(pad.l - 8, y + 4, v, { anchor: 'end', size: 11, fill: c.dim }));
  }

  // X category labels
  const centered = opts.centered !== false;
  const n = cats.length;
  const slotW = centered ? plotW / n : (n > 1 ? plotW / (n - 1) : plotW);
  const fontSize = Math.min(11, Math.max(8, slotW / 4));

  cats.forEach((cat, i) => {
    const x = centered
      ? pad.l + slotW * i + slotW / 2
      : pad.l + (plotW / Math.max(n - 1, 1)) * i;
    root.appendChild(txt(x, baseY + 18, cat, { size: fontSize, fill: c.dim }));
  });

  return { root, p, c, pad, plotW, plotH, baseY, maxVal, cats, series, W, H };
}

function legend(f, style) {
  const y = f.H - 12;
  let x = f.pad.l;
  f.series.forEach((s, i) => {
    const c = f.p[i % f.p.length];
    if (style === 'line') {
      f.root.appendChild(el('line', { x1: x, y1: y, x2: x + 16, y2: y, stroke: c, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
      f.root.appendChild(el('circle', { cx: x + 8, cy: y, r: 2.5, fill: c }));
    } else {
      f.root.appendChild(el('rect', { x, y: y - 5, width: 10, height: 10, rx: 2, fill: c, opacity: 0.85 }));
    }
    f.root.appendChild(txt(x + 16, y + 4, s.label, { anchor: 'start', size: 11, fill: f.c.dim }));
    x += 24 + s.label.length * 6.5;
  });
}

function mapPts(f, si) {
  const n = f.cats.length;
  return f.series[si].values.map((v, i) => ({
    x: f.pad.l + (f.plotW / Math.max(n - 1, 1)) * i,
    y: f.baseY - ((v || 0) / f.maxVal) * f.plotH,
    v,
  }));
}

// ─── Renderers ─────────────────────────────────────────

function renderBar(data) {
  const f = frame(data);
  if (!f) return emptyChart('No data');

  const gw = f.plotW / f.cats.length;
  const bw = Math.min(gw / (f.series.length + 1), 28);

  f.cats.forEach((_, ci) => {
    const cx = f.pad.l + gw * ci + gw / 2;
    f.series.forEach((s, si) => {
      const val = s.values[ci] || 0;
      const bh = (val / f.maxVal) * f.plotH;
      f.root.appendChild(tip(el('rect', {
        x: cx - (f.series.length * bw) / 2 + si * bw + 1,
        y: f.baseY - bh, width: bw - 2, height: bh,
        rx: 2, fill: f.p[si % f.p.length], opacity: 0.85,
      }), `${s.label}: ${val}`));
    });
  });
  legend(f, 'bar');
  return f.root;
}

function renderLine(data) {
  const f = frame(data, { centered: false });
  if (!f) return emptyChart('No data');

  const defs = el('defs');
  f.series.forEach((_, si) => {
    const g = el('linearGradient', { id: `lg${si}`, x1: 0, y1: 0, x2: 0, y2: 1 });
    g.appendChild(el('stop', { offset: '0%', 'stop-color': f.p[si], 'stop-opacity': 0.18 }));
    g.appendChild(el('stop', { offset: '100%', 'stop-color': f.p[si], 'stop-opacity': 0.01 }));
    defs.appendChild(g);
  });
  f.root.appendChild(defs);

  f.series.forEach((s, si) => {
    const pts = mapPts(f, si);
    f.root.appendChild(el('path', { d: bzArea(pts, f.baseY, f.pad.l, f.pad.l + f.plotW), fill: `url(#lg${si})` }));
    f.root.appendChild(el('path', {
      d: bzLine(pts), fill: 'none', stroke: f.p[si],
      'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    }));
    pts.forEach(pt => {
      f.root.appendChild(el('circle', { cx: pt.x, cy: pt.y, r: 4, fill: f.c.bg }));
      f.root.appendChild(tip(el('circle', {
        cx: pt.x, cy: pt.y, r: 3.5, fill: 'none', stroke: f.p[si], 'stroke-width': 2,
      }), `${s.label}: ${pt.v}`));
    });
  });
  legend(f, 'line');
  return f.root;
}

function renderArea(data) {
  const f = frame(data, { centered: false });
  if (!f) return emptyChart('No data');

  const order = f.series.map((_, i) => i).sort((a, b) =>
    Math.max(...f.series[b].values) - Math.max(...f.series[a].values));

  order.forEach(si => {
    const pts = mapPts(f, si);
    f.root.appendChild(el('path', {
      d: bzArea(pts, f.baseY, f.pad.l, f.pad.l + f.plotW),
      fill: f.p[si], opacity: 0.35,
    }));
  });
  [...order].reverse().forEach(si => {
    const pts = mapPts(f, si);
    f.root.appendChild(el('path', {
      d: bzLine(pts), fill: 'none', stroke: f.p[si],
      'stroke-width': 1.75, 'stroke-linecap': 'round',
    }));
    pts.forEach(pt => f.root.appendChild(tip(
      el('circle', { cx: pt.x, cy: pt.y, r: 3, fill: f.p[si] }),
      `${f.series[si].label}: ${pt.v}`
    )));
  });
  legend(f, 'area');
  return f.root;
}

function renderStacked(data) {
  const f = frame(data, {
    maxFrom: (series, cats) => cats.map((_, ci) => series.reduce((s, sr) => s + (sr.values[ci] || 0), 0)),
  });
  if (!f) return emptyChart('No data');

  const bw = Math.min(f.plotW / f.cats.length * 0.5, 40);

  f.cats.forEach((_, ci) => {
    const cx = f.pad.l + (f.plotW / f.cats.length) * ci + (f.plotW / f.cats.length) / 2;
    let cum = 0;
    f.series.forEach((s, si) => {
      const val = s.values[ci] || 0;
      const bh = (val / f.maxVal) * f.plotH;
      f.root.appendChild(tip(el('rect', {
        x: cx - bw / 2, y: f.baseY - cum - bh, width: bw, height: bh,
        rx: si === f.series.length - 1 ? 2 : 0,
        fill: f.p[si % f.p.length], opacity: 0.85,
      }), `${s.label}: ${val}`));
      cum += bh;
    });
  });
  legend(f, 'bar');
  return f.root;
}

// ─── Standalone renderers ──────────────────────────────

function mkSvg(W, H) {
  const r = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', width: '100%', height: '100%' });
  r.style.cssText = 'overflow:visible;display:block;';
  return r;
}

function mkHeader(root, meta, x, yStart) {
  let y = yStart;
  if (meta.title) {
    const t = txt(x, y, meta.title, { anchor: 'start', size: 14, fill: col().fg });
    t.style.fontWeight = '500';
    t.style.opacity = '0.8';
    root.appendChild(t);
    y += 22;
  }
  if (meta.description) {
    const d = txt(x, y, meta.description, { anchor: 'start', size: 11, fill: col().dim });
    d.style.opacity = '0.6';
    root.appendChild(d);
    y += 18;
  }
  return y;
}

function emptyChart(msg) {
  const root = mkSvg(300, 120);
  root.appendChild(txt(150, 60, msg || 'No data', { size: 14, fill: col().dim }));
  return root;
}

function renderHBar(data) {
  const rows = data.rows;
  if (!rows.length) return emptyChart('No data');

  const hasTitle = !!data.meta.title;
  const hasDesc = !!data.meta.description;
  const headerH = (hasTitle ? 24 : 0) + (hasDesc ? 18 : 0);
  const W = 600, H = Math.max(240, rows.length * 50 + headerH + 36);
  const pad = { t: headerH + 20, r: 40, b: 16, l: 130 };
  const p = pal(), c = col();
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const barH = Math.min(plotH / rows.length - 8, 32);
  const maxVal = niceMax(Math.max(...rows.map(r => +r[1]).filter(v => isFinite(v))));
  const root = mkSvg(W, H);

  mkHeader(root, data.meta, pad.l, 18);

  rows.forEach((row, i) => {
    const val = +row[1] || 0;
    const y = pad.t + (plotH / rows.length) * i + (plotH / rows.length - barH) / 2;
    const w = (val / maxVal) * plotW;
    root.appendChild(txt(pad.l - 8, y + barH / 2 + 1, row[0], { anchor: 'end', size: 11, baseline: 'middle', fill: c.dim }));
    root.appendChild(tip(el('rect', { x: pad.l, y, width: w, height: barH, rx: 3, fill: p[i % p.length], opacity: 0.85 }), `${row[0]}: ${val}`));
    root.appendChild(txt(pad.l + w + 8, y + barH / 2 + 1, val, { anchor: 'start', size: 11, baseline: 'middle', fill: c.dim }));
  });
  return root;
}

function renderPie(data, donut) {
  const slices = parsePie(data);
  if (!slices.length) return emptyChart('No data');

  const hasTitle = !!data.meta.title;
  const hasDesc = !!data.meta.description;
  const headerH = (hasTitle ? 24 : 0) + (hasDesc ? 18 : 0);
  const W = 420, H = 320 + headerH;
  const cx = W / 2, cy = headerH + 150, r = 110;
  const p = pal(), c = col();
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (!total) return emptyChart('No data');
  const root = mkSvg(W, H);

  mkHeader(root, data.meta, 24, 18);

  let angle = -Math.PI / 2;
  slices.forEach((sl, i) => {
    const sw = (sl.value / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + sw), y2 = cy + r * Math.sin(angle + sw);
    const lg = sw > Math.PI ? 1 : 0;
    let d;
    if (donut) {
      const ir = r * 0.55;
      d = `M${cx + ir * Math.cos(angle)},${cy + ir * Math.sin(angle)} ` +
          `L${x1},${y1} A${r},${r} 0 ${lg} 1 ${x2},${y2} ` +
          `L${cx + ir * Math.cos(angle + sw)},${cy + ir * Math.sin(angle + sw)} ` +
          `A${ir},${ir} 0 ${lg} 0 ${cx + ir * Math.cos(angle)},${cy + ir * Math.sin(angle)}`;
    } else {
      d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${lg} 1 ${x2},${y2} Z`;
    }
    root.appendChild(tip(
      el('path', { d, fill: p[i % p.length], opacity: 0.85 }),
      `${sl.label}: ${sl.value} (${Math.round(sl.value / total * 100)}%)`
    ));
    const mid = angle + sw / 2;
    root.appendChild(txt(cx + (r + 20) * Math.cos(mid), cy + (r + 20) * Math.sin(mid), sl.label, {
      size: 11, fill: p[i % p.length], anchor: Math.cos(mid) < 0 ? 'end' : 'start',
    }));
    angle += sw;
  });
  if (donut) root.appendChild(txt(cx, cy + 6, `${Math.round(slices[0].value / total * 100)}%`, { size: 20, fill: c.fg }));
  return root;
}

function renderScatter(data) {
  const { labels, points } = parseScatter(data);
  if (!points.length) return emptyChart('No data');

  const hasTitle = !!data.meta.title;
  const hasDesc = !!data.meta.description;
  const headerH = (hasTitle ? 24 : 0) + (hasDesc ? 18 : 0);
  const W = 600, H = 340 + headerH;
  const pad = { t: headerH + 20, r: 36, b: 48, l: 56 };
  const p = pal(), c = col();
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const maxX = niceMax(Math.max(...points.map(d => d.x).filter(v => isFinite(v))));
  const maxY = niceMax(Math.max(...points.map(d => d.y).filter(v => isFinite(v))));
  const root = mkSvg(W, H);

  mkHeader(root, data.meta, pad.l, 18);

  for (let v = 0, step = niceStep(maxY); v <= maxY; v += step) {
    const y = pad.t + plotH - (v / maxY) * plotH;
    root.appendChild(el('line', { x1: pad.l, x2: W - pad.r, y1: y, y2: y, stroke: c.grid, 'stroke-width': 1 }));
    root.appendChild(txt(pad.l - 8, y + 4, v, { anchor: 'end', size: 11, fill: c.dim }));
  }
  for (let v = 0, step = niceStep(maxX); v <= maxX; v += step) {
    root.appendChild(txt(pad.l + (v / maxX) * plotW, H - pad.b + 18, v, { size: 11, fill: c.dim }));
  }

  points.forEach((pt, i) => {
    const px = pad.l + (pt.x / maxX) * plotW;
    const py = pad.t + plotH - (pt.y / maxY) * plotH;
    root.appendChild(tip(el('circle', { cx: px, cy: py, r: 8, fill: p[i % p.length], opacity: 0.75 }), `${pt.label}: (${pt.x}, ${pt.y})`));
    if (pt.label) root.appendChild(txt(px, py - 12, pt.label, { size: 10, fill: p[i % p.length] }));
  });

  root.appendChild(txt(pad.l + plotW / 2, H - 10, labels.x, { size: 11, fill: c.dim }));
  const yL = txt(10, pad.t + plotH / 2, labels.y, { size: 11, fill: c.dim });
  yL.setAttribute('transform', `rotate(-90, 10, ${pad.t + plotH / 2})`);
  root.appendChild(yL);
  return root;
}

// ─── API ───────────────────────────────────────────────
const RENDERERS = {
  bar: renderBar,
  hbar: renderHBar,
  line: renderLine,
  area: renderArea,
  pie: d => renderPie(d, false),
  donut: d => renderPie(d, true),
  stacked: renderStacked,
  scatter: renderScatter,
};

/**
 * Render a chart into a container
 * @param {Element} container - Target container
 * @param {string} src - Chart source data
 * @param {string} type - Chart type
 * @returns {SVGElement} The rendered SVG
 */
export function render(container, src, type) {
  const data = parseSource(src);
  type = type || data.meta.type || 'bar';
  const fn = RENDERERS[type];
  if (!fn) return emptyChart(`Unknown: ${type}`);
  container.innerHTML = '';
  return container.appendChild(fn(data));
}

/**
 * Hydrate all chart code blocks in a container
 * Finds <code class="language-chart-{type}"> elements
 * @param {Element} root - Root element to search
 */
export function hydrate(root) {
  (root || document).querySelectorAll('code[class*="language-chart-"]').forEach(code => {
    const m = code.className.match(/language-chart-(\w+)/);
    if (!m) return;

    const content = code.textContent;
    const wrap = document.createElement('div');
    wrap.className = 'fc-chart';
    // Inline styles for shadow DOM compatibility
    wrap.style.cssText = 'display:flex;justify-content:center;align-items:center;width:100%;height:100%;';
    const pre = code.closest('pre');
    if (pre) {
      pre.replaceWith(wrap);
    } else {
      code.replaceWith(wrap);
    }
    render(wrap, content, m[1]);
  });
}

/**
 * Render chart from source string and return SVG element
 * @param {string} src - Chart source
 * @param {string} type - Chart type
 * @returns {SVGElement}
 */
export function renderChart(src, type) {
  const data = parseSource(src);
  type = type || data.meta.type || 'bar';
  const fn = RENDERERS[type];
  if (!fn) return emptyChart(`Unknown: ${type}`);
  return fn(data);
}

