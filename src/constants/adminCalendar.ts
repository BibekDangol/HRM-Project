import { WeekendRules } from "../types/adminCalendar";

export const COLOR_PRESETS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#06B6D4",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#64748B",
  "#000000",
];

export const TODAY = new Date().toISOString().slice(0, 10);

// --- helpers (fix YYYY-MM-DD -> local date; avoids timezone day shift) ---
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export function parseLocalYMD(dateStr: string): Date {
  const m = DATE_RE.exec(dateStr);
  if (!m) return new Date(dateStr);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

// All 7 days in order, matching Date.getDay() and WeekendRules keys
export const DAY_OPTIONS: {
  key: keyof WeekendRules;
  short: string;
  full: string;
}[] = [
  { key: "sundayOff", short: "Su", full: "Sunday" },
  { key: "mondayOff", short: "Mo", full: "Monday" },
  { key: "tuesdayOff", short: "Tu", full: "Tuesday" },
  { key: "wednesdayOff", short: "We", full: "Wednesday" },
  { key: "thursdayOff", short: "Th", full: "Thursday" },
  { key: "fridayOff", short: "Fr", full: "Friday" },
  { key: "saturdayOff", short: "Sa", full: "Saturday" },
];
