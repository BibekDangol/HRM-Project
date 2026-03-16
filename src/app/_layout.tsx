import { Stack } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { supabase } from "../supabase/supabaseClient";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    const init = async () => {
      // Restore persisted session
      await restoreSession();

      const { data: listener } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session) {
            await restoreSession();
          } else {
            useAuthStore.setState({
              session: null,
              user: null,
              role: "user",
              loading: false,
            });
          }
        },
      );

      return () => listener.subscription.unsubscribe();
    };

    init();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
