import { useCallback, useState } from "react";

import { fetchUsersService } from "@/src/services/admin.service";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { Alert } from "react-native";

export function useDashboardUsers() {
  const { user } = useAuthStore();
  const { setUsers, setUserProfile, users, userProfile } = useUsersStore();
  console.log("userprofile ma k aaucha", userProfile);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingUsers(true);

      const profile = await fetchCurrentUserProfleService(user.id);
      setUserProfile(profile);

      const res = await fetchUsersService(profile.organization_id);
      setUsers(res);
    } catch (err) {
      Alert.alert("Error", "Failed to load users or profile.");
    } finally {
      setLoadingUsers(false);
    }
  }, [user]);

  return {
    users,
    userProfile,
    loadingUsers,
    loadUsers,
  };
}
