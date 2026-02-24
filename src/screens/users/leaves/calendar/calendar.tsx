import {
  buildPeriodMarks,
  firstParam,
  isBeforeOrEqual,
} from "@/src/components/Calendar/userCalendar";
import { DEFAULT_RETURN_TO } from "@/src/constants/userCalendar";
import { buildAdminMarks, useCalendarStore } from "@/src/utils/adminCalendar";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import tw from "twrnc";

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

  const [selectedStart, setSelectedStart] = useState<string>(
    initialStart || "",
  );
  const [selectedEnd, setSelectedEnd] = useState<string>(initialEnd || "");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const adminStore = useCalendarStore();

  useEffect(() => {
    setSelectedStart(initialStart || "");
    setSelectedEnd(initialEnd || "");
  }, [initialStart, initialEnd]);

  const adminMarks = buildAdminMarks(year, month);

  let markedDates: Record<string, any>;

  if (selectedStart && selectedEnd) {
    const start = isBeforeOrEqual(selectedStart, selectedEnd)
      ? selectedStart
      : selectedEnd;
    const end = isBeforeOrEqual(selectedStart, selectedEnd)
      ? selectedEnd
      : selectedStart;
    markedDates = buildPeriodMarks(start, end);
  } else if (selectedStart && !selectedEnd) {
    markedDates = {
      ...adminMarks,
      [selectedStart]: {
        startingDay: true,
        endingDay: true,
        color: "#2563eb",
        textColor: "white",
      },
    };
  } else {
    markedDates = adminMarks;
  }

  const markingType = selectedStart ? "period" : "custom";

  function goBackWithDates(startDate: string, endDate: string) {
    const backParams: Record<string, string> = { startDate, endDate };
    if (from === "edit" && id) backParams.id = id;
    if (from) backParams.from = from;

    router.replace({ pathname: returnTo as any, params: backParams });
  }

  const onDayPress = (day: { dateString: string }) => {
    const dateStr = day.dateString;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dateStr);
      setSelectedEnd("");
      return;
    }

    const finalStart = isBeforeOrEqual(selectedStart, dateStr)
      ? selectedStart
      : dateStr;
    const finalEnd = isBeforeOrEqual(selectedStart, dateStr)
      ? dateStr
      : selectedStart;

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
