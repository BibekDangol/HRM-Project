// utils/attendanceHelper.ts

import { AttendanceRow } from "@/src/types/attendance";
import { getAttendanceRulesService } from "../services/users/attendance.service";

export const CHECKIN_NOTIFICATION_ID = "attendance-checkin";
export const CHECKOUT_NOTIFICATION_ID = "attendance-checkout";

const NEPAL_OFFSET_MIN = 5 * 60 + 45; // UTC+05:45

// 🕑 Nepal time in minutes
export function minutesOfDayNepal(now = new Date()) {
  const nepalNow = new Date(now.getTime() + NEPAL_OFFSET_MIN * 60 * 1000);
  return nepalNow.getUTCHours() * 60 + nepalNow.getUTCMinutes();
}

// 🔹 Convert HH:MM:SS → minutes
export function timeStringToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// 🔹 Convert HH:MM:SS → hour & minute for notifications
export function parseHourMinute(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return { hour, minute };
}

// ✅ Get check-in/out times dynamically
export async function getCheckInTime() {
  const rules = await getAttendanceRulesService();
  return parseHourMinute(rules.checkin_start);
}
export async function getCheckOutTime() {
  const rules = await getAttendanceRulesService();
  return parseHourMinute(rules.checkout_end);
}

// 🔹 Check if check-in needs comment
export function needsCheckInCommentNepal(rules: any, now = new Date()) {
  const current = minutesOfDayNepal(now);
  const checkinEnd = timeStringToMinutes(rules.checkin_end);
  return current > checkinEnd;
}

// 🔹 Check if check-out needs comment
export function needsCheckOutCommentNepal(rules: any, now = new Date()) {
  const current = minutesOfDayNepal(now);
  const checkoutStart = timeStringToMinutes(rules.checkout_start);
  return current < checkoutStart;
}

// 🔹 Check-in status: late / half-day / present
export function getCheckInStatus(rules: any, now = new Date()) {
  const current = minutesOfDayNepal(now);

  const checkinEnd = timeStringToMinutes(rules.checkin_end);
  const halfDayLimit = checkinEnd + 60; // optional: 1h after late mark → half-day

  if (current > halfDayLimit) return "half_day";
  if (current > checkinEnd) return "late";
  return "present";
}

// 🔹 Check-out status: early exit / completed
export function getCheckOutStatus(rules: any, now = new Date()) {
  const current = minutesOfDayNepal(now);

  const checkoutStart = timeStringToMinutes(rules.checkout_start);
  const checkoutEnd = timeStringToMinutes(rules.checkout_end);

  if (current < checkoutStart) return "early_exit";
  if (current > checkoutEnd) return "completed";
  return "completed";
}

// 🔹 Generic helpers
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

export function formatSinceTime(d: Date | null | undefined) {
  if (!d) return "";
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
