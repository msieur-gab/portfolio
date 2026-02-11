/**
 * Portfolio application entry point
 */

import './components/scroll-sync.js';
import './components/proto-sandbox.js';
import { discoverContent, loadDocument, groupByCategory, FOLDERS } from './services/content.js';
import { extractCategories, applyFilters } from './services/filters.js';
import { hydrateMedia } from './utils/markdown.js';
import { getIconSvg } from './utils/icons.js';

// DOM elements
const cardsContainer = document.getElementById('cards');
const panel = document.getElementById('panel');
const panelClose = document.getElementById('panel-close');
const panelTitle = document.getElementById('panel-title');
const panelCategory = document.getElementById('panel-category');
const scrollSync = document.getElementById('scroll-sync');
const content = document.getElementById('content');
const themeToggle = document.getElementById('theme-toggle');
const fontUp = document.getElementById('font-up');
const fontDown = document.getElementById('font-down');
const handToggle = document.getElementById('hand-toggle');
const filterCategoriesEl = document.getElementById('filter-categories');
const sortToggle = document.getElementById('sort-toggle');
const searchWrapper = document.getElementById('search-wrapper');
const searchToggle = document.getElementById('search-toggle');
const searchInput = document.getElementById('search-input');

// State
let allDocs = [];
let currentDoc = null;
let filterState = { category: null, search: '', sort: 'default' };
let searchDebounceTimer = null;

// Theme and font size
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved !== null) {
    document.documentElement.dataset.theme = saved;
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.dataset.theme = 'dark';
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.dataset.theme === 'dark';
  html.dataset.theme = isDark ? '' : 'dark';
  localStorage.setItem('theme', html.dataset.theme);
}

function changeFontSize(delta) {
  const html = document.documentElement;
  const current = parseFloat(getComputedStyle(html).fontSize);
  const newSize = Math.min(24, Math.max(14, current + delta));
  html.style.fontSize = newSize + 'px';
  localStorage.setItem('fontSize', newSize);
}

function initFontSize() {
  const saved = localStorage.getItem('fontSize');
  if (saved) {
    document.documentElement.style.fontSize = saved + 'px';
  }
}

// Handedness
function initHandedness() {
  const saved = localStorage.getItem('handed');
  if (saved !== null) {
    if (saved) {
      document.documentElement.dataset.handed = saved;
    }
    updateScrollSyncPosition(saved);
  }
}

function toggleHandedness() {
  const html = document.documentElement;
  const isLeft = html.dataset.handed === 'left';
  const newValue = isLeft ? '' : 'left';

  if (newValue) {
    html.dataset.handed = newValue;
  } else {
    delete html.dataset.handed;
  }

  localStorage.setItem('handed', newValue);
  updateScrollSyncPosition(newValue);
}

function updateScrollSyncPosition(handed) {
  // Update scroll-sync media position based on handedness
  // Right-handed (default): media on left
  // Left-handed: media on right
  const position = handed === 'left' ? 'right' : 'left';
  scrollSync.setAttribute('media-position', position);
}

// Initialize preferences
initTheme();
initFontSize();
initHandedness();

// Inject icons from registry
sortToggle.innerHTML = getIconSvg('sort-descending', 18);
searchToggle.innerHTML = getIconSvg('search', 18);

/**
 * Create a card element for a document
 */
function createCard(doc, index) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = doc.id;

  // Series number
  const number = document.createElement('h1');
  number.className = 'series-number';
  number.textContent = String(index).padStart(2, '0');
  card.appendChild(number);

  // Title
  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = doc.label;
  card.appendChild(title);

  // Tags
  const tags = doc.frontmatter.tags;
  if (tags && tags.length) {
    const tagList = document.createElement('ul');
    tagList.className = 'card-tags';
    tagList.setAttribute('aria-label', 'Project tags');
    for (const tag of tags.slice(0, 5)) {
      const li = document.createElement('li');
      li.className = 'card-tag';
      li.textContent = tag;
      tagList.appendChild(li);
    }
    card.appendChild(tagList);
  }

  // Cover image
  const thumbnail = doc.frontmatter.thumbnail;
  if (thumbnail) {
    const img = document.createElement('img');
    img.className = 'card-cover';
    img.src = thumbnail;
    img.alt = doc.label;
    img.loading = 'lazy';
    img.onerror = () => img.remove();
    card.appendChild(img);
  }

  // Description
  if (doc.frontmatter.description) {
    const description = document.createElement('p');
    description.className = 'card-description';
    description.textContent = doc.frontmatter.description;
    card.appendChild(description);
  }

  // Footer
  const footer = document.createElement('footer');
  footer.className = 'card-footer';

  const cat = document.createElement('span');
  cat.className = 'card-category';
  cat.textContent = doc.category || 'other';
  footer.appendChild(cat);

  const pubDate = doc.frontmatter.date?.published;
  if (pubDate) {
    const time = document.createElement('time');
    time.className = 'card-date';
    time.setAttribute('datetime', pubDate);
    time.textContent = new Date(pubDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    footer.appendChild(time);
  }

  card.appendChild(footer);

  card.addEventListener('click', () => openPanel(doc));

  return card;
}

/**
 * Build cards grid from discovered content
 */
function buildCards(docs) {
  cardsContainer.innerHTML = '';

  // Group by category for visual organization
  const grouped = groupByCategory(docs);

  // Render in folder order, then 'other'
  let idx = 1;
  for (const folder of [...FOLDERS, 'other']) {
    const items = grouped[folder];
    if (!items?.length) continue;

    for (const doc of items) {
      cardsContainer.appendChild(createCard(doc, idx++));
    }
  }

  staggerCards();
}

