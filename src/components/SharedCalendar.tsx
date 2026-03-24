import { DayCell } from "@/src/components/Calendar/DayCell";
import { TW } from "@/theme/twStyles";
import { View, Text } from "react-native";
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

const todayStr = new Date().toISOString().split("T")[0];

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

      const isPast = date.dateString < todayStr;

      // ✅ Saturday = 6, Sunday = 0
      const dayOfWeek = new Date(date.dateString).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // ✅ Grey out only past NON-weekend days — no tap
      if (isPast && !isWeekend) {
        return (
          <View
            style={{
              width: 32,
              height: 32,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#94a3b8",
                // opacity: 0.4,
              }}
            >
              {date.day}
            </Text>
          </View>
        );
      }
      return (
        <DayCell
          date={date}
          state={state}
          marking={marking}
          onPress={
            isPast ? () => {} : (dateString) => onDayPress({ dateString })
          }
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
