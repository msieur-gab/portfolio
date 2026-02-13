/**
 * Relative date formatting
 * Uses Intl.RelativeTimeFormat for humanized dates.
 * Recent dates show "2 days ago", older dates fall back to "Jan 2024".
 */

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function relativeDate(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.round((then - now) / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHrs = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHrs / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30.44);

  if (Math.abs(diffDays) < 1) return 'today';
  if (Math.abs(diffDays) < 7) return rtf.format(diffDays, 'day');
  if (Math.abs(diffDays) < 30) return rtf.format(diffWeeks, 'week');
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month');

  // 1+ years — use years
  const diffYears = Math.round(diffDays / 365.25);
  return rtf.format(diffYears, 'year');
}
