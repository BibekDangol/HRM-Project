import { colors } from "@/theme/colors";
import type { BottomTabNavigationOptions } from "expo-router/build/react-navigation/bottom-tabs";

export function getTabScreenOptions() {
  return {
    headerShown: false,
    sceneStyle: {
      backgroundColor: colors.canvas,
    },
  } satisfies BottomTabNavigationOptions;
}
