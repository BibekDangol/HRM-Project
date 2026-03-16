import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

import { supabase } from "@/src/supabase/supabaseClient";
import {
  buildAdminMarks,
  calendarStore,
  useCalendarStore,
} from "@/src/utils/adminCalendar";

// import { SettingsModal } from "@/src/components/Calendar/SettingsModal";
import { CalendarHeader } from "@/src/components/Calendar/CalendarHeader";
import { DayCell } from "@/src/components/Calendar/DayCell";
import { HolidayRangeModal } from "@/src/components/Calendar/HolidayRangeModal";
import { SharedCalendar } from "@/src/components/SharedCalendar";
import { TW } from "@/theme/twStyles";

interface Props {
  currentUserId: string;
  currentOrgId: string;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AdminCalendarScreen({
  currentUserId,
  currentOrgId,
}: Props) {
  const store = useCalendarStore();
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleDayPress = useCallback(
    (dateString: string) => {
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
        setRangeStart(dateString);
        setRangeEnd(null);
      }
    },
    [rangeStart, rangeEnd],
  );

  const clearRange = useCallback(() => {
    setRangeStart(null);
    setRangeEnd(null);
    setShowRangeModal(false);
  }, []);

  const markedDates = useMemo(() => {
    const base = { ...buildAdminMarks(year, month) };

    if (rangeStart) {
      const end = rangeEnd ?? rangeStart;
      let cursor = new Date(rangeStart);
      const endDate = new Date(end);

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

    return base;
  }, [year, month, rangeStart, rangeEnd, store.colors.publicHoliday]);

  // const monthItems = useMemo(() => {
  //   const prefix = `${year}-${String(month).padStart(2, "0")}`;
  //   const dayCfgs = Object.entries(store.days)
  //     .filter(([k]) => k.startsWith(prefix))
  //     .sort(([a], [b]) => a.localeCompare(b));

  //   const result: any[] = [];

  //   // Holidays
  //   const holidayMap: Record<string, { start: string; end: string }> = {};
  //   for (const [key, cfg] of dayCfgs) {
  //     if (!cfg.holidayLabel) continue;
  //     const label = cfg.holidayLabel;
  //     if (!holidayMap[label]) holidayMap[label] = { start: key, end: key };
  //     else holidayMap[label].end = key;
  //   }
  //   for (const [label, { start, end }] of Object.entries(holidayMap)) {
  //     result.push({
  //       key: start,
  //       endKey: start === end ? undefined : end,
  //       label,
  //       color: store.colors.publicHoliday,
  //       tag: "Holiday",
  //     });
  //   }

  //   // Events
  //   const eventMap: Record<
  //     string,
  //     { start: string; end: string; color: string }
  //   > = {};
  //   for (const [key, cfg] of dayCfgs) {
  //     for (const ev of cfg.events ?? []) {
  //       const mapKey = `${ev.label}__${ev.color}`;
  //       if (!eventMap[mapKey])
  //         eventMap[mapKey] = { start: key, end: key, color: ev.color };
  //       else eventMap[mapKey].end = key;
  //     }
  //   }
  //   for (const [mapKey, { start, end, color }] of Object.entries(eventMap)) {
  //     const label = mapKey.split("__")[0];
  //     result.push({
  //       key: start,
  //       endKey: start === end ? undefined : end,
  //       label,
  //       color,
  //       tag: "Event",
  //     });
  //   }

  //   return result.sort((a, b) => a.key.localeCompare(b.key));
  // }, [store, year, month]);

  // ── Save range to Supabase ─────────────────────
  const handleRangeConfirm = async (
    type: "holiday" | "event",
    label: string,
    color?: string,
  ) => {
    if (!rangeStart) return;
    const start = rangeStart;
    const end = rangeEnd ?? rangeStart;

    let cursor = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T00:00:00");
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

    // Save to Supabase in background
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("No authenticated user");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        console.log("No organization_id found");
        return;
      }

      const { error } = await supabase.from("admin_calendar").insert([
        {
          user_id: user.id,
          organization_id: profile.organization_id,
          start_date: start,
          end_date: end,
          title: label,
          type,
          color: color ?? (type === "holiday" ? "#EF4444" : "#3B82F6"),
        },
      ]);

      console.log("Admin insert →", {
        org: profile.organization_id,
        start,
        end,
        label,
        type,
        error: error?.message,
      });
    } catch (err) {
      console.log("Unexpected error:", err);
    }
  };

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={tw`flex-1 bg-white`}
    >
      <CalendarHeader onSettingsPress={() => setShowSettings(true)} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedCalendar
          year={year}
          month={month}
          markedDates={markedDates}
          markingType="period"
          onDayPress={(day) => handleDayPress(day.dateString)}
          onMonthChange={(m: { year: number; month: number }) => {
            setYear(m.year);
            setMonth(m.month);
          }}
          dayComponent={({ date, state, marking }: any) => {
            if (!date) return null;
            return (
              <DayCell
                date={date}
                state={state}
                marking={marking}
                onPress={() => handleDayPress(date.dateString)}
              />
            );
          }}
          showLegend={true}
        />

        {rangeStart && !rangeEnd && (
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: "rgba(27,74,90,0.08)",
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{ color: TW.bgSecondary, fontSize: 13, fontWeight: "500" }}
            >
              Start: {rangeStart} — tap an end date
            </Text>
            <TouchableOpacity onPress={clearRange}>
              <Text style={{ color: "#EF4444", fontSize: 13 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <HolidayRangeModal
        visible={showRangeModal}
        startDate={rangeStart ?? ""}
        endDate={rangeEnd ?? ""}
        onClose={clearRange}
        onConfirm={handleRangeConfirm}
      />

      {/* <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      /> */}
    </SafeAreaView>
  );
}
