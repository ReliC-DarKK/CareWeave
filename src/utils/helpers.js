/**
 * CareWeave — Frontend Utility Helpers
 */

/**
 * Formats a standard ISO date string to readable clinical presentation.
 * @param {string} dateStr 
 * @returns {string}
 */
export function formatClinicalDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
