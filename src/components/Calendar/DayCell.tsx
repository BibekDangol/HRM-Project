import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import { calendarStore, useCalendarStore } from "@/src/utils/adminCalendar";
import { TODAY } from "@/src/constants/adminCalendar";

interface Props {
  date?: {
    dateString: string;
    day: number;
  };
  state?: string;
  onPress: (dateString: string) => void;
}

export function DayCell({ date, state, onPress }: Props) {
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

  const dots = [
    ...(hasHoliday
      ? [{ id: "holiday", color: store.colors.publicHoliday }]
      : []),
    ...events.map((ev) => ({ id: ev.id, color: ev.color })),
  ].slice(0, 4);

  return (
    <Pressable
      disabled={isDisabled}
      onPress={() => onPress(dateString)}
      hitSlop={6}
      style={({ pressed }) => [
        { alignItems: "center", paddingVertical: 4, width: 36 },
        pressed && !isDisabled && tw`opacity-70`,
      ]}
    >
      <View
        style={[
          tw`w-8 h-8 rounded-lg items-center justify-center`,
          isToday && tw`border-2 border-indigo-500`,
          {
            backgroundColor: isDisabled
              ? "transparent"
              : type !== "officeDay"
                ? dayColor + "30"
                : isToday
                  ? "#EEF2FF"
                  : "transparent",
          },
        ]}
      >
        <Text
          style={[
            tw`text-sm`,
            { fontWeight: type !== "officeDay" ? "700" : "500" },
            {
              color: isDisabled
                ? "#d1d5db"
                : type !== "officeDay"
                  ? dayColor
                  : isToday
                    ? "#6366F1"
                    : "#0f172a",
            },
          ]}
        >
          {day}
        </Text>
      </View>

      {dots.length > 0 && !isDisabled && (
        <View style={tw`flex-row gap-0.5 mt-0.5`}>
          {dots.map((dot) => (
            <View
              key={dot.id}
              style={[tw`w-1 h-1 rounded-full`, { backgroundColor: dot.color }]}
            />
          ))}
        </View>
      )}
    </Pressable>
  );
}
