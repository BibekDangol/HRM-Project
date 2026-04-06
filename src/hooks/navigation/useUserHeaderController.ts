import { useCallback, useEffect, useState } from "react";
import { Alert, BackHandler } from "react-native";

import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { getErrorMessage } from "@/src/utils/attendanceHelper";
import { useIsRootTab } from "./useIsRootTab";

type Params = {
  pathname: string;
  router: any;
  menu: {
    open: boolean;
    toggle: () => void;
    close?: () => void;
  };
  att: {
    isLocked: boolean;
    onToggleCheck: () => Promise<void> | void;
  };
};

const USER_ROOT_TAB_PATHS = [
  "/(users)/dashboard",
  "/dashboard",
  "/(users)/leaves",
  "/leaves",
  "/(users)/profile",
  "/profile",
  "/(users)/profile/index",
  "/profile/index",
  "/(users)/more",
  "/more",
];

export function useUserHeaderController({
  pathname,
  router,
  menu,
  att,
}: Params) {
  const signOut = useAuthStore((s) => s.signOut);
  const { setCurrentUserProfile } = useUsersStore();
  const [checkOpen, setCheckOpen] = useState(false);

  const isRootTab = useIsRootTab({
    pathname,
    rootPaths: USER_ROOT_TAB_PATHS,
  });

  const showBackButton = !isRootTab;

  useEffect(() => {
    const loadCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      const profile = await fetchCurrentUserProfleService(user.id);
      setCurrentUserProfile(profile);
    };

    loadCurrentUser();
  }, [setCurrentUserProfile]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return true;
    }

    if (!isRootTab) {
      router.replace("/(users)/dashboard");
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

  const closeAllMenus = useCallback(() => {
    setCheckOpen(false);
    menu.close?.();
  }, [menu]);

  const onLogout = useCallback(async () => {
    try {
      closeAllMenus();
      await signOut();
      router.replace("/(auth)/login");
    } catch (e: unknown) {
      Alert.alert("Logout failed", getErrorMessage(e));
    }
  }, [closeAllMenus, signOut, router]);

  const handleCheckTrigger = useCallback(() => {
    if (att.isLocked) return;
    menu.close?.();
    setCheckOpen((v) => !v);
  }, [att.isLocked, menu]);

  const handleProfilePress = useCallback(() => {
    menu.close?.();
    router.push("/(users)/profile");
  }, [menu, router]);

  const handleProfileTrigger = useCallback(() => {
    if (att.isLocked) return;
    setCheckOpen(false);
    menu.toggle();
  }, [att.isLocked, menu]);

  const handleToggleCheck = useCallback(async () => {
    await att.onToggleCheck();
    setCheckOpen(false);
  }, [att]);

  return {
    checkOpen,
    showBackButton,
    onLogout,
    handleBackPress,
    handleCheckTrigger,
    handleProfilePress,
    handleProfileTrigger,
    handleToggleCheck,
  };
}