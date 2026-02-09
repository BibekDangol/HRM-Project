import { AttendanceRow } from "../types/attendance";

const NEPAL_OFFSET_MIN = 5 * 60 + 45; // UTC+05:45

export function minutesOfDayNepal(now = new Date()) {
  const nepalNow = new Date(now.getTime() + NEPAL_OFFSET_MIN * 60 * 1000);
  return nepalNow.getUTCHours() * 60 + nepalNow.getUTCMinutes();
}

export function needsCheckInCommentNepal(now = new Date()) {
  return minutesOfDayNepal(now) > 9 * 60 + 15; // after 09:15
}

export function needsCheckOutCommentNepal(now = new Date()) {
  return minutesOfDayNepal(now) < 18 * 60; // before 18:00
}
export function getAttendanceStatus(row: AttendanceRow | null) {
  return row?.status ?? "absent";
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Please try again.";
  }
}

export function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatSinceTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h === 0) return `${pad2(m)}:${pad2(s)}`;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
