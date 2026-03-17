import { Text, View } from "react-native";
import tw from "twrnc";

import { useCalendarStore, getMonthStats } from "../../utils/adminCalendar";
import { StatPill } from "./StatPill";

interface Props {
  year: number;
  month: number;
}

export function MonthStats({ year, month }: Props) {
  const store = useCalendarStore();
  const stats = getMonthStats(year, month);

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
          count={stats.publicHolidays} // ✅ was stats.holidays
          color={store.colors.publicHoliday}
        />

        <StatPill
          label="Off Days"
          count={stats.weekends}
          color={store.colors.weekend}
        />

        <StatPill
          label="Work Days"
          count={stats.officeDays} // ✅ was stats.office
          color={store.colors.officeDay}
        />

        <StatPill
          label="Events"
          count={stats.totalEvents} // ✅ was stats.events
          color="#6366F1"
        />
      </View>
    </View>
  );
}
