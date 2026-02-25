import { Stack } from "expo-router";
import { supabase } from "../supabase/supabaseClient";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";

export default function Layout() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    const init = async () => {
      // 1️⃣ Restore persisted session on app start
      await restoreSession();

      // 2️⃣ Listen to future auth changes
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
            })
          }
        }
      );

      // 3️⃣ Cleanup listener on unmount
      return () => listener.subscription.unsubscribe();
    };

    init();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
