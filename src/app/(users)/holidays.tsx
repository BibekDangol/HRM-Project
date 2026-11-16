import { colors } from "@/theme/colors";
import HolidaysEventsScreen from "@/src/components/Holidays";
import React from "react";
import { View } from "react-native";

export default function holidays() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* <BackButton floating /> */}
      <HolidaysEventsScreen />
    </View>
  );
}
