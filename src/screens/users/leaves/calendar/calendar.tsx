import {
  buildAdminMarks,
  useCalendarStore,
} from "@/src/screens/admin/holidays";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import tw from "twrnc";

const DEFAULT_RETURN_TO = "/(users)/leaves/calendar/apply";

function firstParam(v?: string | string[]) {
  if (!v) return "";
  return Array.isArray(v) ? String(v[0] ?? "") : String(v);
}

function parseISO(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function isBeforeOrEqual(a: string, b: string) {
  return a <= b;
}

function buildPeriodMarks(start: string, end: string) {
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
      color: "#2563eb",
      textColor: "white",
    };

    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return marks;
}

export default function LeaveCalendarScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    from?: string | string[];
    id?: string | string[];
    returnTo?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
  }>();

  const from = firstParam(params.from);
  const id = firstParam(params.id);
  const returnTo = firstParam(params.returnTo) || DEFAULT_RETURN_TO;

  const initialStart = firstParam(params.startDate);
  const initialEnd = firstParam(params.endDate);

  const [selectedStart, setSelectedStart] = useState<string>("");
  const [selectedEnd, setSelectedEnd] = useState<string>("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // ── Subscribe to admin store so any admin change triggers a re-render ──────
  const adminStore = useCalendarStore();

  useEffect(() => {
    setSelectedStart(initialStart || "");
    setSelectedEnd(initialEnd || "");
  }, [initialStart, initialEnd]);

  const markedDates = useMemo(() => {
    // Base layer: admin colour-coding (holidays, weekends, office days)
    const adminMarks = buildAdminMarks(adminStore, year, month);

    // Overlay: period selection in blue (takes full priority when active)
    if (selectedStart && selectedEnd) {
      const start = isBeforeOrEqual(selectedStart, selectedEnd)
        ? selectedStart
        : selectedEnd;
      const end = isBeforeOrEqual(selectedStart, selectedEnd)
        ? selectedEnd
        : selectedStart;
      return buildPeriodMarks(start, end);
    }

    if (selectedStart && !selectedEnd) {
      return {
        ...adminMarks,
        [selectedStart]: {
          startingDay: true,
          endingDay: true,
          color: "#2563eb",
          textColor: "white",
        },
      };
    }

    // No selection — show admin marks only
    return adminMarks;
  }, [selectedStart, selectedEnd, adminStore, year, month]);

  // Switch markingType: "period" while selecting, "custom" otherwise so admin
  // colour-coded backgrounds and dots are visible when no range is active.
  const markingType = selectedStart ? "period" : "custom";

  function goBackWithDates(startDate: string, endDate: string) {
    router.replace({
      pathname: returnTo as any,
      params: {
        startDate,
        endDate,
        ...(from === "edit" && id ? { id } : {}),
        from: from || undefined,
      },
    });
  }

  const onDayPress = (day: { dateString: string }) => {
    const dateStr = day.dateString;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dateStr);
      setSelectedEnd("");
      return;
    }

    const start = selectedStart;
    const end = dateStr;

    const finalStart = isBeforeOrEqual(start, end) ? start : end;
    const finalEnd = isBeforeOrEqual(start, end) ? end : start;

    setSelectedStart(finalStart);
    setSelectedEnd(finalEnd);
    goBackWithDates(finalStart, finalEnd);
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <View style={tw`px-4 pt-4 pb-2`}>
        <Text style={tw`text-xl font-bold text-slate-900`}>Select Date</Text>
        <Text style={tw`mt-1 text-slate-500`}>
          {selectedStart && !selectedEnd
            ? "Tap again for end date"
            : "Tap once for start date, tap again for end date"}
        </Text>
      </View>

      {/* Legend — pulled from live admin colours */}
      <View style={tw`flex-row gap-4 px-4 mb-2`}>
        {(
          [
            ["publicHoliday", "Holiday"],
            ["weekend", "Off Day"],
          ] as const
        ).map(([k, l]) => (
          <View key={k} style={tw`flex-row items-center gap-1`}>
            <View
              style={[
                tw`rounded-full`,
                { width: 8, height: 8, backgroundColor: adminStore.colors[k] },
              ]}
            />
            <Text style={tw`text-xs text-slate-500`}>{l}</Text>
          </View>
        ))}
      </View>

      <View style={tw`px-4`}>
        <Calendar
          onDayPress={onDayPress}
          onMonthChange={(m) => {
            setYear(m.year);
            setMonth(m.month);
            // Clear selection when navigating months
            setSelectedStart("");
            setSelectedEnd("");
          }}
          markingType={markingType as any}
          markedDates={markedDates}
          theme={{
            backgroundColor: "white",
            calendarBackground: "white",
            textSectionTitleColor: "#64748b",
            dayTextColor: "#0f172a",
            monthTextColor: "#0f172a",
            arrowColor: "#2563eb",
            todayTextColor: "#2563eb",
          }}
        />
      </View>

      <View style={tw`mt-4 px-4`}>
        <Text style={tw`text-slate-700 font-semibold`}>
          Selected: {selectedStart || "-"}{" "}
          {selectedEnd ? `→ ${selectedEnd}` : ""}
        </Text>
      </View>
    </View>
  );
}
