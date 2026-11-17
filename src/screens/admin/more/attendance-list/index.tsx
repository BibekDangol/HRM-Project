import React from "react";
import { useRouter } from "expo-router";

import UserDirectoryList from "@/src/screens/admin/components/UserDirectoryList";
import { UserProfile } from "@/src/types/admin";

export default function AttendanceUserList() {
  const router = useRouter();

  const handleUserPress = (user: UserProfile) => {
    router.navigate({
      pathname: "/(admin)/(main-tabs)/more/attendance-list/attendance-details",
      params: {
        userId: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
      },
    });
  };

  return (
    <UserDirectoryList
      mode="admin-attendance"
      onUserPress={handleUserPress}
      onBack={() => router.back()}
      searchPlaceholder="Search employees..."
    />
  );
}