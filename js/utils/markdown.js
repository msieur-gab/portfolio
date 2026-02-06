/**
 * Minimal markdown parser for portfolio content
 * Handles: frontmatter, headers, images, code blocks, blockquotes, lists, inline formatting
 */

/**
 * Parse YAML-like frontmatter from markdown
 * @param {string} md - Raw markdown string
 * @returns {{ frontmatter: Object, content: string }}
 */
export function parseFrontmatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {
    return { frontmatter: {}, content: md };
  }

  const frontmatter = {};
  let currentKey = null;
  let inArray = false;

  match[1].split('\n').forEach(line => {
    // Array item
    if (line.match(/^\s+-\s+(.+)$/)) {
      const value = line.match(/^\s+-\s+(.+)$/)[1].replace(/^["']|["']$/g, '');
      if (currentKey && Array.isArray(frontmatter[currentKey])) {
        frontmatter[currentKey].push(value);
      }
      return;
    }

    // Key-value pair
    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].replace(/^["']|["']$/g, '');

      if (value === '') {
        // Could be start of array or nested object - check next lines
        frontmatter[currentKey] = [];
        inArray = true;
      } else {
        frontmatter[currentKey] = value;
        inArray = false;
      }
    }
  });

  return {
    frontmatter,
    content: md.slice(match[0].length).trim()
  };
}

/**
 * Convert markdown to HTML
 * @param {string} md - Markdown content (without frontmatter)
 * @param {Object} options
 * @param {string} options.baseUrl - Base URL for relative media paths
 * @returns {string} HTML string
 */
export function markdownToHtml(md, options = {}) {
  const { baseUrl = '' } = options;

  const resolveUrl = (src) => {
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    if (src.startsWith('/')) return src;
    // Handle relative paths including ../
    const baseParts = baseUrl.split('/').filter(Boolean);
    const srcParts = src.split('/');
    for (const part of srcParts) {
      if (part === '..') baseParts.pop();
      else if (part !== '.') baseParts.push(part);
    }
    return baseParts.join('/');
  };

  let html = md
    // Prototype directive: ::prototype{src="..." height="..." caption="..."}
    .replace(/::prototype\{([^}]+)\}/g, (_, attrs) => {
      const props = parseDirectiveAttrs(attrs);
      const src = props.src ? resolveUrl(props.src) : '';
      const height = props.height || '300';
      const caption = props.caption || '';
      return `<figure data-media data-type="prototype">
        <proto-sandbox src="${src}" height="${height}"></proto-sandbox>
        ${caption ? `<figcaption>${caption}</figcaption>` : ''}
      </figure>`;
    })
    // Images with title (for data-fit attribute)
    // ![alt](src "title") -> <figure data-media data-fit="title">
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\s+"([^"]+)"\)/g, (_, alt, src, title) => {
      return `<figure data-media data-fit="${title}">
        <img src="${resolveUrl(src)}" alt="${alt}">
        ${alt ? `<figcaption>${alt}</figcaption>` : ''}
      </figure>`;
    })
    // Regular images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
      return `<figure data-media>
        <img src="${resolveUrl(src)}" alt="${alt}">
        ${alt ? `<figcaption>${alt}</figcaption>` : ''}
      </figure>`;
    })
    // Code blocks: charts, flows, and regular code
    .replace(/```([\w-]*)(?:[ \t]+([^\n]*))?\n([\s\S]*?)```/g, (_, lang, options, code) => {
      const opts = options?.trim() || '';
      const content = code.trim();

      // Chart blocks: chart-bar, chart-line, chart-pie, etc.
      // Output as code block with language class for hydration
      // Normalize content to remove blank lines that would cause paragraph splitting
      if (lang.startsWith('chart-')) {
        const normalized = content.replace(/\n\s*\n/g, '\n');
        return `<figure data-media data-type="chart"><pre><code class="language-${lang}">${escapeHtml(normalized)}</code></pre></figure>`;
      }

      // Flow diagram blocks - output as code block for hydration
      if (lang === 'flow') {
        const normalized = content.replace(/\n\s*\n/g, '\n');
        const dirAttr = opts ? ` data-dir="${escapeHtml(opts)}"` : '';
        return `<figure data-media data-type="flow"><pre><code class="language-flow"${dirAttr}>${escapeHtml(normalized)}</code></pre></figure>`;
      }

      // Regular code blocks - keep on single line to prevent paragraph splitting
      const langAttr = lang ? ` data-lang="${lang}"` : '';
      return `<figure data-media data-type="code"${langAttr}><pre><code>${escapeHtml(content)}</code></pre></figure>`;
    })
    // Blockquotes -> figure[data-media data-type="quote"]
    .replace(/(?:^> .+$\n?)+/gm, (match) => {
      const content = match
        .split('\n')
        .map(line => line.replace(/^> ?/, ''))
        .filter(line => line.trim())
        .join('<br>');
      return `<figure data-media data-type="quote">
        <blockquote>${content}</blockquote>
      </figure>`;
    })
    // Headers (must come after blockquotes)
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Lists (must come before inline formatting — * conflicts with emphasis)
    .replace(/(^\* .+$\n?)+/gm, (match) => {
      const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\* /, '')}</li>`).join('\n');
      return `<ul>${items}</ul>`;
    })
    .replace(/(^\d+\. .+$\n?)+/gm, (match) => {
      const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('\n');
      return `<ol>${items}</ol>`;
    })
    // Inline formatting
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/==([^=]+)==/g, '<mark>$1</mark>')
    .replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`)
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Wrap remaining plain text in paragraphs
  html = html
    .split('\n\n')
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<')) return block;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}

