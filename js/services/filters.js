/**
 * Filter, sort, and search functions for portfolio content
 * Pure functions — no DOM access
 */

/**
 * Extract unique category strings from docs array
 * @param {Array} docs
 * @returns {string[]} Sorted category names
 */
export function extractCategories(docs) {
  const cats = new Set();
  for (const doc of docs) {
    if (doc.category) cats.add(doc.category);
  }
  return [...cats].sort();
}

/**
 * Parse search input for commands and plain text queries
 * Commands: show:drafts, show:archive, reveal:id
 * @param {string} raw
 * @returns {{ query: string, showDrafts: boolean, showArchive: boolean, revealId: string|null }}
 */
export function parseSearchInput(raw) {
  const trimmed = (raw || '').trim();
  const result = { query: '', showDrafts: false, showArchive: false, revealId: null };

  if (!trimmed) return result;

  // show:drafts
  if (/^show:drafts$/i.test(trimmed)) {
    result.showDrafts = true;
    return result;
  }

  // show:archive
  if (/^show:archive$/i.test(trimmed)) {
    result.showArchive = true;
    return result;
  }

  // reveal:some-id
  const revealMatch = trimmed.match(/^reveal:(.+)$/i);
  if (revealMatch) {
    result.revealId = revealMatch[1].trim();
    return result;
  }

  result.query = trimmed;
  return result;
}

/**
 * Apply filters, search, and sort to docs array
 * @param {Array} docs - All documents
 * @param {Object} opts
 * @param {string|null} opts.category - Filter by category (null = all)
 * @param {string} opts.search - Raw search string (may contain commands)
 * @param {string} opts.sort - 'default' | 'date' | 'alpha'
 * @returns {Array} Filtered and sorted docs (new array, never mutates input)
 */
export function applyFilters(docs, { category = null, search = '', sort = 'default' } = {}) {
  const { query, showDrafts, showArchive, revealId } = parseSearchInput(search);

  let result = docs.slice();

  // 1. Visibility — published by default, unlock hidden via commands
  result = result.filter(doc => {
    const status = doc.frontmatter.status;

    // Reveal a specific hidden doc by id
    if (revealId && doc.id === revealId) return true;

    // Show drafts command
    if (showDrafts && status === 'draft') return true;

    // Show archive command
    if (showArchive && status === 'archive') return true;

    // Default: show published and docs with no status
    return !status || status === 'published';
  });

  // 2. Category filter
  if (category) {
    result = result.filter(doc => doc.category === category);
  }

  // 3. Text search
  if (query) {
    const lower = query.toLowerCase();
    result = result.filter(doc => {
      const label = (doc.label || '').toLowerCase();
      const desc = (doc.frontmatter.description || '').toLowerCase();
      const tags = (doc.frontmatter.tags || []).join(' ').toLowerCase();
      return label.includes(lower) || desc.includes(lower) || tags.includes(lower);
    });
  }

  // 4. Sort
  if (sort === 'date') {
    result.sort((a, b) => {
      const dateA = a.frontmatter.date?.published || '';
      const dateB = b.frontmatter.date?.published || '';
      return dateB.localeCompare(dateA); // newest first
    });
  } else if (sort === 'alpha') {
    result.sort((a, b) => a.label.localeCompare(b.label));
  }
  // 'default' — no re-sort, preserves input order (category grouping)

  return result;
}
