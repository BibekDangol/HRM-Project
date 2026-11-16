import { colors } from "@/theme/colors";
import { WeekendRules } from "../types/Calendar";

export const COLOR_PRESETS = [
  colors.danger,
  colors.orange,
  colors.accent,
  colors.success,
  colors.cyan,
  colors.primary,
  colors.purple,
  colors.pink,
  colors.muted,
  colors.shadow,
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