function staggerCards() {
  cardsContainer.querySelectorAll('.card').forEach((card, i) => {
    card.style.setProperty('--i', i);
  });
}

/**
 * Render cards based on current filter state
 */
function renderFilteredCards() {
  const filtered = applyFilters(allDocs, filterState);

  if (filtered.length === 0) {
    cardsContainer.innerHTML = '<p class="no-results">No matching content.</p>';
    return;
  }

  if (filterState.sort === 'default') {
    buildCards(filtered);
  } else {
    // Flat render — already sorted by applyFilters
    cardsContainer.innerHTML = '';
    filtered.forEach((doc, i) => {
      cardsContainer.appendChild(createCard(doc, i + 1));
    });
    staggerCards();
  }
}

/**
 * Build category pill buttons in the header
 */
function initFilterCategories() {
  const categories = extractCategories(allDocs);
  filterCategoriesEl.innerHTML = '';

  // "All" button
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn active';
  allBtn.textContent = 'all';
  allBtn.addEventListener('click', () => {
    filterState.category = null;
    updateCategoryActive(null);
    renderFilteredCards();
  });
  filterCategoriesEl.appendChild(allBtn);

  for (const cat of categories) {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = cat;
    btn.dataset.category = cat;
    btn.addEventListener('click', () => {
      if (filterState.category === cat) {
        // Deselect — back to all
        filterState.category = null;
        updateCategoryActive(null);
      } else {
        filterState.category = cat;
        updateCategoryActive(cat);
      }
      renderFilteredCards();
    });
    filterCategoriesEl.appendChild(btn);
  }
}

function updateCategoryActive(active) {
  filterCategoriesEl.querySelectorAll('.filter-btn').forEach(btn => {
    if (active === null) {
      btn.classList.toggle('active', !btn.dataset.category);
    } else {
      btn.classList.toggle('active', btn.dataset.category === active);
    }
  });
}

const SORT_CYCLE = ['default', 'date', 'alpha'];

function cycleSortOrder() {
  const idx = SORT_CYCLE.indexOf(filterState.sort);
  filterState.sort = SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
  sortToggle.dataset.sort = filterState.sort;
  renderFilteredCards();
}

function toggleSearch() {
  const active = searchWrapper.classList.toggle('search-active');
  if (active) {
    searchInput.focus();
  } else {
    searchInput.value = '';
    filterState.search = '';
    renderFilteredCards();
  }
}

function onSearchInput() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    filterState.search = searchInput.value;
    renderFilteredCards();
  }, 150);
}

/**
 * Open panel with document content
 */
async function openPanel(doc) {
  // Update active card state
  cardsContainer.querySelectorAll('.card').forEach(card => {
    card.classList.toggle('active', card.dataset.id === doc.id);
  });

  currentDoc = doc;

  // Update panel header
  panelTitle.textContent = doc.label;
  panelCategory.textContent = doc.category || '';

  // Update URL hash
  history.replaceState(null, '', `#${doc.id}`);

  // Open panel
  document.body.classList.add('panel-open');

  // Load and render content
  const { html } = await loadDocument(doc);
  content.innerHTML = html;

  // Hydrate charts and flow diagrams
  await hydrateMedia(content);

  // Recompute scroll-sync after DOM update
  requestAnimationFrame(() => {
    scrollSync.recompute();
    // Scroll panel content to top
    panel.querySelector('scroll-sync').scrollTo(0, 0);
  });
}

/**
 * Close panel
 */
function closePanel() {
  document.body.classList.remove('panel-open');
  currentDoc = null;

  // Clear active card state
  cardsContainer.querySelectorAll('.card').forEach(card => {
    card.classList.remove('active');
  });

  // Update URL
  history.replaceState(null, '', window.location.pathname);
}

/**
 * Handle keyboard events
 */
function handleKeydown(e) {
  // Escape: close search first, then panel
  if (e.key === 'Escape') {
    if (searchWrapper.classList.contains('search-active')) {
      toggleSearch();
      return;
    }
    if (document.body.classList.contains('panel-open')) {
      closePanel();
    }
    return;
  }

  // `/` opens search (unless already typing in an input)
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    if (!searchWrapper.classList.contains('search-active')) {
      toggleSearch();
    } else {
      searchInput.focus();
    }
  }
}

/**
 * Initialize the application
 */
async function init() {
  cardsContainer.innerHTML = '<p class="loading">Discovering content...</p>';

  const { docs, introDoc } = await discoverContent();

  // Combine intro doc with other docs
  allDocs = introDoc ? [introDoc, ...docs] : docs;

  if (allDocs.length === 0) {
    cardsContainer.innerHTML = '<p class="error">No content found. Add .md files to content/ folders.</p>';
    return;
  }

  initFilterCategories();
  renderFilteredCards();

  // Set up event listeners
  panelClose.addEventListener('click', closePanel);
  document.addEventListener('keydown', handleKeydown);
  themeToggle.addEventListener('click', toggleTheme);
  fontUp.addEventListener('click', () => changeFontSize(2));
  fontDown.addEventListener('click', () => changeFontSize(-2));
  handToggle.addEventListener('click', toggleHandedness);
  sortToggle.addEventListener('click', cycleSortOrder);
  searchToggle.addEventListener('click', toggleSearch);
  searchInput.addEventListener('input', onSearchInput);

  // Check for hash or ?doc= param in URL and open that doc
  const docParam = new URLSearchParams(location.search).get('doc');
  const hash = docParam || location.hash.slice(1);
  if (hash) {
    const doc = allDocs.find(d => d.id === hash || d.id.endsWith('-' + hash));
    if (doc) {
      if (docParam) history.replaceState(null, '', location.pathname + '#' + doc.id);
      openPanel(doc);
    }
  }
}

init();
