import React from "react";

import { userTabs } from "@/src/config/userTabs";

import BaseTabBar from "./BaseTabBar";

type Props = any & {
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
      activeColor="#1B4A5A"
      inactiveColor="#8A94A6"
      closeAllOverlays={closeAllOverlays}
    />
  );
}