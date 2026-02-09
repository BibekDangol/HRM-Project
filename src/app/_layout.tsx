import { Stack } from "expo-router";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";

export default function Layout() {
  const restoreSession = useAuthStore(s => s.restoreSession);
  useEffect(() => {
    const init = async () => {
      await restoreSession();
    }
    init();
  }, []);
  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}
