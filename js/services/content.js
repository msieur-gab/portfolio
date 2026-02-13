/**
 * Content discovery and loading service
 * Scans content folders and manages document loading
 */

import { parseMarkdown } from '../utils/markdown.js';

// Content configuration
const CONTENT_BASE = './content';
const FOLDERS = ['projects', 'explorations', 'notes'];
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
 * Load file list from static manifest
 * @returns {Promise<string[]>} - List of file paths, or empty if unavailable
 */
async function loadManifest() {
  try {
    const res = await fetch(`${CONTENT_BASE}/manifest.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch {
    return [];
  }
}

/**
 * Scan a folder for markdown files via directory listing (local dev fallback)
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
 * Get all content file paths — manifest first, directory scanning fallback
 * @returns {Promise<string[]>}
 */
async function discoverFiles() {
  const manifest = await loadManifest();
  if (manifest.length > 0) return manifest;

  // Fallback: scan directories (works on local dev servers)
  const allFiles = [];
  const rootFiles = await scanFolder(null);
  allFiles.push(...rootFiles);

  for (const folder of FOLDERS) {
    const files = await scanFolder(folder);
    allFiles.push(...files);
  }

  return allFiles;
}

/**
 * Discover all documents in the content folder
 * @returns {Promise<{ docs: Doc[], introDoc: Doc|null }>}
 */
export async function discoverContent() {
  let introDoc = null;
  const allFiles = await discoverFiles();

  // Find intro file
  for (const introName of INTRO_FILES) {
    const introPath = `content/${introName}`;
    if (allFiles.includes(introPath)) {
      introDoc = await probeFile(introPath);
      if (introDoc) {
        introDoc.id = 'home';
        introDoc.category = null;
        break;
      }
    }
  }

  // Probe all non-intro files
  const contentFiles = allFiles.filter(f => !INTRO_FILES.some(intro => f.endsWith(intro)));
  const results = await Promise.all(contentFiles.map(probeFile));
  const docs = results.filter(Boolean).sort((a, b) => a.label.localeCompare(b.label));

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

/**
 * Convert a doc ID to a clean URL path
 * e.g. "projects-cypher" → "/projects/cypher", "home" → "/"
 */
export function idToPath(id) {
  if (!id || id === 'home') return '/';
  // The ID format is "folder-slug" where folder is one of FOLDERS
  // Replace only the first dash that separates the folder from the slug
  for (const folder of FOLDERS) {
    if (id.startsWith(folder + '-')) {
      return '/' + folder + '/' + id.slice(folder.length + 1);
    }
  }
  // Root-level doc (no folder prefix)
  return '/' + id;
}

/**
 * Convert a URL path back to a doc ID
 * e.g. "/projects/cypher" → "projects-cypher", "/" → null
 */
export function pathToDocId(urlPath) {
  const clean = urlPath.replace(/^\/|\/$/g, '');
  if (!clean) return null;
  // "projects/cypher" → "projects-cypher"
  return clean.replace(/\//g, '-');
}

export { FOLDERS };
