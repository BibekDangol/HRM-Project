export type FilterType = "all" | "holiday" | "event";

export type CalendarItem = {
  id: string;
  title: string;
  type: "holiday" | "event";
  color: string;
  start_date: string;
  end_date: string;
};
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

export const SHORT_MONTHS = MONTHS.map((m) => m.slice(0, 3));

export const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "holiday", label: "Holidays" },
  { key: "event", label: "Events" },
];

export const parseLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatMonthDay = (dateString: string) => {
  const date = parseLocalDate(dateString);

  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
    dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
  };
};

export const formatWeekday = (dateString: string) =>
  parseLocalDate(dateString).toLocaleDateString("en-US", {
    weekday: "long",
  });

export const formatDate = (dateString: string) => {
  const date = parseLocalDate(dateString);
  return `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}`;
};

export const getNepalTodayKey = () => {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "00";
  const day = parts.find((p) => p.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
};

export const isActiveToday = (item: CalendarItem, todayKey: string) => {
  const endKey = item.end_date ?? item.start_date;
  return item.start_date <= todayKey && endKey >= todayKey;
};

export const isUpcoming = (item: CalendarItem, todayKey: string) => {
  const endKey = item.end_date ?? item.start_date;
  return endKey >= todayKey;
};

export const getSyncedCalendarItems = (
  items: CalendarItem[],
  todayKey: string,
  filter: FilterType = "all"
) => {
  return items
    .filter((item) => filter === "all" || item.type === filter)
    .filter((item) => isUpcoming(item, todayKey))
    .sort((a, b) => {
      const aToday = isActiveToday(a, todayKey);
      const bToday = isActiveToday(b, todayKey);

      if (aToday && !bToday) return -1;
      if (!aToday && bToday) return 1;

      const aKey = a.start_date >= todayKey ? a.start_date : todayKey;
      const bKey = b.start_date >= todayKey ? b.start_date : todayKey;

      return aKey.localeCompare(bKey);
    });
};