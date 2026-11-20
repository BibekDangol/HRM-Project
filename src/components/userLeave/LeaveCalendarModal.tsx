import React from "react";
import { Modal, Pressable, View } from "react-native";
import { SharedCalendar } from "@/src/components/SharedCalendar";
import tw from "@/theme/tw";
import { useCalendarSync } from "@/src/hooks/useCalendarSync";

export type LeaveCalendarModalProps = {
  visible: boolean;
  calYear: number;
  calMonth: number;
  markedDates: Record<string, any>;
  minDate?: string;
  onClose: () => void;
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange: (month: { year: number; month: number }) => void;
};

export function LeaveCalendarModal({
  visible,
  calYear,
  calMonth,
  markedDates,
  minDate,
  onClose,
  onDayPress,
  onMonthChange,
}: LeaveCalendarModalProps) {
  useCalendarSync(calYear, calMonth);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-black/25 justify-center items-center px-4`}>
        <Pressable style={tw`absolute inset-0`} onPress={onClose} />
        <SharedCalendar
          year={calYear}
          month={calMonth}
          markedDates={markedDates}
          markingType="custom"
          onDayPress={onDayPress}
          onMonthChange={onMonthChange}
          minDate={minDate}
        />
      </View>
    </Modal>
  );
}

export default LeaveCalendarModal;
