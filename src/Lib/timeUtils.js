/**
 * Frontend Time Utilities for "Literal" Local Time.
 */

/**
 * Formats a date for display without browser timezone conversion.
 * Treats the stored date as literal local time.
 */
export const formatLiteralTime = (dateInput) => {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "—";

  const pad = (n) => String(n).padStart(2, "0");

  // Use UTC methods to get the "literal" numbers stored in DB (since we store them as XXXX-XX-XXTXX:XX:XX.000Z)
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;

  return `${pad(hours12)}:${minutes} ${ampm}`;
};

export const formatLiteralDate = (dateInput) => {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "—";

  const pad = (n) => String(n).padStart(2, "0");

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());

  return `${day}/${month}/${year}`;
};

export const formatLiteralDateTime = (dateInput) => {
  if (!dateInput) return "—";
  return `${formatLiteralDate(dateInput)} ${formatLiteralTime(dateInput)}`;
};

/**
 * For <input type="datetime-local">, requires YYYY-MM-DDTHH:mm
 */
export const toLocalInputString = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const mm = pad(date.getUTCMinutes());

  return `${y}-${m}-${d}T${hh}:${mm}`;
};
