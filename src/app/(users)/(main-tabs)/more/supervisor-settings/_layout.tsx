import { colors } from "@/theme/colors";
import { Stack } from "expo-router";

const supervisor_layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="attendance-list/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="leave" options={{ headerShown: false }} />
      <Stack.Screen
        name="attendance-list/attendance-details"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default supervisor_layout;
