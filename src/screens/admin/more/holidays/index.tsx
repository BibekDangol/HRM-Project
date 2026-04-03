import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { DayCell } from "@/src/components/Calendar/DayCell";
import { HolidayRangeModal } from "@/src/components/Calendar/HolidayRangeModal";
import { SharedCalendar } from "@/src/components/SharedCalendar";
import useAdminCalendarActions from "@/src/hooks/admin/useAdminCalendarActions";
import useAdminCalendarMarks from "@/src/hooks/admin/useAdminCalendarMarks";
import useCalendarRange from "@/src/hooks/admin/useCalendarRange";
import { TW } from "@/theme/twStyles";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

interface Props {
  currentUserId: string;
  currentOrgId: string;
}

export default function AdminCalendarScreen({
  currentUserId,
  currentOrgId,
}: Props) {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth() + 1);

  const { rangeStart, rangeEnd, showModal, handleDayPress, clearRange } =
    useCalendarRange();

  const { saveRange } = useAdminCalendarActions();

  const markedDates = useAdminCalendarMarks(year, month, rangeStart, rangeEnd);

  const handleRangeConfirm = async (
    type: "holiday" | "event",
    label: string,
    color?: string,
  ): Promise<void> => {
    await saveRange({
      rangeStart,
      rangeEnd,
      type,
      label,
      color,
    });

    clearRange();
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedCalendar
          year={year}
          month={month}
          markedDates={markedDates}
          markingType="period"
          onDayPress={(d) => handleDayPress(d.dateString)}
          onMonthChange={(m) => {
            setYear(m.year);
            setMonth(m.month);
          }}
          dayComponent={({ date, state, marking }: any) => (
            <DayCell
              date={date}
              state={state}
              marking={marking}
              onPress={() => handleDayPress(date.dateString)}
            />
          )}
        />

        {rangeStart && !rangeEnd && (
          <View
            style={{
              margin: 16,
              padding: 12,
              backgroundColor: "rgba(27,74,90,0.08)",
              borderRadius: 12,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: TW.bgSecondary }}>
              Start: {rangeStart} — tap end date
            </Text>

            <TouchableOpacity onPress={clearRange}>
              <Text style={{ color: "#EF4444" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <HolidayRangeModal
        visible={showModal}
        startDate={rangeStart ?? ""}
        endDate={rangeEnd ?? ""}
        onClose={clearRange}
        onConfirm={handleRangeConfirm}
      />
    </SafeAreaView>
  );
}
