import * as Linking from "expo-linking";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as NativeSplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/useAuthStore";
import { supabase } from "../supabase/supabaseClient";

void NativeSplashScreen.preventAutoHideAsync().catch(console.warn);

export default function Layout() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    if (!isRestoringSession) {
      void NativeSplashScreen.hideAsync().catch(console.warn);
    }
  }, [isRestoringSession]);

  useEffect(() => {
    let active = true;
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
    void restoreSession().finally(() => {
      if (active) setIsRestoringSession(false);
    });
    const subscription = Linking.addEventListener("url", handleDeepLink);
    void Linking.getInitialURL().then((url) => {
      if (active && url) return handleDeepLink({ url });
    }).catch(console.warn);
    return () => {
      active = false;
      subscription.remove();
    };
  }, [restoreSession]);

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
        <Toast position="top" topOffset={60} />
      </GestureHandlerRootView>
    </>
  );
}
