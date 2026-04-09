import React from "react";

import { adminTabs } from "@/src/config/adminTabs";

import BaseTabBar from "./BaseTabBar";

type Props = any & {
  closeAllOverlays?: () => void;
};

export default function AdminTabBar({
  closeAllOverlays,
  ...props
}: Props) {
  return (
    <BaseTabBar
      {...props}
      tabs={adminTabs}
      mode="pill"
      routeGroup="(admin)"
      activeColor="#1B4A5A"
      inactiveColor="#8A94A6"
      closeAllOverlays={closeAllOverlays}
    />
  );
}