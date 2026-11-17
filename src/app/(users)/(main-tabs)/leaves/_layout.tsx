import { colors } from "@/theme/colors";
import { Stack } from "expo-router";

export default function LeavesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="editLeave" />
      <Stack.Screen name="calendar/index" />
      <Stack.Screen name="calendar/applyLeave/index" />
    </Stack>
  );
}
