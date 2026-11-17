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
          headerShown: false,
          title: "Pending",
        }}
      />

      <Stack.Screen
        name="approved-details"
        options={{
          headerShown: false,
          title: "Approval Details",
        }}
      />
      <Stack.Screen
        name="rejected-details"
        options={{
          headerShown: false,
          title: "Rejected Details",
        }}
      />
    </Stack>
  );
}
