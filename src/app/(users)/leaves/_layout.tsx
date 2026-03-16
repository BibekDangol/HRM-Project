import { Stack } from "expo-router";

export default function LeavesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="calendar/index" />
      <Stack.Screen name="calendar/apply/index" />
    </Stack>
  );
}
