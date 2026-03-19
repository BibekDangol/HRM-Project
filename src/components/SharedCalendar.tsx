import { DayCell } from "@/src/components/Calendar/DayCell";
import { TW } from "@/theme/twStyles";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";
import tw from "twrnc";

interface SharedCalendarProps {
  year: number;
  month: number;
  markedDates: Record<string, any>;
  markingType?: "period" | "custom";
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange: (m: { year: number; month: number }) => void;
  dayComponent?: any;
  showLegend?: boolean;
}

export function SharedCalendar({
  year,
  month,
  markedDates,
  markingType = "custom",
  onDayPress,
  onMonthChange,
  dayComponent,
  showLegend = true,
}: SharedCalendarProps) {
  const resolvedDayComponent =
    dayComponent ??
    (({ date, state, marking }: any) => {
      if (!date) return null;
      return (
        <DayCell
          date={date}
          state={state}
          marking={marking}
          onPress={(dateString) => onDayPress({ dateString })}
        />
      );
    });

  return (
    <View style={tw`px-4`}>
      <View style={{ borderRadius: 20, overflow: "hidden" }}>
        <Calendar
          current={`${year}-${String(month).padStart(2, "0")}-01`}
          onDayPress={onDayPress}
          onMonthChange={onMonthChange}
          markingType={markingType as any}
          markedDates={markedDates}
          dayComponent={resolvedDayComponent}
          enableSwipeMonths
          theme={{
            backgroundColor: "white",
            calendarBackground: TW.bgSecondary,
            textSectionTitleColor: "#ffffff",
            monthTextColor: "#ffffff",
            arrowColor: "#FFB300",
            dayTextColor: "#ffffff",
            todayTextColor: "#FFB300",
            textDisabledColor: "#94a3b8",
            textMonthFontWeight: "700",
            textDayHeaderFontSize: 12,
          }}
        />
      </View>
    </View>
  );
}
