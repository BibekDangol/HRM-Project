import { colors } from "@/theme/colors";
import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="supervisor-settings"
        options={{
          title: "supervisor settings",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
