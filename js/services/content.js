/**
 * Content discovery and loading service
 * Scans content folders and manages document loading
 */

import { parseMarkdown } from '../utils/markdown.js';

// Content configuration
const CONTENT_BASE = './content';
const FOLDERS = ['projects', 'experiments', 'research'];
const INTRO_FILES = ['about.md', 'index.md', 'intro.md'];

/**
 * @typedef {Object} Doc
 * @property {string} id - URL-safe identifier
 * @property {string} file - Path to the markdown file
 * @property {string} label - Display title
 * @property {string|null} category - Folder/category name
 * @property {Object} frontmatter - Parsed frontmatter
 * @property {string} [content] - Raw markdown (cached after load)
 * @property {string} [html] - Parsed HTML (cached after load)
 */

/**
 * Extract title from markdown content
 * @param {string} md - Markdown content
 * @returns {string|null}
 */
function extractTitle(md) {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1] : null;
}

/**
 * Generate URL-safe ID from file path
 * @param {string} filepath - File path relative to content/
 * @returns {string}
 */
function pathToId(filepath) {
  return filepath
    .replace('content/', '')
    .replace('.md', '')
    .replace(/\//g, '-');
}

/**
 * Probe a file to check if it's valid markdown with content
 * @param {string} filepath - Path to the markdown file
 * @returns {Promise<Doc|null>}
 */
async function probeFile(filepath) {
  try {
    const res = await fetch(filepath);
    if (!res.ok) return null;

    const md = await res.text();
    if (!md.includes('#')) return null;

    const { frontmatter } = parseMarkdown(md);
    const parts = filepath.replace('content/', '').split('/');
    const category = parts.length > 1 ? parts[0] : null;
    const filename = parts[parts.length - 1];

    return {
      id: pathToId(filepath),
      file: filepath,
      label: frontmatter.title || extractTitle(md) || filename.replace('.md', ''),
      category,
      frontmatter,
      content: md
    };
  } catch {
    return null;
  }
}

/**
 * Scan a folder for markdown files via directory listing
 * @param {string|null} folder - Folder name or null for root
 * @returns {Promise<string[]>} - List of file paths
 */
async function scanFolder(folder) {
  const path = folder ? `${CONTENT_BASE}/${folder}/` : `${CONTENT_BASE}/`;

  try {
    const res = await fetch(path);
    const html = await res.text();
    const matches = html.matchAll(/href="([^"]+\.md)"/gi);

    return Array.from(matches, m => {
      const filename = m[1];
      return folder ? `content/${folder}/${filename}` : `content/${filename}`;
    });
  } catch {
    return [];
  }
}

/**
 * Discover all documents in the content folder
 * @returns {Promise<{ docs: Doc[], introDoc: Doc|null }>}
 */
export async function discoverContent() {
  let introDoc = null;

  // Scan root for intro file
  const rootFiles = await scanFolder(null);

  for (const introName of INTRO_FILES) {
    const introPath = `content/${introName}`;
    if (rootFiles.includes(introPath)) {
      introDoc = await probeFile(introPath);
      if (introDoc) {
        introDoc.id = 'home';
        introDoc.category = null;
        break;
      }
    }
  }

  // Scan category folders
  const allDocs = [];

  for (const folder of FOLDERS) {
    const files = await scanFolder(folder);
    const results = await Promise.all(files.map(probeFile));
    allDocs.push(...results.filter(Boolean));
  }

  // Include root .md files that aren't intro
  const rootDocs = await Promise.all(
    rootFiles
      .filter(f => !INTRO_FILES.some(intro => f.endsWith(intro)))
      .map(probeFile)
  );
  allDocs.push(...rootDocs.filter(Boolean));

  // Sort by title
  const docs = allDocs.sort((a, b) => a.label.localeCompare(b.label));

  return { docs, introDoc };
}

/**
 * Load and parse a document's content
 * @param {Doc} doc - Document to load
 * @returns {Promise<{ html: string, frontmatter: Object }>}
 */
export async function loadDocument(doc) {
  // Use cached content if available
  const md = doc.content || await fetch(doc.file).then(r => r.text());

  // Determine base URL for media
  const pathParts = doc.file.split('/');
  pathParts.pop(); // Remove filename
  const baseUrl = pathParts.join('/');

  return parseMarkdown(md, { baseUrl });
}

/**
 * Get grouped documents by category
 * @param {Doc[]} docs - List of documents
 * @returns {Object<string, Doc[]>}
 */
export function groupByCategory(docs) {
  const grouped = {};

  for (const doc of docs) {
    const cat = doc.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(doc);
  }

  return grouped;
}

export { FOLDERS };
