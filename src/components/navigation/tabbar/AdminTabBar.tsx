import React from "react";

import { adminTabs } from "@/src/config/adminTabs";

import BaseTabBar from "./BaseTabBar";

export default function AdminTabBar(props: any) {
  return (
    <BaseTabBar
      {...props}
      tabs={adminTabs}
      mode="pill"
      routeGroup="(admin)"
      activeColor="#1B4A5A"
      inactiveColor="#8A94A6"
    />
  );
}
