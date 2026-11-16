import { colors } from "@/theme/colors";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Calendar } from "react-native-calendars";
import { DayCell } from "@/src/components/Calendar/DayCell";

import { TW } from "@/theme/twStyles";
import { MonthPickerModal } from "./Home/MonthPickerModal";

interface SharedCalendarProps {
  year: number;
  month: number; // 1-based
  markedDates?: Record<string, any>;
  markingType?: "period" | "custom";
  onDayPress?: (day: { dateString: string }) => void;
  onMonthChange: (m: { year: number; month: number }) => void;
  dayComponent?: any;
  minDate?: string;
  showLegend?: boolean;
  onRangeChange?: (range: { startDate: string | null; endDate: string | null }) => void;
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

function normalizeDateString(date: Date) {
  return date.toISOString().split("T")[0];
}

function buildRangeMarkedDates(
  startDate: string,
  endDate: string,
  color = TW.bgSecondary,
) {
  const marks: Record<string, any> = {};

  let start = new Date(startDate);
  let end = new Date(endDate);

  if (start > end) {
    const temp = start;
    start = end;
    end = temp;
  }

  const startStr = normalizeDateString(start);
  const endStr = normalizeDateString(end);

  const current = new Date(start);

  while (current <= end) {
    const dateString = normalizeDateString(current);

    marks[dateString] = {
      color,
      textColor: colors.surface,
      startingDay: dateString === startStr,
      endingDay: dateString === endStr,
    };

    current.setDate(current.getDate() + 1);
  }

  return marks;
}

function getOrderedRange(startDate: string, endDate: string) {
  if (startDate <= endDate) return { startDate, endDate };
  return { startDate: endDate, endDate: startDate };
}

export function SharedCalendar({
  year,
  month,
  markedDates = {},
  markingType = "period",
  onDayPress,
  onMonthChange,
  dayComponent,
  minDate = todayStr,
  showLegend = false,
  onRangeChange,
}: SharedCalendarProps) {
  const visibleMonth = { year, month };
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);
  const [pickerMonth, setPickerMonth] = useState(month - 1); // modal uses 0-based

  const currentString = useMemo(
    () => getMonthString(year, month),
    [year, month],
  );

  const selectedDisplayDate = useMemo(() => {
    if (endDate) return endDate;
    if (startDate) return startDate;
    return todayStr;
  }, [startDate, endDate]);

  const rangeMarkedDates = useMemo(() => {
    if (startDate && endDate) {
      return buildRangeMarkedDates(startDate, endDate, TW.bgSecondary);
    }

    if (startDate) {
      return {
        [startDate]: {
          selected: true,
          highlighted: true,
        },
      };
    }

    return {};
  }, [startDate, endDate]);

  const displayedMarkedDates = useMemo(() => {
    return {
      ...markedDates,
      ...rangeMarkedDates,
    };
  }, [markedDates, rangeMarkedDates]);

  useEffect(() => {
    if (!onRangeChange) return;

    if (startDate && endDate) {
      onRangeChange(getOrderedRange(startDate, endDate));
      return;
    }

    onRangeChange({ startDate, endDate });
  }, [startDate, endDate, onRangeChange]);

