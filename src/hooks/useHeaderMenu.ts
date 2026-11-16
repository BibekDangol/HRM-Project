import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export function useHeaderMenu() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const signOut = useAuthStore((s) => s.signOut);
  const currentUserProfile = useUsersStore((s) => s.currentUserProfile);
  const setCurrentUserProfile = useUsersStore((s) => s.setCurrentUserProfile);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId || currentUserProfile?.id === userId) return;

    let cancelled = false;
    fetchCurrentUserProfleService(userId)
      .then((profile) => {
        if (!cancelled && useAuthStore.getState().user?.id === userId) {
          setCurrentUserProfile(profile);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          Alert.alert("Profile unavailable", error instanceof Error ? error.message : "Please try again.");
        }
      });

    return () => { cancelled = true; };
  }, [userId, currentUserProfile?.id, setCurrentUserProfile]);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  const logout = async () => {
    setOpen(false);
    try {
      await signOut();
      useUsersStore.setState({
        currentUserProfile: null,
        selectedUserProfile: null,
        users: [],
        organizationName: "",
      });
      router.replace("/(auth)/login");
    } catch (error: unknown) {
      Alert.alert("Logout failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return {
    currentUserProfile: currentUserProfile?.id === userId ? currentUserProfile : null,
    open,
    toggle,
    close,
    logout,
  };
}

export type HeaderMenu = ReturnType<typeof useHeaderMenu>;
