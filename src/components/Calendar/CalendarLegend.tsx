import { Circle } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import tw from "twrnc";
import { useCalendarStore } from "@/src/utils/adminCalendar";

const LEGEND_ITEMS = [
  ["publicHoliday", "Holiday"],
  ["weekend", "Off Day"],
  ["officeDay", "Work Day"],
] as const;

export function CalendarLegend() {
  const store = useCalendarStore();

  return (
    <View style={tw`flex-row gap-4 px-5 mb-3`}>
      {LEGEND_ITEMS.map(([key, label]) => (
        <View key={key} style={tw`flex-row items-center gap-1.5`}>
          <Circle color={store.colors[key]} fill={store.colors[key]} size={9} />
          <Text style={tw`text-xs text-slate-500`}>{label}</Text>
        </View>
      ))}
    </View>
  );
}