  const handleSelectDate = (dateString: string) => {
    onDayPress?.({ dateString });

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateString);
      setEndDate(null);
      return;
    }

    if (startDate && !endDate) {
      setEndDate(dateString);
    }
  };

  const handleMonthChangeInternal = (updated: { year: number; month: number }) => {
    setPickerYear(updated.year);
    setPickerMonth(updated.month - 1);
    onMonthChange(updated);
  };

  const goToPrevMonth = () => {
    let newYear = visibleMonth.year;
    let newMonth = visibleMonth.month - 1;

    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    handleMonthChangeInternal({ year: newYear, month: newMonth });
  };

  const goToNextMonth = () => {
    let newYear = visibleMonth.year;
    let newMonth = visibleMonth.month + 1;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    handleMonthChangeInternal({ year: newYear, month: newMonth });
  };

  const goToToday = () => {
    const today = new Date();
    handleMonthChangeInternal({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    });
  };

  const clearSelection = () => {
    setStartDate(null);
    setEndDate(null);
    onRangeChange?.({ startDate: null, endDate: null });
  };

  const handleConfirmPicker = () => {
    handleMonthChangeInternal({
      year: pickerYear,
      month: pickerMonth + 1,
    });
  };

  const resolvedDayComponent =
    dayComponent ??
    (({ date, state, marking }: any) => {
      if (!date) return <View style={{ width: 44, height: 52 }} />;

      return (
        <DayCell
          date={date}
          state={state}
          marking={marking}
          onPress={(dateString: string) => handleSelectDate(dateString)}
        />
      );
    });

  const orderedRange =
    startDate && endDate ? getOrderedRange(startDate, endDate) : null;

  return (
    <>
      <View
        style={{
          alignSelf: "center",
          width: "92%",
          marginVertical: 16,
          backgroundColor: colors.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        {/* Top header like your reference */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 18,
            backgroundColor: TW.bgSecondary,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: colors.onPrimarySoft,
              fontWeight: "600",
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Select date
          </Text>

          <Text
            style={{
              fontSize: 30,
              fontWeight: "400",
              color: colors.surface,
              letterSpacing: -0.3,
            }}
          >
            {formatDisplayDate(selectedDisplayDate)}
          </Text>

          {orderedRange && (
            <Text
              style={{
                color: colors.onPrimarySoft,
                fontSize: 13,
                marginTop: 8,
                fontWeight: "600",
              }}
            >
              {`${orderedRange.startDate} → ${orderedRange.endDate}`}
            </Text>
          )}
        </View>

        <View style={{ height: 1, backgroundColor: colors.border }} />

        {/* Month / year control row */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingTop: 14,
            paddingBottom: 8,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose calendar month and year"
            onPress={() => {
              setPickerYear(year);
              setPickerMonth(month - 1);
              setPickerVisible(true);
            }}
            style={{
              minHeight: 48,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: TW.bgSecondary,
              }}
            >
              {formatMonthYear(visibleMonth.year, visibleMonth.month)}
            </Text>
            <Text
              style={{
                color: TW.bgSecondary,
                fontSize: 11,
              }}
            >
              ▼
            </Text>
          </Pressable>

          <View style={{ flexDirection: "row", gap: 14 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={goToPrevMonth}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed ? colors.border : "transparent",
              })}
            >
              <Text
                style={{
                  fontSize: 24,
                  color: TW.bgSecondary,
                  fontWeight: "500",
                }}
              >
                ‹
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={goToNextMonth}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed ? colors.border : "transparent",
              })}
            >
              <Text
                style={{
                  fontSize: 24,
                  color: TW.bgSecondary,
                  fontWeight: "500",
                }}
              >
                ›
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Today / Clear actions */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            paddingBottom: 10,
          }}
        >
          <Pressable
            onPress={goToToday}
            style={({ pressed }) => ({
              paddingHorizontal: 16,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: pressed ? colors.border : colors.border,
            })}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: TW.bgSecondary,
              }}
            >
              Today
            </Text>
          </Pressable>

          {(startDate || endDate) && (
            <Pressable
              onPress={clearSelection}
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: pressed ? colors.dangerBorder : colors.dangerSoft,
              })}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.dangerText,
                }}
              >
                Clear
              </Text>
            </Pressable>
          )}
        </View>

        {/* Weekdays */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingBottom: 6,
          }}
        >
          {weekDays.map((item) => (
            <View
              key={item}
              style={{
                width: 44,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.muted,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar */}
        <View style={{ paddingHorizontal: 12, paddingBottom: 14 }}>
          <Calendar
            key={currentString}
            current={currentString}
            onDayPress={(day) => handleSelectDate(day.dateString)}
            onMonthChange={(m) => {
              handleMonthChangeInternal({ year: m.year, month: m.month });
            }}
            markingType={markingType as any}
            markedDates={displayedMarkedDates}
            dayComponent={resolvedDayComponent}

            hideArrows
            renderHeader={() => <View />}
            headerStyle={{ height: 0, marginBottom: 0 }}
            hideDayNames
            hideExtraDays={false}
            firstDay={0}
            minDate={minDate}
            theme={{
              backgroundColor: TW.bgPrimary,
              calendarBackground: TW.bgPrimary,
              dayTextColor: colors.ink,
              todayTextColor: TW.bgSecondary,
              textDisabledColor: colors.borderStrong,
              textDayFontSize: 14,
              monthTextColor: TW.bgSecondary,
            }}
            style={{
              backgroundColor:  colors.surface,
            }}
          />
        </View>

        {showLegend && (
          <>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                paddingHorizontal: 18,
                paddingVertical: 14,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: TW.bgSecondary,
                    marginRight: 6,
                  }}
                />
                <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "500" }}>
                  Range
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: TW.bgYellow,
                    marginRight: 6,
                  }}
                />
                <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "500" }}>
                  Selected
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      <MonthPickerModal
        visible={pickerVisible}
        selectedYear={pickerYear}
        selectedMonth={pickerMonth}
        setSelectedYear={setPickerYear}
        setSelectedMonth={setPickerMonth}
        onClose={() => setPickerVisible(false)}
        onConfirm={handleConfirmPicker}
      />
    </>
  );
}

export default SharedCalendar;
