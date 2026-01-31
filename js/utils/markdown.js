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
    // Code blocks -> figure[data-media data-type="code"]
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const langAttr = lang ? ` data-lang="${lang}"` : '';
      return `<figure data-media data-type="code"${langAttr}>
        <pre><code>${escapeHtml(code.trim())}</code></pre>
      </figure>`;
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
    // Inline formatting
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/==([^=]+)==/g, '<mark>$1</mark>')
    .replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`)
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

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
