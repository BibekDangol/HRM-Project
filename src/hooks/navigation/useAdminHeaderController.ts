import { useCallback, useEffect } from "react";
import { BackHandler } from "react-native";

import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { useIsRootTab } from "./useIsRootTab";

type Params = {
  pathname: string;
  router: any;
  menu: {
    open: boolean;
    toggle: () => void;
    close: () => void;
    logout: () => void;
  };
  isLocked: boolean;
};

const ADMIN_ROOT_TAB_PATHS = [
  "/(admin)/dashboard",
  "/dashboard",
  "/(admin)/manage-users",
  "/manage-users",
  "/(admin)/more",
  "/more",
  "/(admin)/leave",
  "/leave",
  "/(admin)/profile",
  "/profile",
];

export function useAdminHeaderController({
  pathname,
  router,
  menu,
  isLocked,
}: Params) {
  const { user } = useAuthStore();
  const { currentUserProfile, setCurrentUserProfile } = useUsersStore();

  const isRootTab = useIsRootTab({
    pathname,
    rootPaths: ADMIN_ROOT_TAB_PATHS,
  });

  const showBackButton = !isRootTab;

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id || currentUserProfile) return;

    const profile = await fetchCurrentUserProfleService(user.id);
    setCurrentUserProfile(profile);
  }, [user?.id, currentUserProfile, setCurrentUserProfile]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return true;
    }

    if (!isRootTab) {
      router.replace("/(admin)/dashboard");
      return true;
    }

    return false;
  }, [router, isRootTab]);

  useEffect(() => {
    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );
    return () => sub.remove();
  }, [handleBackPress]);

  const handleProfileTrigger = useCallback(() => {
    if (isLocked) return;
    menu.toggle();
  }, [isLocked, menu]);

  const handleProfileClose = useCallback(() => {
    menu.close();
  }, [menu]);

  const handleProfilePress = useCallback(() => {
    menu.close();
    router.push("/(admin)/profile");
  }, [menu, router]);

  return {
    currentUserProfile,
    showBackButton,
    handleBackPress,
    handleProfileTrigger,
    handleProfileClose,
    handleProfilePress,
  };
}