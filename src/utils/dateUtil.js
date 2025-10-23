export function todayISO() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // e.g. "2025-10-23"
}

/**
 * Check if two date strings (in "YYYY-MM-DD" format) are consecutive days.
 */
export function isConsecutive(prevISO, currentISO) {
  if (!prevISO) return false;

  const prev = new Date(prevISO);
  const curr = new Date(currentISO);

  // Normalize to midnight UTC
  prev.setUTCHours(0, 0, 0, 0);
  curr.setUTCHours(0, 0, 0, 0);

  const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}
