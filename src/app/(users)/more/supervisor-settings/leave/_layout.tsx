import { Stack } from "expo-router";

export default function LeaveLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Leave Requests",
        }}
      />
      <Stack.Screen
        name="pending-details"
        options={{
          title: "Leave Details",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="approved-details"
        options={{
          title: "Approval Details",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="rejected-details"
        options={{
          title: "Rejected Details",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
