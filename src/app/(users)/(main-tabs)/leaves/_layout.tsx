import { colors } from "@/theme/colors";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function LeavesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="editLeave" />
      <Stack.Screen name="calendar/index" />
      <Stack.Screen
        name="calendar/applyLeave/index"
        options={Platform.OS === "ios" ? {
          animation: "simple_push",
          animationDuration: 180,
        } : undefined}
      />
    </Stack>
  );
}
