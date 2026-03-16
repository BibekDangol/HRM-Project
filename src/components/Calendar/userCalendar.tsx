export function firstParam(v?: string | string[]) {
  if (!v) return "";
  return Array.isArray(v) ? String(v[0] ?? "") : String(v);
}

function parseISO(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

export function isBeforeOrEqual(a: string, b: string) {
  return a <= b;
}

export function buildPeriodMarks(start: string, end: string) {
  const marks: Record<string, any> = {};
  const s = parseISO(start);
  const e = parseISO(end);
  if (!s || !e) return marks;

  const cur = new Date(s.getTime());
  while (cur.getTime() <= e.getTime()) {
    const y = cur.getUTCFullYear();
    const m = String(cur.getUTCMonth() + 1).padStart(2, "0");
    const d = String(cur.getUTCDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;

    marks[key] = {
      startingDay: key === start,
      endingDay: key === end,
      color: "#F59E0B",
      textColor: "white",
    };

    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return marks;
}