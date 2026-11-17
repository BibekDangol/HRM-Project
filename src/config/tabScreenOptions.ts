import { colors } from "@/theme/colors";
import type { BottomTabNavigationOptions } from "expo-router/build/react-navigation/bottom-tabs";

import { TW } from "@/theme/twStyles";

export function getTabScreenOptions(pathname: string) {
  return {
    headerShown: true,
    headerShadowVisible: false,
    headerTitleAlign: "center",
    headerTitleStyle: {
      color: colors.surface,
      fontSize: 16,
    },
    headerStyle: {
      backgroundColor: TW.bgSecondary,
      height: 100,
    },
    sceneStyle: {
      backgroundColor: pathname.includes("/profile") ? TW.bgSecondary : colors.canvas,
    },
  } satisfies BottomTabNavigationOptions;
}
