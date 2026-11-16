const NEPAL_OFFSET_MIN = 5 * 60 + 45;
export const MAX_YEAR = 2026;
// If you want a min year too, change it here:
export const MIN_YEAR = 2000;

export function normalize(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getNepalMonthDateRangeYYYYMMDD(
  selectedYear: number,
  selectedMonthIndex: number,
) {
  const nepalStartLocalAsUTC = new Date(
    Date.UTC(selectedYear, selectedMonthIndex, 1, 0, 0, 0),
  );
  const nepalEndLocalAsUTC = new Date(
    Date.UTC(selectedYear, selectedMonthIndex + 1, 1, 0, 0, 0),
  );

  // DATE columns contain calendar dates, so no timezone offset applies.
  const start = nepalStartLocalAsUTC.toISOString().slice(0, 10);
  const end = nepalEndLocalAsUTC.toISOString().slice(0, 10);

  return { startDate: start, endDateExclusive: end };
}

export function getNepalMonthRangeUTCISO(
  selectedYear: number,
  selectedMonthIndex: number,
) {
  const nepalStartLocalAsUTC = new Date(
    Date.UTC(selectedYear, selectedMonthIndex, 1, 0, 0, 0),
  );
  const nepalEndLocalAsUTC = new Date(
    Date.UTC(selectedYear, selectedMonthIndex + 1, 1, 0, 0, 0),
  );

  const startUTC = new Date(
    nepalStartLocalAsUTC.getTime() - NEPAL_OFFSET_MIN * 60 * 1000,
  );
  const endUTC = new Date(
    nepalEndLocalAsUTC.getTime() - NEPAL_OFFSET_MIN * 60 * 1000,
  );

  return { startISO: startUTC.toISOString(), endISO: endUTC.toISOString() };
}
