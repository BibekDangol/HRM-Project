import { useCallback, useEffect } from "react";
import { BackHandler } from "react-native";

import type { HeaderMenu } from "@/src/hooks/useHeaderMenu";
import { useIsRootTab } from "./useIsRootTab";

type Params = {
  pathname: string;
  router: any;
  menu: HeaderMenu;
  isLocked: boolean;
};

const ADMIN_ROOT_TAB_PATHS = [
  "/(admin)/(main-tabs)/dashboard",
  "/dashboard",
  "/(admin)/(main-tabs)/manage-users",
  "/manage-users",
  "/(admin)/(main-tabs)/more",
  "/more",
  "/(admin)/(main-tabs)/leave",
  "/leave",
  "/(admin)/profile",
  "/profile",
];

const ADMIN_HOME_PATHS = ["/(admin)/(main-tabs)/dashboard", "/dashboard"];

const ADMIN_MAIN_TABS_THAT_SHOULD_GO_HOME = [
  "/(admin)/(main-tabs)/manage-users",
  "/manage-users",
  "/(admin)/(main-tabs)/more",
  "/more",
  "/(admin)/(main-tabs)/leave",
  "/leave",
  "/(admin)/profile",
  "/profile",
  "/(admin)/holidays",
  "/holidays",
];

export function useAdminHeaderController({
  pathname,
  router,
  menu,
  isLocked,
}: Params) {
  const isRootTab = useIsRootTab({
    pathname,
    rootPaths: ADMIN_ROOT_TAB_PATHS,
  });

  const showBackButton = !isRootTab;

  const handleBackPress = useCallback(() => {
    // Main tab screens should always go to dashboard
    if (ADMIN_MAIN_TABS_THAT_SHOULD_GO_HOME.includes(pathname)) {
      router.replace("/(admin)/(main-tabs)/dashboard");
      return true;
    }

    // Already on dashboard -> allow Android to exit app
    if (ADMIN_HOME_PATHS.includes(pathname)) {
      return false;
    }

    // Inner screens -> normal back
    if (router.canGoBack()) {
      router.back();
      return true;
    }

    // Fallback
    router.replace("/(admin)/(main-tabs)/dashboard");
    return true;
  }, [pathname, router]);

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
    currentUserProfile: menu.currentUserProfile,
    showBackButton,
    handleBackPress,
    handleProfileTrigger,
    handleProfileClose,
    handleProfilePress,
  };
}
