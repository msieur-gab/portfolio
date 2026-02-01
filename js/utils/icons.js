/**
 * Icon registry for flow diagrams and charts
 *
 * Each icon is a 16x16 viewBox SVG path.
 * Usage:
 *   import { getIcon, getIconSvg } from './icons.js';
 *   const path = getIcon('lock');
 *   const svg = getIconSvg('lock', 16);
 */

const ICONS = {
  // People & Roles
  user: 'M8 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 9a5 5 0 0 1 10 0H3z',
  users: 'M6 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM1 14a5 5 0 0 1 10 0H1zm9 0a4 4 0 0 1 5 0h-5z',

  // Security
  lock: 'M4 7V5a4 4 0 0 1 8 0v2h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1zm2 0h4V5a2 2 0 0 0-4 0v2zm2 3a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1z',
  unlock: 'M4 7V5a4 4 0 0 1 7.87-.8h.01l-.01.1V7H13a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1zm2 0h4V5a2 2 0 0 0-4 0v2z',
  key: 'M12.7 1.3a1 1 0 0 1 0 1.4l-1 1L13 5l-1.5 1.5L10.2 5.2l-3.5 3.5A3.5 3.5 0 1 1 5.3 7.3l5-5a1 1 0 0 1 1.4 0zM4.5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  shield: 'M8 1l6 2.5v4c0 3.5-2.5 6.5-6 7.5-3.5-1-6-4-6-7.5v-4L8 1zm0 2.2L4 5v3.5c0 2.5 1.8 4.8 4 5.5 2.2-.7 4-3 4-5.5V5L8 3.2z',

  // Data & Storage
  database: 'M8 1C4.5 1 2 2.1 2 3.5v9C2 13.9 4.5 15 8 15s6-1.1 6-2.5v-9C14 2.1 11.5 1 8 1zM8 3c2.8 0 4 .7 4 1s-1.2 1-4 1-4-.7-4-1 1.2-1 4-1zm4 9.5c0 .3-1.2 1-4 1s-4-.7-4-1v-2a8.5 8.5 0 0 0 4 .8 8.5 8.5 0 0 0 4-.8v2zm0-4c0 .3-1.2 1-4 1s-4-.7-4-1v-2A8.5 8.5 0 0 0 8 7.3a8.5 8.5 0 0 0 4-.8v2z',
  file: 'M4 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5l-4-4H4zm5 0v3a1 1 0 0 0 1 1h3',
  folder: 'M2 3a1 1 0 0 1 1-1h4l2 2h4a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3z',
  disk: 'M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4.4L11.6 2H3zm5 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM4 3h6v2H4V3z',

  // Network & Cloud
  cloud: 'M4.5 13A3.5 3.5 0 0 1 2 8a3.5 3.5 0 0 1 2.1-3.2A5 5 0 0 1 13 6a3 3 0 0 1 1 5.8V13H4.5z',
  server: 'M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm0 5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8zm0 5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1zM11 4h1v1h-1zM11 9h1v1h-1z',
  globe: 'M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2c.7 0 1.5 1.2 1.9 3H6.1C6.5 4.2 7.3 3 8 3zm-3 5h6a9 9 0 0 1-.1 1.5H5.1A9 9 0 0 1 5 8zm0-1.5A9 9 0 0 1 5.1 5h5.8a9 9 0 0 1 .1 1.5H5z',
  radio: 'M8 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3-1a3 3 0 0 1-1.5 2.6l.7 1.2A4.5 4.5 0 0 0 12.5 8a4.5 4.5 0 0 0-2.3-3.8l-.7 1.2A3 3 0 0 1 11 8zM5 8a3 3 0 0 0 1.5 2.6l-.7 1.2A4.5 4.5 0 0 1 3.5 8a4.5 4.5 0 0 1 2.3-3.8l.7 1.2A3 3 0 0 0 5 8z',
  wifi: 'M8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-2.5-3a3.5 3.5 0 0 1 5 0l-1 1a2 2 0 0 0-3 0l-1-1zm-2-2a6 6 0 0 1 9 0l-1 1a4.5 4.5 0 0 0-7 0l-1-1zm-2-2a8.5 8.5 0 0 1 13 0l-1 1a7 7 0 0 0-11 0l-1-1z',

  // Process & Flow
  play: 'M4 2.5v11l9-5.5z',
  pause: 'M4 2h3v12H4zm5 0h3v12H9z',
  stop: 'M3 3h10v10H3z',
  refresh: 'M2 8a6 6 0 0 1 10.3-4.2L14 2v5h-5l1.8-1.8A4 4 0 0 0 4 8a4 4 0 0 0 6.9 2.7l1.5 1A6 6 0 0 1 2 8z',
  cog: 'M7 1l-.5 2.1a5 5 0 0 0-1.7 1L2.8 3 1.5 5.3l1.8 1.2a5 5 0 0 0 0 2l-1.8 1.2L2.8 12l2-1.1a5 5 0 0 0 1.7 1L7 14h2l.5-2.1a5 5 0 0 0 1.7-1l2 1.1 1.3-2.3-1.8-1.2a5 5 0 0 0 0-2l1.8-1.2L13.2 3l-2 1.1a5 5 0 0 0-1.7-1L9 1H7zm1 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',

  // Devices & Hardware
  phone: 'M5 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H5zm1 2h4v9H6V3zm2 10.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z',
  speaker: 'M3 5h2l4-3v12L5 11H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 .5a4 4 0 0 1 0 5l-1-1a2.5 2.5 0 0 0 0-3l1-1z',
  chip: 'M5 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H5zM3 6H1v1h2zm0 3H1v1h2zm10-3h2v1h-2zm0 3h2v1h-2zM6 3V1h1v2zm3 0V1h1v2zM6 15v-2h1v2zm3 0v-2h1v2z',
  nfc: 'M8 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2a7 7 0 1 0 0-14 7 7 0 0 0 0 14z',

  // Arrows & Indicators
  arrowRight: 'M2 8h10m-4-4 4 4-4 4',
  arrowDown: 'M8 2v10m-4-4 4 4 4-4',
  check: 'M3 8l3.5 4L13 4',
  x: 'M4 4l8 8m0-8L4 12',
  info: 'M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-1 4h2v4H7V8z',
  warning: 'M8 1L1 14h14L8 1zm0 4v4m0 2v1',

  // Communication
  mail: 'M2 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4zm1 0l5 4 5-4',
  chat: 'M3 2h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7l-3 3v-3H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z',
  link: 'M6.5 8.5a3 3 0 0 0 4.2.3l2-2a3 3 0 0 0-4.2-4.2L7.3 3.8m2.2 3.7a3 3 0 0 0-4.2-.3l-2 2a3 3 0 0 0 4.2 4.2l1.2-1.2',
};

/**
 * Get icon path data by name
 * @param {string} name - Icon name
 * @returns {string|null} SVG path data or null if not found
 */
export function getIcon(name) {
  return ICONS[name] || null;
}

/**
 * Get full SVG element string for an icon
 * @param {string} name - Icon name
 * @param {number} size - Icon size in pixels (default 16)
 * @param {string} fill - Fill color (default 'currentColor')
 * @returns {string} SVG element string or empty string if not found
 */
export function getIconSvg(name, size = 16, fill = 'currentColor') {
  const path = ICONS[name];
  if (!path) return '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" fill="${fill}"><path d="${path}" fill-rule="evenodd"/></svg>`;
}

/**
 * Check if an icon exists
 * @param {string} name - Icon name
 * @returns {boolean}
 */
export function hasIcon(name) {
  return name in ICONS;
}

/**
 * Get all available icon names
 * @returns {string[]}
 */
export function getIconNames() {
  return Object.keys(ICONS);
}
