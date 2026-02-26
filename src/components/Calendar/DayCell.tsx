import React from "react";
import { Pressable, Text, View } from "react-native";
import tw from "twrnc";
import { calendarStore, useCalendarStore } from "@/src/utils/adminCalendar";
import { TODAY } from "@/src/constants/adminCalendar";

interface Props {
  date?: {
    dateString: string;
    day: number;
  };
  state?: string;
  marking?: {
    color?: string;
    textColor?: string;
    startingDay?: boolean;
    endingDay?: boolean;
  };
  onPress: (dateString: string) => void;
}

export function DayCell({ date, state, marking, onPress }: Props) {
  const store = useCalendarStore();

  if (!date) return <View style={{ width: 36, height: 44 }} />;

  const { dateString, day } = date;
  const type = calendarStore.getDayType(dateString);
  const dayColor =
    type === "publicHoliday"
      ? store.colors.publicHoliday
      : type === "weekend"
        ? store.colors.weekend
        : store.colors.officeDay;

  const cfg = store.days[dateString];
  const hasHoliday = !!cfg?.holidayLabel;
  const events = cfg?.events ?? [];
  const isToday = dateString === TODAY;
  const isDisabled = state === "disabled";

  // ── Range selection state from marking ──────────────────────────
  const isRangeSelected = !!marking?.color && marking.color !== "transparent";
  const isRangeStart = isRangeSelected && marking?.startingDay;
  const isRangeEnd = isRangeSelected && marking?.endingDay;
  const isRangeMid = isRangeSelected && !isRangeStart && !isRangeEnd;
  const rangeColor = marking?.color ?? store.colors.publicHoliday;
  // ────────────────────────────────────────────────────────────────

  const dots = [
    ...(hasHoliday ? [{ id: "holiday", color: store.colors.publicHoliday }] : []),
    ...events.map((ev) => ({ id: ev.id, color: ev.color })),
  ].slice(0, 4);

  return (
    <Pressable
      disabled={isDisabled}
      onPress={() => onPress(dateString)}
      hitSlop={6}
      style={({ pressed }) => [
        { alignItems: "center", width: 36 },
        pressed && !isDisabled && tw`opacity-70`,
      ]}
    >
      {/* ── Range background strip (mid days) ── */}
      {isRangeMid && (
        <View
          style={{
            position: "absolute",
            top: 4,
            left: 0,
            right: 0,
            height: 32,
            backgroundColor: rangeColor + "30",
          }}
        />
      )}

      {/* ── Range start/end half-strip ── */}
      {(isRangeStart || isRangeEnd) && (
        <View
          style={{
            position: "absolute",
            top: 4,
            left: isRangeStart ? "50%" : 0,
            right: isRangeEnd ? "50%" : 0,
            height: 32,
            backgroundColor: rangeColor + "30",
          }}
        />
      )}

      <View style={{ paddingVertical: 4 }}>
        <View
          style={[
            tw`w-8 h-8 rounded-lg items-center justify-center`,

            // ── Today: border only, no fill ──
            isToday && !isRangeSelected && {
              borderWidth: 2,
              borderColor: "#6366F1",
              backgroundColor: "transparent",
            },

            // ── Range start/end: filled circle ──
            isRangeSelected && {
              backgroundColor: rangeColor,
              borderRadius: 8,
            },

            // ── Normal day type background (not in range, not today) ──
            !isRangeSelected && !isToday && type !== "officeDay" && {
              backgroundColor: dayColor + "30",
            },
          ]}
        >
          <Text
            style={[
              tw`text-sm`,
              {
                fontWeight: type !== "officeDay" ? "700" : "500",
                color: isDisabled
                  ? "#d1d5db"
                  : isRangeSelected
                    ? "white"                          // white text in range
                    : isToday
                      ? "#6366F1"                      // indigo text for today
                      : type !== "officeDay"
                        ? dayColor
                        : "#0f172a",
              },
            ]}
          >
            {day}
          </Text>
        </View>

        {dots.length > 0 && !isDisabled && (
          <View style={tw`flex-row gap-0.5 mt-0.5 justify-center`}>
            {dots.map((dot) => (
              <View
                key={dot.id}
                style={[tw`w-1 h-1 rounded-full`, { backgroundColor: dot.color }]}
              />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}