/**
 * Time Utilities for handling "Literal" Local Time.
 * These ensure that a time like "13:00" stays "13:00" regardless of timezone.
 */

/**
 * Parses a date string and returns a Date object.
 * To implement the "Literal Time" strategy, we treat the local time
 * from the frontend (e.g. 13:00) as if it were UTC (13:00 Z).
 * This prevents the server (which might be in UTC) from shifting it.
 * @param {string} dateStr - The date-time string from the frontend.
 * @returns {Date}
 */
function parseAsLocal(dateStr) {
  if (!dateStr) return null;

  let normalizedStr = dateStr;
  // If it doesn't have a timezone indicator
  if (!dateStr.includes("Z") && !/[+-]\d{2}:\d{2}$/.test(dateStr)) {
    if (dateStr.includes("T")) {
      // If it contains T but no Z, check if it has seconds
      const parts = dateStr.split("T")[1].split(":");
      if (parts.length === 2) {
        // HH:mm -> add :00.000Z
        normalizedStr = `${dateStr}:00.000Z`;
      } else if (parts.length === 3) {
        // HH:mm:ss -> add .000Z
        normalizedStr = `${dateStr}.000Z`;
      } else {
        // Just HH -> add :00:00.000Z
        normalizedStr = `${dateStr}:00:00.000Z`;
      }
    } else {
      // YYYY-MM-DD -> add T00:00:00.000Z
      normalizedStr = `${dateStr}T00:00:00.000Z`;
    }
  }

  const date = new Date(normalizedStr);
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Formats a Date object to a string for display that ignores the browser/server timezone.
 * Useful for logging and sending back to frontend.
 * @param {Date} date
 * @returns {string}
 */
function formatLocal(date) {
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

module.exports = {
  parseAsLocal,
  formatLocal,
};
