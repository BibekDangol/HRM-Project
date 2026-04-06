import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { fetchUsersService } from "@/src/services/admin.service";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";

export function useDashboardUsers() {
  const { user } = useAuthStore();
  const { setUsers, setCurrentUserProfile, users, currentUserProfile } =
    useUsersStore();

  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingUsers(true);

      let profile = currentUserProfile;

      if (!profile) {
        profile = await fetchCurrentUserProfleService(user.id);
        setCurrentUserProfile(profile);
      }

      const res = await fetchUsersService(profile.organization_id);
      setUsers(res);
    } catch (err) {
      Alert.alert("Error", "Failed to load users or profile.");
    } finally {
      setLoadingUsers(false);
    }
  }, [user, currentUserProfile, setCurrentUserProfile, setUsers]);

  return {
    users,
    currentUserProfile,
    loadingUsers,
    loadUsers,
  };
}
