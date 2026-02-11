import { Stack } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function Layout() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  useEffect(() => {
    const init = async () => {
      await restoreSession();
    };
    init();
  }, []);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen
        name="/dashboard"
        options={{
          headerShown: true,
          title: "",
        }}
      /> */}
    </Stack>
  );
}
