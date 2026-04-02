import * as Linking from "expo-linking";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../supabase/supabaseClient";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";

export default function Layout() {
  const { restoreSession } = useAuthStore();
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      const hash = url.split("#")[1];
      if (!hash) return;
      const params = Object.fromEntries(
        hash.split("&").map((param) => param.split("=")),
      );
      if (params.access_token && params.refresh_token) {
        await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
      }
    };
    restoreSession();
    const subscription = Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });
    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
