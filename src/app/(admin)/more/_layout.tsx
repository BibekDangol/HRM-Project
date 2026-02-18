import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "More",
        }}
      />
      <Stack.Screen
        name="attendance-list/index"
        options={{ headerShown: false, title: "Users" }}
      />
      <Stack.Screen
        name="attendance-list/attendance-details"
        options={{ headerShown: false, title: "Attendance Details" }}
      />
      <Stack.Screen
        name="settings/index"
        options={{ headerShown: false, title: "Settings" }}
      />
      <Stack.Screen
        name="settings/leave/add-leave-type"
        options={{ headerShown: false, title: "Add Leave Type" }}
      />
      <Stack.Screen
        name="holidays/index"
        options={{ headerShown: false, title: "Holiday" }}
      />
    </Stack>
  );
}
