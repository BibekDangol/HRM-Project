import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: "More"
        }}
      />
      <Stack.Screen
        name="attendance-list/index"
        options={{ headerShown: true, title: "Users" }}
      />
      <Stack.Screen
        name="attendance-list/attendance-details"
        options={{ headerShown: true, title: "Attendance Details" }}
      />
    </Stack>
  );
}
