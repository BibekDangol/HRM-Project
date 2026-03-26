import { DayCell } from "@/src/components/Calendar/DayCell";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

interface SharedCalendarProps {
  year: number;
  month: number;
  markedDates: Record<string, any>;
  markingType?: "period" | "custom";
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange: (m: { year: number; month: number }) => void;
  dayComponent?: any;
  minDate?: string;
}

const todayStr = new Date().toISOString().split("T")[0];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDisplayDate(dateString: string) {
  const date = new Date(dateString);

  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });

  return `${weekday}, ${day} ${month}`;
}

function formatMonthYear(year: number, month: number) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getMonthString(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

export function SharedCalendar({
  year,
  month,
  markedDates,
  markingType = "custom",
  onDayPress,
  onMonthChange,
  dayComponent,
  minDate = todayStr,
}: SharedCalendarProps) {
  const initialSelected =
    Object.keys(markedDates || {}).find((key) => markedDates[key]?.selected) ||
    todayStr;

  const [visibleMonth, setVisibleMonth] = useState({ year, month });
  const [selectedDate, setSelectedDate] = useState(initialSelected);

  const currentString = useMemo(
    () => getMonthString(visibleMonth.year, visibleMonth.month),
    [visibleMonth],
  );

  const displayedMarkedDates = useMemo(() => {
    return {
      ...markedDates,
      [selectedDate]: {
        ...(markedDates[selectedDate] || {}),
        selected: true,
      },
    };
  }, [markedDates, selectedDate]);

  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    onDayPress({ dateString });
  };

  const goToPrevMonth = () => {
    let newYear = visibleMonth.year;
    let newMonth = visibleMonth.month - 1;

    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    const updated = { year: newYear, month: newMonth };
    setVisibleMonth(updated);
    onMonthChange(updated);
  };

  const goToNextMonth = () => {
    let newYear = visibleMonth.year;
    let newMonth = visibleMonth.month + 1;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    const updated = { year: newYear, month: newMonth };
    setVisibleMonth(updated);
    onMonthChange(updated);
  };

  const resolvedDayComponent =
    dayComponent ??
    (({ date, state, marking }: any) => {
      if (!date) return <View style={{ width: 36, height: 44 }} />;

      return (
        <DayCell
          date={date}
          state={state}
          marking={marking}
          onPress={(dateString: string) => handleSelectDate(dateString)}
        />
      );
    });

  return (
    <View
      style={{
        width: "100%",
        maxWidth: 350,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}
    >
      <View
        style={{
          backgroundColor: "#1B4A5A",
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: 16,
        }}
      >
        <Text
          style={{
            color: "#DDE7EB",
            fontSize: 14,
            fontWeight: "500",
          }}
        >
          {new Date(selectedDate).getFullYear()}
        </Text>

        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 22,
            fontWeight: "700",
            marginTop: 4,
          }}
        >
          {formatDisplayDate(selectedDate)}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 8,
        }}
      >
        <Pressable
          onPress={goToPrevMonth}
          style={({ pressed }) => ({
            width: 34,
            height: 34,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 24, color: "#0F172A", fontWeight: "600" }}>
            ‹
          </Text>
        </Pressable>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#0F172A",
          }}
        >
          {formatMonthYear(visibleMonth.year, visibleMonth.month)}
        </Text>

        <Pressable
          onPress={goToNextMonth}
          style={({ pressed }) => ({
            width: 34,
            height: 34,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 24, color: "#0F172A", fontWeight: "600" }}>
            ›
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingBottom: 6,
        }}
      >
        {weekDays.map((item) => (
          <View
            key={item}
            style={{
              width: 36,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#64748B",
              }}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ paddingHorizontal: 10, paddingBottom: 12 }}>
        <Calendar
          key={currentString}
          current={currentString}
          onDayPress={(day) => handleSelectDate(day.dateString)}
          onMonthChange={(m) => {
            const updated = { year: m.year, month: m.month };
            setVisibleMonth(updated);
            onMonthChange(updated);
          }}
          markingType={markingType as any}
          markedDates={displayedMarkedDates}
          dayComponent={resolvedDayComponent}
          enableSwipeMonths
          hideArrows
          renderHeader={() => <View />}
          headerStyle={{ height: 0, marginBottom: 0 }}
          hideDayNames={true}
          hideExtraDays={false}
          firstDay={0}
          minDate={minDate}
          theme={{
            backgroundColor: "#ffffff",
            calendarBackground: "#ffffff",
            dayTextColor: "#0F172A",
            todayTextColor: "#1B4A5A",
            textDisabledColor: "#CBD5E1",
            textDayFontSize: 14,
          }}
          style={{
            backgroundColor: "#fff",
          }}
        />
      </View>
    </View>
  );
}
