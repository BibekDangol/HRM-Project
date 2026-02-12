import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import tw from "twrnc";

const HOLIDAYS = ["2026-02-19", "2026-03-08", "2026-04-14"];

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
  return a <= b; // works for YYYY-MM-DD
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

  const from = firstParam(params.from); // "apply" | "edit" | ""
  const id = firstParam(params.id); // leave id in edit mode
  const returnTo = firstParam(params.returnTo) || DEFAULT_RETURN_TO;

  const initialStart = firstParam(params.startDate);
  const initialEnd = firstParam(params.endDate);

  const [selectedStart, setSelectedStart] = useState<string>("");
  const [selectedEnd, setSelectedEnd] = useState<string>("");

  useEffect(() => {
    setSelectedStart(initialStart || "");
    setSelectedEnd(initialEnd || "");
  }, [initialStart, initialEnd]);

  const holidayMarks = useMemo(() => {
    const marks: Record<string, any> = {};
    for (const h of HOLIDAYS) {
      marks[h] = { marked: true, dotColor: "#ef4444" };
    }
    return marks;
  }, []);

  const selectionMarks = useMemo(() => {
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
        [selectedStart]: {
          startingDay: true,
          endingDay: true,
          color: "#2563eb",
          textColor: "white",
        },
      };
    }

    return {};
  }, [selectedStart, selectedEnd]);

  const markedDates = useMemo(() => {
    const merged: Record<string, any> = { ...holidayMarks };
    for (const k of Object.keys(selectionMarks)) {
      merged[k] = { ...(merged[k] ?? {}), ...selectionMarks[k] };
    }
    return merged;
  }, [holidayMarks, selectionMarks]);

  function goBackWithDates(startDate: string, endDate: string) {
    router.replace({
      pathname: returnTo as any,
      params: {
        startDate,
        endDate,
        // ✅ keep edit mode alive
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
    <>
      <Stack.Screen
        options={{
          title: "Calendar",
          headerTitleAlign: "left",
          headerTitle: () => null,
          headerLeft: () => (
            <Pressable
              onPress={() => router.push("/(users)/leaves")}
              hitSlop={12}
              style={({ pressed }) => [pressed && tw`opacity-70`]}
            >
              <ArrowLeft size={24} color="#0f172a" />
            </Pressable>
          ),
        }}
      />

      <View style={tw`flex-1 bg-white`}>
        {/* <Pressable
          onPress={() => {
            // If user already picked something, keep it when going back
            if (selectedStart && selectedEnd) {
              const start = isBeforeOrEqual(selectedStart, selectedEnd)
                ? selectedStart
                : selectedEnd;
              const end = isBeforeOrEqual(selectedStart, selectedEnd)
                ? selectedEnd
                : selectedStart;
              goBackWithDates(start, end);
              return;
            }

            // If they didn't complete selection:
            if (from === "apply" || from === "edit") {
              router.replace({
                pathname: returnTo as any,
                params: {
                  ...(from === "edit" && id ? { id } : {}),
                  from: from || undefined,
                },
              });
              return;
            }

            router.replace("/(users)/leaves");
          }}
          style={({ pressed }) => [
            tw`mt-6 px-4 py-4 rounded-xl border border-slate-200 items-center`,
            pressed && tw`opacity-85`,
          ]}
        >
          <Text style={tw`text-slate-900 font-bold`}>Back</Text>
        </Pressable> */}

        <View style={tw`px-4 pt-4 pb-2`}>
          <Text style={tw`text-xl font-bold text-slate-900`}>Select Date</Text>
          <Text style={tw`mt-1 text-slate-500`}>
            Tap once for start date, tap again for end date
          </Text>
        </View>

        <View style={tw`px-4`}>
          <Calendar
            onDayPress={onDayPress}
            markingType="period"
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

          <View style={tw`mt-3 flex-row items-center`}>
            <View style={tw`h-3 w-3 rounded-full bg-[#ef4444]`} />
            <Text style={tw`ml-2 text-slate-700 font-semibold`}>Holiday</Text>
          </View>
        </View>
      </View>
    </>
  );
}
