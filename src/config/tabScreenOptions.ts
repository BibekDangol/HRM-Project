import type { BottomTabNavigationOptions } from "expo-router/build/react-navigation/bottom-tabs";

import { TW } from "@/theme/twStyles";

export function getTabScreenOptions(pathname: string) {
  return {
    headerShown: true,
    headerShadowVisible: false,
    headerTitleAlign: "center",
    headerTitleStyle: {
      color: "#ffffff",
      fontSize: 16,
    },
    headerStyle: {
      backgroundColor: TW.bgSecondary,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      height: 100,
    },
    sceneStyle: {
      backgroundColor: pathname.includes("/profile") ? TW.bgSecondary : "#ffffff",
    },
  } satisfies BottomTabNavigationOptions;
}
