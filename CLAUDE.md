# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Minimal portfolio website — vanilla JavaScript, Lit web components, semantic HTML, CSS custom properties. No build tools, no package manager, no bundler. This is intentional.

**Stack:** ES modules served directly to browser, Lit 3.1.0 from CDN (`esm.sh`), Dagre.js from CDN (for flow diagrams).

## Development

No build step. Serve the root directory with any static file server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

There are no tests, no linter, no formatter configured.

## Architecture

**Single-page app** with card grid + sliding detail panel. Hash-based routing (`#document-id`).

### Entry Flow
`index.html` → `js/app.js` (controller) → discovers content via `js/services/content.js` → renders cards → on card click, loads markdown, parses with `js/utils/markdown.js`, displays in `<scroll-sync>` panel.

### Key Modules

| Module | Role |
|--------|------|
| `js/app.js` | App controller: state, routing, preferences, filter wiring. All card rendering goes through `renderFilteredCards()` → `applyFilters()` pipeline |
| `js/services/content.js` | Scans `/content/` folders for `.md` files, parses frontmatter, caches loaded docs |
| `js/services/filters.js` | Pure functions: `extractCategories()`, `parseSearchInput()`, `applyFilters()`. No DOM access |
| `js/utils/markdown.js` | Custom markdown→HTML parser with frontmatter extraction, media blocks, chart/flow code blocks, `::prototype{...}` directive |
| `js/components/scroll-sync.js` | Lit component — split-view reading with synchronized scroll between article content and paired media sidebar |
| `js/components/proto-sandbox.js` | Lit component — embeds HTML prototypes in theme-aware iframes |
| `js/utils/charts.js` | SVG chart renderer (bar, line, area, pie, donut, scatter, stacked). Data comes from CSV-like code blocks in markdown |
| `js/utils/graphs.js` | SVG flow diagram renderer using Dagre layout. Node/edge definitions from code blocks in markdown |
| `js/utils/icons.js` | Tabler Icons SVG path registry — used by flow diagrams and header UI (sort, search) via `getIconSvg()` |

### Content System

Content lives in `/content/` as markdown files with YAML-like frontmatter:
- `content/about.md` → special "home" document
- `content/projects/`, `content/experiments/`, `content/research/` → auto-discovered by folder scanning
- `content/prototypes/` → git-ignored working HTML prototypes embedded via `::prototype{...}` directive

Frontmatter supports nested key-value pairs (e.g. `date:` with indented `published: 2025-01-27`).

### Content Visibility

The `status` frontmatter field controls what appears on the site:
- `status: published` or no status → visible by default
- `status: draft` → hidden, accessible via `show:drafts` in search
- `status: archive` → hidden, accessible via `show:archive` in search
- Any hidden doc accessible via `reveal:doc-name` (short name or full id)

All docs are loaded into memory; visibility is enforced at the render pipeline level (`applyFilters()`).

### Filtering, Sorting & Search

Header has three zones: branding | filters | preferences. Filter controls:
- **Category pills** — auto-extracted from content folders via `extractCategories()`. Click toggles, click again deselects.
- **Sort** — cycles `default` → `date` → `alpha`. Default preserves category grouping; others render flat.
- **Search** — expanding input, 150ms debounce. `/` key opens, `Escape` closes.
- **Hidden commands** — `show:drafts`, `show:archive`, `reveal:name` replace the view (not augment).

Cards animate with staggered fade+slide (100ms cascade per card) on every re-render.

### Theming & CSS Variables

All styling in `css/main.css`. Two themes: light (default) and dark (`data-theme="dark"` on `<html>`).

Key variable namespaces:
- `--color-*` — base UI colors (bg, text, muted, border, surface)
- `--chart-*` — chart/flow diagram colors (p1–p6 palette, bg, fg, dim, node-fill, edge-stroke)
- `--font-sans`, `--font-mono` — typography stacks
- `--panel-width`, `--header-height` — layout dimensions

Charts and flow diagrams read CSS variables directly for live theme switching.

### Handedness Support

`data-handed="left"` on `<html>` flips the entire layout (panel side, media position, control order) via CSS `flex-direction: row-reverse`. Stored in localStorage.

## Conventions

- Web components use Lit (LitElement) with ES module imports from `esm.sh` CDN
- Markdown parser is custom — extend `js/utils/markdown.js` for new block types
- Media elements use `<figure data-media>` with hydration hooks for post-parse enhancement (charts, diagrams)
- User preferences persist to localStorage with keys: `theme`, `fontSize`, `handed`
- Dark theme applies `brightness(0.8) grayscale(1)` filter to images, restored on hover
- New UI icons must be added to `js/utils/icons.js` registry (Tabler Icons, 24x24 stroke-based) and injected via `getIconSvg()` — not inlined in HTML
- Filter controls in header do not reverse with handedness — only branding/preferences swap sides
