import { CalendarHeader } from "@/src/components/Calendar/CalendarHeader";
import { CalendarLegend } from "@/src/components/Calendar/CalendarLegend";
import { DayCell } from "@/src/components/Calendar/DayCell";
import {
  MonthEventList,
  MonthItem,
} from "@/src/components/Calendar/MonthEventList";
import { MonthStats } from "@/src/components/Calendar/MonthStats";
import {
  DayModal,
  SettingsModal,
} from "@/src/components/Calendar/adminCalendar";
import {
  buildAdminMarks,
  calendarStore,
  useCalendarStore,
} from "@/src/utils/adminCalendar";
import React, { useMemo, useState as useReactState } from "react";
import { ScrollView, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function AdminCalendarScreen() {
  const store = useCalendarStore();
  const today = new Date();
  const [year, setYear] = useReactState(today.getFullYear());
  const [month, setMonth] = useReactState(today.getMonth() + 1);
  const [selDate, setSelDate] = useReactState("");
  const [showDay, setShowDay] = useReactState(false);
  const [showSettings, setShowSettings] = useReactState(false);

  const markedDates = useMemo(
    () => buildAdminMarks(year, month),
    [year, month],
  );

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

  const monthItems = useMemo<MonthItem[]>(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    return Object.entries(store.days)
      .filter(([k]) => k.startsWith(prefix))
      .flatMap(([key, cfg]) => [
        ...(cfg.holidayLabel
          ? [
              {
                key,
                label: `${cfg.holidayLabel}`,
                color: store.colors.publicHoliday,
                tag: "Holiday",
              },
            ]
          : []),
        ...(cfg.events ?? []).map((ev) => ({
          key,
          label: ev.label,
          color: ev.color,
          tag: "Event",
        })),
      ]);
  }, [store, year, month]);

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
            dayComponent={({ date, state }) => (
              <DayCell
                date={date}
                state={state}
                onPress={(dateString) => {
                  setSelDate(dateString);
                  setShowDay(true);
                }}
              />
            )}
            markedDates={markedDates}
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

        <MonthStats stats={stats} />
        <MonthEventList items={monthItems} />
      </ScrollView>

      <DayModal
        visible={showDay}
        dateStr={selDate}
        onClose={() => setShowDay(false)}
      />
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
}
