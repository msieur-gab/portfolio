/**
 * Portfolio application entry point
 */

import './components/scroll-sync.js';
import { discoverContent, loadDocument, groupByCategory, FOLDERS } from './services/content.js';

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

// State
let allDocs = [];
let currentDoc = null;

// Theme and font size
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
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
  if (saved) {
    document.documentElement.dataset.handed = saved;
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

/**
 * Create a card element for a document
 */
function createCard(doc) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = doc.id;

  const category = document.createElement('div');
  category.className = 'card-category';
  category.textContent = doc.category || 'other';

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = doc.label;

  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = doc.frontmatter.description || '';

  card.appendChild(category);
  card.appendChild(title);
  if (doc.frontmatter.description) {
    card.appendChild(description);
  }

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
  for (const folder of [...FOLDERS, 'other']) {
    const items = grouped[folder];
    if (!items?.length) continue;

    for (const doc of items) {
      cardsContainer.appendChild(createCard(doc));
    }
  }
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
  if (e.key === 'Escape' && document.body.classList.contains('panel-open')) {
    closePanel();
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

  buildCards(allDocs);

  // Set up event listeners
  panelClose.addEventListener('click', closePanel);
  document.addEventListener('keydown', handleKeydown);
  themeToggle.addEventListener('click', toggleTheme);
  fontUp.addEventListener('click', () => changeFontSize(2));
  fontDown.addEventListener('click', () => changeFontSize(-2));
  handToggle.addEventListener('click', toggleHandedness);

  // Check for hash in URL and open that doc
  const hash = location.hash.slice(1);
  if (hash) {
    const doc = allDocs.find(d => d.id === hash);
    if (doc) {
      openPanel(doc);
    }
  }
}

init();
