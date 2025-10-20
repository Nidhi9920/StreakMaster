// src/utils/dateUtils.js
export function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  
  export function isoYesterday(isoDate) {
    const d = new Date(isoDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  
  export function isConsecutive(prevISO, currentISO) {
    if (!prevISO) return false;
    return isoYesterday(currentISO) === prevISO;
  }
  