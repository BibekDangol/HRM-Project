import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { BackButton } from "@/src/components/BackButton";
import { CalendarHeader } from "@/src/components/Calendar/CalendarHeader";
import { DayCell } from "@/src/components/Calendar/DayCell";
import { HolidayRangeModal } from "@/src/components/Calendar/HolidayRangeModal";
import { SharedCalendar } from "@/src/components/SharedCalendar";
import useAdminCalendarActions from "@/src/hooks/admin/useAdminCalendarActions";
import useAdminCalendarMarks from "@/src/hooks/admin/useAdminCalendarMarks";
import useCalendarRange from "@/src/hooks/admin/useCalendarRange";
import { TW } from "@/theme/twStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

interface Props {
  currentUserId: string;
  currentOrgId: string;
}

function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export default function AdminCalendarScreen({
  currentUserId,
  currentOrgId,
}: Props) {
  const { month: initialMonth, year: initialYear } = getCurrentMonthYear();

  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [showSettings, setShowSettings] = useState(false);

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
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`px-4 pt-3`}>
        <BackButton />
      </View>

      <CalendarHeader onSettingsPress={() => setShowSettings(true)} />

      {/* Calendar */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedCalendar
          year={year}
          month={month}
          markedDates={markedDates}
          markingType="period"
          onDayPress={(day) => handleDayPress(day.dateString)}
          onMonthChange={(m: { year: number; month: number }) => {
            setYear(m.year);
            setMonth(m.month);
          }}
          dayComponent={({ date, state, marking }: any) => {
            if (!date) return null;

            return (
              <DayCell
                date={date}
                state={state}
                marking={marking}
                onPress={() => handleDayPress(date.dateString)}
              />
            );
          }}
          showLegend={true}
        />

        {/* Range helper */}
        {rangeStart && !rangeEnd && (
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: "rgba(27,74,90,0.08)",
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            <Text
              style={{
                color: TW.bgSecondary,
                fontSize: 13,
                fontWeight: "500",
              }}>
              Start: {rangeStart} — tap an end date
            </Text>

            <TouchableOpacity onPress={clearRange}>
              <Text style={{ color: "#EF4444", fontSize: 13 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <HolidayRangeModal
        visible={showModal}
        startDate={rangeStart ?? ""}
        endDate={rangeEnd ?? ""}
        onClose={clearRange}
        onConfirm={handleRangeConfirm}
      />

      {/* Settings (disabled for now) */}
      {/* <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      /> */}
    </SafeAreaView>
  );
}
