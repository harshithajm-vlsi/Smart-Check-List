/**
 * Utility functions for time and date formatting across Smart Alarm
 */

/**
 * Formats a 24-hour time string ("14:30", "09:05", "00:15") into 12-hour AM/PM format ("02:30 PM").
 * Handles already formatted strings or null/undefined gracefully.
 */
export function formatTime12(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return '';
  const trimmed = timeStr.trim();
  if (!trimmed) return '';

  // If already contains AM or PM (case-insensitive), return as is
  if (/am|pm/i.test(trimmed)) return trimmed;

  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].slice(0, 2);
    if (isNaN(hours) || isNaN(parseInt(minutes, 10))) return trimmed;

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    const hhStr = String(hours).padStart(2, '0');
    return `${hhStr}:${minutes} ${ampm}`;
  }

  return trimmed;
}

/**
 * Formats a YYYY-MM-DD date string into a clean readable date ("14 Aug 2026").
 */
export function formatDateReadable(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Formats task due date and due time together or individually with AM/PM.
 */
export function formatDueDateTime(dueDate, dueTime) {
  const dateFormatted = dueDate ? formatDateReadable(dueDate) : '';
  const timeFormatted = dueTime ? formatTime12(dueTime) : '';

  if (dateFormatted && timeFormatted) {
    return `📅 Due: ${dateFormatted} at ${timeFormatted}`;
  } else if (dateFormatted) {
    return `📅 Due Date: ${dateFormatted}`;
  } else if (timeFormatted) {
    return `⏰ Due Time: ${timeFormatted}`;
  }
  return '';
}

/**
 * Returns formatted "Month Date" (e.g. "14 Aug").
 */
export function getMonthDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return '—';
  }
}

/**
 * Returns full Day of the week (e.g. "Friday").
 */
export function getDayOfWeek(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { weekday: 'long' });
  } catch {
    return '—';
  }
}

/**
 * Returns full Month name (e.g. "August").
 */
export function getMonthName(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { month: 'long' });
  } catch {
    return '—';
  }
}
