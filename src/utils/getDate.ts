import { NEPAL_OFFSET_MIN } from "../constants";

export function nepalDateYYYYMMDD(now = new Date()) {
  const nepalNow = new Date(now.getTime() + NEPAL_OFFSET_MIN * 60 * 1000);
  return nepalNow.toISOString().slice(0, 10);
}

export const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

export const getTodayDisplayDate = () => {
  return new Date().toDateString();
};
export const formatTime = (iso: string | null) => {
  if (!iso) return "--";
  const date = new Date(iso);
  return date.toLocaleDateString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
export const getMonthKey = (iso: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 01-12
  return `${date.getFullYear()}-${month}`;
};
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
