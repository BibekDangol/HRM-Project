import {
  AttendanceProvider,
  useAttendanceContext,
} from "@/src/context/AttendanceContext";
import { useAdminHeaderMenu } from "@/src/hooks/useAdminHeaderMenu";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { getErrorMessage } from "@/src/utils/attendanceHelper";
import { TW } from "@/theme/twStyles";
import { Tabs, usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { MyTabBar } from "../tabBar";
import HeaderRight from "./components/HeaderRight";
import ReasonModel from "./components/ReasonModel";

// ── This component reads context directly so it ALWAYS re-renders on state change ──
function HeaderRightWrapper({
  checkOpen,
  isProfileMenuOpen,
  onCheckInAndOut,
  onLogout,
  onProfileClick,
  onToggleCheck,
  onProfileMenuClick,
}: {
  checkOpen: boolean;
  isProfileMenuOpen: boolean;
  onCheckInAndOut: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onToggleCheck: () => void;
  onProfileMenuClick: () => void;
}) {
  // ← Subscribes to context directly — re-renders instantly on check-in/out
  const { isCheckedIn, isLocked, checkedInAt, elapsedMs } =
    useAttendanceContext();

  return (
    <HeaderRight
      isCheckOpen={checkOpen}
      isProfileMenuOpen={isProfileMenuOpen}
      onCheckInAndOut={onCheckInAndOut}
      onLogout={onLogout}
      onProfileClick={onProfileClick}
      onToggleCheck={onToggleCheck}
      onProfileMenuClick={onProfileMenuClick}
      isCheckedIn={isCheckedIn}
      isLocked={isLocked}
      checkedInAt={checkedInAt}
      elapsedMs={elapsedMs}
    />
  );
}

function LayoutInner() {
  const att = useAttendanceContext();
  const router = useRouter();
  const pathname = usePathname();
  const signOut = useAuthStore((s) => s.signOut);
  const [checkOpen, setCheckOpen] = useState(false);
  const menu = useAdminHeaderMenu();
  const { setUserProfile } = useUsersStore();

  useEffect(() => {
    const loadCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const profile = await fetchCurrentUserProfleService(user.id);
      setUserProfile(profile);
    };
    loadCurrentUser();
  }, [setUserProfile]);

  const closeAllMenus = useCallback(() => {
    setCheckOpen(false);
    menu.close?.();
  }, [menu]);

  const onLogout = async () => {
    try {
      closeAllMenus();
      await signOut();
      router.replace("/(auth)/login");
    } catch (e: unknown) {
      Alert.alert("Logout failed", getErrorMessage(e));
    }
  };

  const handleCheckInAndOut = useCallback(() => {
    if (att.isLocked) return;
    menu.close?.();
    setCheckOpen((v) => !v);
  }, [att.isLocked, menu]);

  const handleProfileMenu = useCallback(() => {
    menu.close?.();
    router.push("/(users)/profile");
  }, [menu, router]);

  const handleProfileClick = useCallback(() => {
    if (att.isLocked) return;
    setCheckOpen(false);
    menu.toggle();
  }, [att.isLocked, menu]);

  const handleToggleCheck = useCallback(async () => {
    await att.onToggleCheck();
    setCheckOpen(false);
  }, [att]);

  return (
    <>
      <ReasonModel
        commentModalOpen={att.commentModalOpen}
        isLocked={att.isLocked}
        onModalClose={att.handleReasonModalClose}
        onSubmitComment={att.submitComment}
        commentMode={att.commentMode ?? ""}
        commentText={att.commentText}
        onReasonModalCancel={att.handleReasonModalCancel}
        setCommentText={att.setCommentText}
      />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",
          sceneStyle: {
            backgroundColor: pathname?.includes("/profile")
              ? TW.bgSecondary
              : "#ffffff",
          },
          headerStyle: {
            backgroundColor: TW.bgSecondary,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            height: 100,
          },
          headerTitleStyle: {
            color: "#ffffff",
            fontWeight: "bold",
            fontSize: 16,
            paddingBottom: 8,
          },
          headerShadowVisible: false,
          // ← HeaderRightWrapper reads context itself, bypasses stale closure
          headerRight: () => (
            <HeaderRightWrapper
              checkOpen={checkOpen}
              isProfileMenuOpen={menu.open}
              onCheckInAndOut={handleCheckInAndOut}
              onLogout={onLogout}
              onProfileClick={handleProfileClick}
              onToggleCheck={handleToggleCheck}
              onProfileMenuClick={handleProfileMenu}
            />
          ),
        }}
        tabBar={(props) => <MyTabBar {...props} />}
      >
        <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="leaves" options={{ title: "Leaves" }} />
        <Tabs.Screen name="profile/index" options={{ title: "Profile" }} />
        <Tabs.Screen name="more" options={{ title: "Settings" }} />
        <Tabs.Screen
          name="holidays"
          options={{ title: "Holidays and Events" }}
        />
        <Tabs.Screen
          name="activity-log"
          options={{ title: "Recent Activity" }}
        />
      </Tabs>
    </>
  );
}

export default function UsersTabsLayout() {
  return (
    <AttendanceProvider>
      <LayoutInner />
    </AttendanceProvider>
  );
}
