import { Stack } from "expo-router";

export default function LeaveLayout() {
  return (
    <Stack>
      <Stack.Screen name="index"
        options={{
          headerShown: true,
          title: "Leave Requests"
        }} />
      <Stack.Screen name="leave-details"
        options={{
          headerShown: true,
          title: "Leave Details"
        }} />
      <Stack.Screen name="leave-approved"
        options={{
          headerShown: true,
          title: "Approval"
        }} />
      <Stack.Screen name="approved-details"
        options={{
          headerShown: true,
          title: "Approval Details"
        }} />
    </Stack>
  )
}