import { colors } from "@/theme/colors";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";

import { userTabs } from "@/src/config/userTabs";

import BaseTabBar from "./BaseTabBar";

type Props = BottomTabBarProps & {
  closeAllOverlays?: () => void;
};

export default function UserTabBar({
  closeAllOverlays,
  ...props
}: Props) {
  return (
    <BaseTabBar
      {...props}
      tabs={userTabs}
      mode="pill"
      routeGroup="(users)"
      activeColor={colors.primary}
      inactiveColor={colors.subtle}
      closeAllOverlays={closeAllOverlays}
    />
  );
}