import { Tabs, usePathname, useRouter } from "expo-router";
import {
  checkInService,
  checkOutService,
  fetchLatestAttendanceService,
  getAttendanceRulesService,
  getOpenAttendanceService,
} from "@/src/services/attendance.service";
import {
  getAttendanceStatus,
  getErrorMessage,
  needsCheckInCommentNepal,
  needsCheckOutCommentNepal,
  parseDate,
} from "@/src/utils/attendanceHelper";
import { useCallback, useEffect, useState } from "react";

import { Alert } from "react-native";
import { AttendanceRow } from "@/src/types/attendance";
import HeaderRight from "./components/HeaderRight";
import { MyTabBar } from "../tabBar";
import ReasonModel from "./components/ReasonModel";
import { TW } from "@/theme/twStyles";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { supabase } from "@/src/supabase/supabaseClient";
import { useAdminHeaderMenu } from "@/src/hooks/useAdminHeaderMenu";
import { useAttendanceNotifications } from "@/src/hooks/useAttendanceNotifications";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";

export default function UsersTabsLayout() {
  const { attendanceRules } = useAttendanceNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const signOut = useAuthStore((s) => s.signOut);

  const [checkOpen, setCheckOpen] = useState(false);
  const menu = useAdminHeaderMenu();

  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceRow | null>(null);

  const [checkedInAt, setCheckedInAt] = useState<Date | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentMode, setCommentMode] = useState<"checkin" | "checkout" | null>(
    null,
  );

  const status = getAttendanceStatus(attendance);
  const isCheckedIn = status === "incomplete";
  const elapsedMs = checkedInAt ? now - checkedInAt.getTime() : 0;

  // Single disabled flag — drives every button/input in the UI
  const isLocked = loadingAttendance;

  useEffect(() => {
    if (!checkedInAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [checkedInAt]);

  const closeAllMenus = useCallback(() => {
    setCheckOpen(false);
    menu.close?.();
  }, [menu]);

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

  const fetchLatestAttendance = useCallback(async () => {
    try {
      setLoadingAttendance(true);

      const { row, checkedInAt } = await fetchLatestAttendanceService();

      setAttendance(row);
      setCheckedInAt(checkedInAt);
    } catch (err) {
      Alert.alert("Attendance fetch failed", getErrorMessage(err));
    } finally {
      setLoadingAttendance(false);
    }
  }, []);
  const checkIn = useCallback(async (comment?: string) => {
    const row = await checkInService(comment);
    setAttendance(row);
    setCheckedInAt(parseDate(row.check_in_time));
  }, []);
  const checkOut = useCallback(async (comment?: string) => {
    const row = await checkOutService(comment);
    setAttendance(row);
    setCheckedInAt(null);
  }, []);

  useEffect(() => {
    getAttendanceRulesService();
    fetchLatestAttendance();
  }, [fetchLatestAttendance]);

  const onLogout = async () => {
    try {
      closeAllMenus();
      await signOut();
      router.replace("/(auth)/login");
    } catch (e: unknown) {
      Alert.alert("Logout failed", getErrorMessage(e));
    }
  };

  const submitComment = useCallback(async () => {
    const comment = commentText.trim();
    if (!commentMode) return;
    if (!comment) {
      Alert.alert("Comment required", "Please enter a comment.");
      return;
    }
    try {
      setLoadingAttendance(true);
      if (commentMode === "checkin") await checkIn(comment);
      else await checkOut(comment);
      setCommentModalOpen(false);
      setCommentText("");
      setCommentMode(null);
      setCheckOpen(false);
    } catch (err: unknown) {
      Alert.alert("Action failed", getErrorMessage(err));
      fetchLatestAttendance();
    } finally {
      setLoadingAttendance(false);
    }
  }, [commentText, commentMode, checkIn, checkOut, fetchLatestAttendance]);

  const onToggleCheck = useCallback(async () => {
    if (isLocked) return;

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("Not authenticated.");
      const nowDate = new Date();

      if (!isCheckedIn) {
        const anyOpen = await getOpenAttendanceService(user.id);
        if (anyOpen?.status === "incomplete") {
          Alert.alert(
            "Already checked in",
            `You still have an open session from ${anyOpen.date}. Please check out first.`,
          );
          setCheckOpen(false);
          return;
        }

        if (needsCheckInCommentNepal(attendanceRules)) {
          setCommentMode("checkin");
          setCommentText("");
          setCommentModalOpen(true);
          return;
        }

        setLoadingAttendance(true);
        await checkIn();
        setCheckOpen(false);
        return;
      }

      if (needsCheckOutCommentNepal(attendanceRules)) {
        setCommentMode("checkout");
        setCommentText("");
        setCommentModalOpen(true);
        return;
      }

      setLoadingAttendance(true);
      await checkOut();
      setCheckOpen(false);
    } catch (err: unknown) {
      Alert.alert("Check action failed", getErrorMessage(err));
      fetchLatestAttendance();
    } finally {
      setLoadingAttendance(false);
    }
  }, [
    isLocked,
    isCheckedIn,
    checkIn,
    checkOut,
    fetchLatestAttendance,
    attendanceRules,
  ]);

  const handleCheckInAndOut = () => {
    if (isLocked) return;
    menu.close?.();
    setCheckOpen((v) => !v);
  };

  const handleProfileMenu = () => {
    menu.close?.();
    router.push("/(users)/profile");
  };

  const handleProfileClick = () => {
    if (isLocked) return;
    setCheckOpen(false);
    menu.toggle();
  };

  const handleReasonModalClose = () => {
    if (isLocked) return;
    setCommentModalOpen(false);
    setCommentText("");
    setCommentMode(null);
  };

  const handleReasonModalCancel = () => {
    setCommentModalOpen(false);
    setCommentText("");
    setCommentMode(null);
  };

  return (
    <>
      <ReasonModel
        commentModalOpen={commentModalOpen}
        isLocked={isLocked}
        onModalClose={handleReasonModalClose}
        onSubmitComment={submitComment}
        commentMode={commentMode ?? ""}
        commentText={commentText}
        onReasonModalCancel={handleReasonModalCancel}
        setCommentText={setCommentText}
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

          headerRight: () => (
            <HeaderRight
              isCheckOpen={checkOpen}
              elapsedMs={elapsedMs}
              isLocked={isLocked}
              checkedInAt={checkedInAt}
              isCheckedIn={isCheckedIn}
              isProfileMenuOpen={menu.open}
              onCheckInAndOut={handleCheckInAndOut}
              onLogout={onLogout}
              onProfileClick={handleProfileClick}
              onToggleCheck={onToggleCheck}
              onProfileMenuClick={handleProfileMenu}
            />
          ),
        }}
        tabBar={(props) => <MyTabBar {...props} />}>
        <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="leaves" options={{ title: "Leaves" }} />
        <Tabs.Screen name="profile/index" options={{ title: "Profile" }} />
        <Tabs.Screen name="more" options={{ title: "Settings" }} />
      </Tabs>
    </>
  );
}
