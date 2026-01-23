import AppNavigator from "@/src/navigation/AppNavigator";
import { Stack } from "expo-router";

export default function Index() {
  return (
    <>
      <AppNavigator />
      <Stack.Screen options={{ headerShown: false }} />
    </>
  );
}