/**
 * Parse markdown with frontmatter
 * @param {string} md - Raw markdown
 * @param {Object} options
 * @returns {{ html: string, frontmatter: Object }}
 */
export function parseMarkdown(md, options = {}) {
  const { frontmatter, content } = parseFrontmatter(md);
  const html = markdownToHtml(content, options);
  return { html, frontmatter };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Parse directive attributes: key="value" key2="value2"
 * @param {string} str - Attribute string
 * @returns {Object} Parsed key-value pairs
 */
function parseDirectiveAttrs(str) {
  const attrs = {};
  const regex = /(\w+)=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

/**
 * Convert figure to code block fallback
 * Used when chart/graph plugins are unavailable
 */
function fallbackToCodeBlock(figure, content, lang) {
  figure.dataset.type = 'code';
  figure.dataset.lang = lang;
  figure.innerHTML = `<pre><code>${escapeHtml(content)}</code></pre>`;
  figure.dataset.hydrated = 'true';
}

/**
 * Hydrate chart and flow figures with rendered SVG
 * Falls back to code block display if plugins unavailable
 * @param {Element} container - Container element to search within
 */
export async function hydrateMedia(container) {
  // Hydrate charts using the new hydrate() function
  const chartFigures = container.querySelectorAll('figure[data-type="chart"]');
  if (chartFigures.length > 0) {
    try {
      const { hydrate } = await import('./charts.js');
      // Hydrate charts within this container
      hydrate(container);
      // Mark figures as hydrated
      chartFigures.forEach(fig => fig.dataset.hydrated = 'true');
    } catch (e) {
      console.warn('Chart plugin unavailable:', e.message);
      chartFigures.forEach(fig => {
        const code = fig.querySelector('code');
        if (code) {
          const lang = code.className.match(/language-([\w-]+)/)?.[1] || 'chart';
          fallbackToCodeBlock(fig, code.textContent, lang);
        }
      });
    }
  }

  // Hydrate flow diagrams using the new hydrate() function
  const flowFigures = container.querySelectorAll('figure[data-type="flow"]');
  if (flowFigures.length > 0) {
    try {
      const { hydrate: hydrateFlows } = await import('./graphs.js');
      await hydrateFlows(container);
      flowFigures.forEach(fig => fig.dataset.hydrated = 'true');
    } catch (e) {
      console.warn('Graph plugin unavailable:', e.message);
      flowFigures.forEach(fig => {
        const code = fig.querySelector('code');
        if (code) {
          fallbackToCodeBlock(fig, code.textContent, 'flow');
        }
      });
    }
  }
}
