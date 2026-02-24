import React from "react";
import { Text, View } from "react-native";
import tw from "twrnc";

import { useCalendarStore } from "@/src/utils/adminCalendar";
import { StatPill } from "./adminCalendar";

interface Stats {
  holidays: number;
  weekends: number;
  office: number;
  events: number;
}

interface Props {
  stats: Stats;
}

export function MonthStats({ stats }: Props) {
  const store = useCalendarStore();

  return (
    <View style={tw`mx-4 mb-4`}>
      <Text
        style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest mb-2`}
      >
        This Month
      </Text>
      <View style={tw`flex-row gap-2`}>
        <StatPill
          label="Holidays"
          count={stats.holidays}
          color={store.colors.publicHoliday}
        />
        <StatPill
          label="Off Days"
          count={stats.weekends}
          color={store.colors.weekend}
        />
        <StatPill
          label="Work Days"
          count={stats.office}
          color={store.colors.officeDay}
        />
        <StatPill label="Events" count={stats.events} color="#6366F1" />
      </View>
    </View>
  );
}
