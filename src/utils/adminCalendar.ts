import { colors } from "@/theme/colors";
import { useEffect, useState } from "react";
import {
  CalendarColors,
  CalendarEvent,
  CalendarState,
  DayConfig,
  WeekendRules,
} from "../types/Calendar";

const DAY_NAME_TO_DOW: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const DEFAULT_WEEKENDS: string[] = ["sunday", "saturday"];

// ---- helpers ----
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseLocalYMD(dateStr: string): Date {
  const m = DATE_RE.exec(dateStr);
  if (!m) return new Date(dateStr);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function weekendArrayToDows(weekendDays: string[]): number[] {
  const dows: number[] = [];
  for (const day of weekendDays) {
    const dow = DAY_NAME_TO_DOW[day.trim().toLowerCase()];
    if (dow === undefined) continue;
    if (!dows.includes(dow)) dows.push(dow); // keep unique
  }
  return dows;
}

// ✅ cache array so we don't recompute every time
let _weekendDows: number[] = weekendArrayToDows(DEFAULT_WEEKENDS); // [0,3]

const DEFAULT_STATE: CalendarState = {
  colors: {
    publicHoliday: colors.danger,
    weekend: colors.danger,
    officeDay: colors.ink,
  },
  weekendRules: {
    sundayOff: true,
    mondayOff: true,
    tuesdayOff: false,
    wednesdayOff: false,
    thursdayOff: false,
    fridayOff: false,
    saturdayOff: false,
  },
  days: {},
};

let _state: CalendarState = JSON.parse(JSON.stringify(DEFAULT_STATE));
const _listeners = new Set<() => void>();
const _notify = () => _listeners.forEach((fn) => fn());

// ✅ Defined before calendarStore so the delegation in calendarStore.getMonthStats works
export function getMonthStats(year: number, month: number) {
  const { days } = _state;
  const totalDays = new Date(year, month, 0).getDate();

  let publicHolidays = 0;
  let weekends = 0;
  let officeDays = 0;
  let totalEvents = 0;

  for (let d = 1; d <= totalDays; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(
      2,
      "0",
    )}`;
    const cfg = days[key];

    // Inline getDayType — calendarStore isn't defined yet at this point
    let type: "publicHoliday" | "weekend" | "officeDay";
    if (cfg?.type === "publicHoliday") type = "publicHoliday";
    else if (cfg?.type === "officeDay") type = "officeDay";
    else {
      const dow = parseLocalYMD(key).getDay();
      type = _weekendDows.includes(dow) ? "weekend" : "officeDay";
    }

    if (type === "publicHoliday") publicHolidays++;
    else if (type === "weekend") weekends++;
    else officeDays++;

    totalEvents += days[key]?.events?.length ?? 0;
  }

  return { totalDays, publicHolidays, weekends, officeDays, totalEvents };
}

export const calendarStore = {
  subscribe(fn: () => void): () => void {
    _listeners.add(fn);
    return () => {
      _listeners.delete(fn);
    };
  },

  getState(): CalendarState {
    return _state;
  },

  getDayType(dateStr: string): "publicHoliday" | "weekend" | "officeDay" {
    const cfg = _state.days[dateStr];
    if (cfg?.type === "publicHoliday") return "publicHoliday";
    if (cfg?.type === "officeDay") return "officeDay";

    const dow = parseLocalYMD(dateStr).getDay();
    if (_weekendDows.includes(dow)) return "weekend";

    return "officeDay";
  },

  setColor(key: keyof CalendarColors, value: string) {
    _state = { ..._state, colors: { ..._state.colors, [key]: value } };
    _notify();
  },

  setWeekendRule(key: keyof WeekendRules, value: boolean) {
    _state = {
      ..._state,
      weekendRules: { ..._state.weekendRules, [key]: value },
    };
    _notify();
  },

  // ✅ call when backend returns ["sunday","monday"]
  setWeekendsFromBackend(weekendDays: string[]) {
    _weekendDows = weekendArrayToDows(weekendDays);

    // optional: keep weekendRules in sync
    _state = {
      ..._state,
      weekendRules: {
        sundayOff: _weekendDows.includes(0),
        mondayOff: _weekendDows.includes(1),
        tuesdayOff: _weekendDows.includes(2),
        wednesdayOff: _weekendDows.includes(3),
        thursdayOff: _weekendDows.includes(4),
        fridayOff: _weekendDows.includes(5),
        saturdayOff: _weekendDows.includes(6),
      },
    };

    _notify();
  },

  setHoliday(dateStr: string, label: string) {
    _state = {
      ..._state,
      days: {
        ..._state.days,
        [dateStr]: {
          ...(_state.days[dateStr] ?? {}),
          type: "publicHoliday",
          holidayLabel: label,
        },
      },
    };
    _notify();
  },

  removeHoliday(dateStr: string) {
    const { type: _t, holidayLabel: _l, ...rest } = _state.days[dateStr] ?? {};
    _state = {
      ..._state,
      days: { ..._state.days, [dateStr]: rest as DayConfig },
    };
    _notify();
  },

  addEvent(dateStr: string, label: string, color: string) {
    const ev: CalendarEvent = {
      id: `${Date.now()}-${Math.random()}`,
      label,
      color,
    };
    _state = {
      ..._state,
      days: {
        ..._state.days,
        [dateStr]: {
          ...(_state.days[dateStr] ?? {}),
          events: [...(_state.days[dateStr]?.events ?? []), ev],
        },
      },
    };
    _notify();
  },

  removeEvent(dateStr: string, eventId: string) {
    _state = {
      ..._state,
      days: {
        ..._state.days,
        [dateStr]: {
          ...(_state.days[dateStr] ?? {}),
          events: (_state.days[dateStr]?.events ?? []).filter(
            (e) => e.id !== eventId,
          ),
        },
      },
    };
    _notify();
  },
  getMonthStats(year: number, month: number) {
    return getMonthStats(year, month); // ✅ single source of truth
  },
  reset() {
    _state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    _weekendDows = weekendArrayToDows(DEFAULT_WEEKENDS);
    _notify();
  },
};
export function useCalendarStore(): CalendarState {
  const [s, setS] = useState<CalendarState>(calendarStore.getState());
  useEffect(() => {
    const unsubscribe = calendarStore.subscribe(() => {
      setS(calendarStore.getState());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return s;
}

export function buildAdminMarks(
  year: number,
  month: number,
): Record<string, any> {
  const marks: Record<string, any> = {};
  const { colors, days } = calendarStore.getState();
  const total = new Date(year, month, 0).getDate();

  for (let d = 1; d <= total; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(
      2,
      "0",
    )}`;
    const type = calendarStore.getDayType(key);
    const cfg = days[key];

    const customStyles = {
      container: {
        backgroundColor:
          type === "publicHoliday"
            ? colors.publicHoliday + "30"
            : type === "weekend"
              ? colors.weekend + "30"
              : undefined,
        borderRadius: 8,
      },
      text: {
        color:
          type === "publicHoliday"
            ? colors.publicHoliday
            : type === "weekend"
              ? colors.weekend
              : colors.officeDay,
        fontWeight: type !== "officeDay" ? ("700" as const) : ("500" as const),
      },
    };

    const dots = [
      ...(cfg?.holidayLabel
        ? [{ key: "holiday", color: colors.publicHoliday }]
        : []),
      ...(cfg?.events ?? []).map((ev) => ({ key: ev.id, color: ev.color })),
    ].slice(0, 4);

    marks[key] = { customStyles, dots, marked: dots.length > 0 };
  }

  return marks;
}
