import {
  checkInService,
  checkOutService,
  fetchLatestAttendanceService,
  getOpenAttendanceService,
} from "@/src/services/users/attendance.service";
import {
  getAttendanceStatus,
  getErrorMessage,
  needsCheckInCommentNepal,
  needsCheckOutCommentNepal,
  parseDate,
} from "@/src/utils/attendanceHelper";
import { useCallback, useEffect, useState } from "react";

import { useAttendanceNotifications } from "@/src/hooks/users/useAttendanceNotifications";
import { AttendanceRow } from "@/src/types/attendance";
import { Alert } from "react-native";
import { useAuthStore } from "../../store/useAuthStore";

export const useAttendanceToggle = () => {
  const { attendanceRules } = useAttendanceNotifications();

  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceRow | null>(null);
  const [checkedInAt, setCheckedInAt] = useState<Date | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const { user } = useAuthStore();
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentMode, setCommentMode] = useState<"checkin" | "checkout" | null>(
    null,
  );

  const status = getAttendanceStatus(attendance);
  const isCheckedIn = status === "incomplete";
  const elapsedMs = checkedInAt ? now - checkedInAt.getTime() : 0;
  const isLocked = loadingAttendance;

  useEffect(() => {
    if (!checkedInAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [checkedInAt]);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Start the loading indicator for this external data fetch.
    fetchLatestAttendance();
  }, [fetchLatestAttendance]);

  const submitComment = useCallback(async () => {
    const comment = commentText.trim();
    if (!commentMode || !comment) {
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
    } catch (err) {
      Alert.alert("Action failed", getErrorMessage(err));
      fetchLatestAttendance();
    } finally {
      setLoadingAttendance(false);
    }
  }, [commentText, commentMode, checkIn, checkOut, fetchLatestAttendance]);

  const onToggleCheck = useCallback(async () => {
    if (isLocked) return;
    try {
      if (!user) throw new Error("Not authenticated.");
      if (!isCheckedIn) {
        const anyOpen = await getOpenAttendanceService(user.id);
        if (anyOpen?.status === "incomplete") {
          Alert.alert(
            "Already checked in",
            `You still have an open session from ${anyOpen.date}. Please check out first.`,
          );
          return;
        }
        if (attendanceRules && needsCheckInCommentNepal(attendanceRules)) {
          setCommentMode("checkin");
          setCommentText("");
          setCommentModalOpen(true);
          return;
        }
        setLoadingAttendance(true);
        await checkIn();
        return;
      }

      if (attendanceRules && needsCheckOutCommentNepal(attendanceRules)) {
        setCommentMode("checkout");
        setCommentText("");
        setCommentModalOpen(true);
        return;
      }
      setLoadingAttendance(true);
      await checkOut();
    } catch (err) {
      Alert.alert("Check action failed", getErrorMessage(err));
      fetchLatestAttendance();
    } finally {
      setLoadingAttendance(false);
    }
  }, [
    user,
    isLocked,
    isCheckedIn,
    checkIn,
    checkOut,
    fetchLatestAttendance,
    attendanceRules,
  ]);

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

  return {
    // state
    isLocked,
    isCheckedIn,
    elapsedMs,
    checkedInAt,
    attendance,
    // comment modal
    commentModalOpen,
    commentText,
    commentMode,
    setCommentText,
    // actions
    onToggleCheck,
    submitComment,
    handleReasonModalClose,
    handleReasonModalCancel,
    fetchLatestAttendance,
  };
};
