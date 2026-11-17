import { colors } from "@/theme/colors";
import { Stack } from "expo-router";

export default function LeavesTabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
