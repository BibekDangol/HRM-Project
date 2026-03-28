import HolidaysEventsScreen from "@/src/components/Holidays";
import React from "react";
import { View } from "react-native";

export default function holidays() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* <BackButton floating /> */}
      <HolidaysEventsScreen />
    </View>
  );
}
