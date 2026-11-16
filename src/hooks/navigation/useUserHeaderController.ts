import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";

import type { HeaderMenu } from "@/src/hooks/useHeaderMenu";
import { useIsRootTab } from "./useIsRootTab";

type Params = {
  pathname: string;
  router: any;
  menu: HeaderMenu;
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
  const [checkOpen, setCheckOpen] = useState(false);

  const isRootTab = useIsRootTab({
    pathname,
    rootPaths: USER_ROOT_TAB_PATHS,
  });

  const showBackButton = !isRootTab;

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
    menu.close();
  }, [menu]);

  const onLogout = useCallback(async () => {
    closeAllMenus();
    await menu.logout();
  }, [closeAllMenus, menu]);

  const handleCheckTrigger = useCallback(() => {
    if (att.isLocked) return;
    menu.close();
    setCheckOpen((v) => !v);
  }, [att.isLocked, menu]);

  const handleProfilePress = useCallback(() => {
    menu.close();
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
