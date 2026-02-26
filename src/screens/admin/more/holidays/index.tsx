// AdminCalendarScreen.tsx

import {
  DayModal,
  SettingsModal,
} from "@/src/components/Calendar/adminCalendar";
import { CalendarHeader } from "@/src/components/Calendar/CalendarHeader";
import { CalendarLegend } from "@/src/components/Calendar/CalendarLegend";
import { DayCell } from "@/src/components/Calendar/DayCell";
import { HolidayRangeModal } from "@/src/components/Calendar/HolidayRangeModal";
import {
  MonthEventList,
  MonthItem,
} from "@/src/components/Calendar/MonthEventList";
import { MonthStats } from "@/src/components/Calendar/MonthStats";
import {
  buildAdminMarks,
  calendarStore,
  useCalendarStore,
} from "@/src/utils/adminCalendar";
import React, { useMemo, useState as useReactState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AdminCalendarScreen() {
  const store = useCalendarStore();
  const today = new Date();
  const [year, setYear] = useReactState(today.getFullYear());
  const [month, setMonth] = useReactState(today.getMonth() + 1);
  const [selDate, setSelDate] = useReactState("");
  const [showDay, setShowDay] = useReactState(false);
  const [showSettings, setShowSettings] = useReactState(false);

  const [rangeStart, setRangeStart] = useReactState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useReactState<string | null>(null);
  const [showRangeModal, setShowRangeModal] = useReactState(false);

  const markedDates = useMemo(() => {
    const base = buildAdminMarks(year, month);

    if (rangeStart) {
      const end = rangeEnd ?? rangeStart;
      const [sy, sm, sd] = rangeStart.split("-").map(Number);
      const [ey, em, ed] = end.split("-").map(Number);

      let cursor = new Date(sy, sm - 1, sd);
      const endDate = new Date(ey, em - 1, ed);

      while (cursor <= endDate) {
        const key = formatDateKey(cursor);
        base[key] = {
          ...(base[key] ?? {}),
          color: store.colors.publicHoliday,
          textColor: "white",
          startingDay: key === rangeStart,
          endingDay: key === end,
        };
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    // Today — border only, no fill (handled in DayCell)
    const todayKey = formatDateKey(new Date());
    if (!rangeStart || !markedDates) {
      base[todayKey] = {
        ...(base[todayKey] ?? {}),
        startingDay: true,
        endingDay: true,
        color: "transparent",
        textColor: "#6366F1",
      };
    }

    return base;
  }, [year, month, rangeStart, rangeEnd, store.colors.publicHoliday]);

  const daysInMonth = new Date(year, month, 0).getDate();

  const stats = useMemo(() => {
    let holidays = 0,
      weekends = 0,
      office = 0,
      events = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const t = calendarStore.getDayType(key);
      if (t === "publicHoliday") holidays++;
      else if (t === "weekend") weekends++;
      else office++;
      events += store.days[key]?.events?.length ?? 0;
    }
    return { holidays, weekends, office, events };
  }, [store, year, month, daysInMonth]);

  // ── Grouped monthItems ───────────────────────────────────────────────────
  // ── Grouped monthItems ───────────────────────────────────────────────────
  const monthItems = useMemo<MonthItem[]>(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;

    const dayCfgs = Object.entries(store.days)
      .filter(([k]) => k.startsWith(prefix))
      .sort(([a], [b]) => a.localeCompare(b));

    const result: MonthItem[] = [];

    // ── Group consecutive days with same holiday label ──
    const holidayMap: Record<string, { start: string; end: string }> = {};
    for (const [key, cfg] of dayCfgs) {
      if (!cfg.holidayLabel) continue;
      const label = cfg.holidayLabel;
      if (!holidayMap[label]) {
        holidayMap[label] = { start: key, end: key };
      } else {
        holidayMap[label].end = key;
      }
    }
    for (const [label, { start, end }] of Object.entries(holidayMap)) {
      result.push({
        key: start,
        endKey: start === end ? undefined : end,
        label,
        color: store.colors.publicHoliday,
        tag: "Holiday",
      });
    }

    // ── Group consecutive days with same event label + color ──
    const eventMap: Record<
      string,
      { start: string; end: string; color: string }
    > = {};
    for (const [key, cfg] of dayCfgs) {
      for (const ev of cfg.events ?? []) {
        const mapKey = `${ev.label}__${ev.color}`;
        if (!eventMap[mapKey]) {
          eventMap[mapKey] = { start: key, end: key, color: ev.color };
        } else {
          eventMap[mapKey].end = key;
        }
      }
    }
    for (const [mapKey, { start, end, color }] of Object.entries(eventMap)) {
      const label = mapKey.split("__")[0];
      result.push({
        key: start,
        endKey: start === end ? undefined : end,
        label,
        color,
        tag: "Event",
      });
    }

    return result.sort((a, b) => a.key.localeCompare(b.key));
  }, [store, year, month]);
  // ────────────────────────────────────────────────────────────────────────

  const handleDayPress = (dateString: string) => {
    if (!rangeStart) {
      setRangeStart(dateString);
      setRangeEnd(null);
    } else if (!rangeEnd) {
      if (dateString < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(dateString);
      } else {
        setRangeEnd(dateString);
      }
      setShowRangeModal(true);
    } else {
      // Third tap — start fresh
      setRangeStart(dateString);
      setRangeEnd(null);
      setShowRangeModal(false);
    }
  };

  const clearRange = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setShowRangeModal(false);
  };

  const handleRangeConfirm = (
    type: "holiday" | "event",
    label: string,
    color?: string,
  ) => {
    if (!rangeStart || !rangeEnd) return;

    const [sy, sm, sd] = rangeStart.split("-").map(Number);
    const [ey, em, ed] = rangeEnd.split("-").map(Number);

    let cursor = new Date(sy, sm - 1, sd);
    const endDate = new Date(ey, em - 1, ed);

    while (cursor <= endDate) {
      const key = formatDateKey(cursor);
      if (type === "holiday") {
        calendarStore.setHoliday(key, label);
      } else {
        calendarStore.addEvent(key, label, color ?? "#3B82F6");
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    clearRange();
  };

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={tw`flex-1 bg-white`}
    >
      <CalendarHeader onSettingsPress={() => setShowSettings(true)} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <CalendarLegend />

        <View
          style={tw`mx-4 rounded-2xl overflow-hidden shadow-sm bg-white mb-4`}
        >
          <Calendar
            current={`${year}-${String(month).padStart(2, "0")}-01`}
            onMonthChange={(m) => {
              setYear(m.year);
              setMonth(m.month);
            }}
            dayComponent={({ date, state, marking }) => (
              <DayCell
                date={date}
                state={state}
                marking={marking}
                onPress={handleDayPress}
              />
            )}
            markedDates={markedDates}
            markingType="period"
            enableSwipeMonths
            theme={{
              backgroundColor: "white",
              calendarBackground: "white",
              textSectionTitleColor: "#64748b",
              monthTextColor: "#0f172a",
              arrowColor: "#6366F1",
              textMonthFontWeight: "700",
              textDayHeaderFontSize: 12,
            }}
          />
        </View>

        {/* Hint bar — shows after first tap */}
        {rangeStart && !rangeEnd && (
          <View
            style={tw`mx-4 mb-2 px-4 py-2 bg-indigo-50 rounded-xl flex-row items-center justify-between`}
          >
            <Text style={tw`text-indigo-600 text-sm font-medium`}>
              Start: {rangeStart} — tap an end date
            </Text>
            <TouchableOpacity onPress={clearRange}>
              <Text style={tw`text-red-400 text-sm`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <MonthStats stats={stats} />
        <MonthEventList items={monthItems} />
      </ScrollView>

      <DayModal
        visible={showDay}
        dateStr={selDate}
        onClose={() => setShowDay(false)}
      />

      <HolidayRangeModal
        visible={showRangeModal}
        startDate={rangeStart ?? ""}
        endDate={rangeEnd ?? ""}
        onClose={clearRange}
        onConfirm={handleRangeConfirm}
      />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
}
