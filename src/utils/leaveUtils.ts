import { LeaveDetailsRow, LeaveRow } from "../types/userLeave";

// Utility function to parse ISO date string (YYYY-MM-DD) to UTC Date
function parseISODateOnly(dateStr: string): Date | null {
  const [y, m, d] = dateStr.split("-").map((n) => Number(n));
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

// Calculate inclusive days between two ISO date strings
export function diffDaysInclusive(startISO: string, endISO: string): number | null {
  const start = parseISODateOnly(startISO);
  const end = parseISODateOnly(endISO);
  if (!start || !end) return null;

  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.round((end.getTime() - start.getTime()) / msPerDay);
  return diff + 1;
}

// Get leave days from a leave record (handles both days_count and calculated)
export function getLeaveDays(leave: LeaveDetailsRow): number {
  if (typeof leave.days_count === "number") return leave.days_count;
  return diffDaysInclusive(leave.start_date, leave.end_date) ?? 0;
}

// Calculate leave days (generic version for any leave-like object)
export function calcLeaveDays(leave: LeaveRow): number {
  if (typeof leave.days_count === "number") return leave.days_count;
  return diffDaysInclusive(leave.start_date, leave.end_date) ?? 0;
}

// Format days count (shows decimals for half days)
export function formatDays(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

// Extract first parameter from route params (handles string | string[])
export function firstParam(v?: string | string[]): string {
  if (!v) return "";
  return Array.isArray(v) ? String(v[0] ?? "") : String(v);
}