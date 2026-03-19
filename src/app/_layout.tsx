import * as Linking from "expo-linking";

import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase } from "../supabase/supabaseClient";

export default function Layout() {
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log("Deep link received:", event.url);
      const url = event.url;
      console.log("This is check in layout url cha kinai bhanera", url);
      const hash = url.split("#")[1];
      if (!hash) return;
      const params = Object.fromEntries(
        hash.split("&").map((param) => param.split("=")),
      );
      if (params.access_token && params.refresh_token) {
        console.log(
          "This is layout check, if access token cha kinai",
          params.access_token,
        );
        await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
      }
    };
    const subscription = Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });
    return () => subscription.remove();
  }, []);
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
