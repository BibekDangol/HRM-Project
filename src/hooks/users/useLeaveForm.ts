import { colors } from "@/theme/colors";
import {
  CreateLeaveInput,
  calculateLeaveDays,
  createLeaveRequest,
  fetchLeaveById,
  fetchUserLeavesByYear,
  updateLeaveRequest,
} from "@/src/services/leave.service";
import {
  FormValues,
  LeaveTypeRow,
  LeaveTypeWithStats,
} from "@/src/types/userLeave";
import { calcLeaveDays } from "@/src/utils/leaveUtils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert, AppState } from "react-native";
import { fetchLeaveTypesService } from "@/src/services/leave.type.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { userLeaveSchema } from "@/src/schema/users/userLeaveApply.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { TW } from "@/theme/twStyles";

function getDateParts(dateStr?: string) {
  if (!dateStr) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export type UseLeaveFormOptions = {
  leaveId?: string;
  onSuccess?: () => void;
};

export function useLeaveForm(options: UseLeaveFormOptions = {}) {
  const { leaveId, onSuccess } = options;
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const { currentUserProfile } = useUsersStore();
  const orgId = currentUserProfile?.organization_id;

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [screenLoading, setScreenLoading] = useState(Boolean(leaveId));
  const [submitting, setSubmitting] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [selectedLeaveType, setSelectedLeaveType] = useState<number | null>(null);
  const [leaveTypeError, setLeaveTypeError] = useState("");

  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");
  const [dateError, setDateError] = useState("");

  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeWithStats[]>([]);
  const [appliedDateRanges, setAppliedDateRanges] = useState<
    { start: string; end: string }[]
  >([]);

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<"start" | "end" | null>(null);

  const initialParts = useMemo(() => getDateParts(), []);
  const [calYear, setCalYear] = useState(initialParts.year);
  const [calMonth, setCalMonth] = useState(initialParts.month);

  const form = useForm<FormValues>({
    resolver: zodResolver(userLeaveSchema),
    defaultValues: {
      reason: "",
      isHalfDay: false,
      halfSession: "first_shift",
    },
    mode: "all",
  });

  const { control, handleSubmit, setValue, trigger, reset, formState: { errors } } = form;
  const isHalfDay = useWatch({ control, name: "isHalfDay" }) ?? false;

  const selectedType = useMemo(() => {
    if (selectedLeaveType == null) return null;
    return leaveTypes.find((t) => t.id === selectedLeaveType) ?? null;
  }, [leaveTypes, selectedLeaveType]);

  const dayCountKey = JSON.stringify([orgId, localStartDate, localEndDate, isHalfDay]);
  const [dayCount, setDayCount] = useState<{ key: string; days: number | null; error?: string } | null>(null);
  const hasDateRange = orgId != null && !!localStartDate && !!localEndDate && localStartDate <= localEndDate;
  const computedDaysCount = dayCount?.key === dayCountKey ? dayCount.days : null;
  const calculatingDays = hasDateRange && dayCount?.key !== dayCountKey;
  const calculationError = dayCount?.key === dayCountKey ? dayCount.error : undefined;

  useEffect(() => {
    if (!hasDateRange || orgId == null) return;
    let active = true;
    let requestId = 0;
    const refresh = () => {
      const id = ++requestId;
      calculateLeaveDays(orgId, localStartDate, localEndDate, isHalfDay && localStartDate === localEndDate ? "FIRST_SHIFT" : "FULL")
        .then(days => { if (active && id === requestId) setDayCount({ key: dayCountKey, days }); })
        .catch(() => {
          if (active && id === requestId) setDayCount({ key: dayCountKey, days: null, error: "Could not calculate working days. Choose your dates again to retry." });
        });
    };
    refresh();
    const subscription = AppState.addEventListener("change", state => { if (state === "active") refresh(); });
    return () => { active = false; subscription.remove(); };
  }, [orgId, localStartDate, localEndDate, isHalfDay, hasDateRange, dayCountKey, calendarVisible]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    if (localStartDate) {
      marks[localStartDate] = {
        customStyles: {
          container: { backgroundColor: TW.bgSecondary },
          text: { color: colors.surface, fontWeight: "700" },
        },
      };
    }
    if (localEndDate && localEndDate !== localStartDate) {
      marks[localEndDate] = {
        customStyles: {
          container: { backgroundColor: TW.bgSecondary },
          text: { color: colors.surface, fontWeight: "700" },
        },
      };
    }
    return marks;
  }, [localStartDate, localEndDate]);

  // Load leave types and past leaves for manual refresh
  const loadLeaveTypesWithStats = useCallback(async () => {
    if (!userId || !orgId) return;

    try {
      setLoadingTypes(true);
      const [typeData, leavesData] = await Promise.all([
        fetchLeaveTypesService(orgId),
        fetchUserLeavesByYear(
          userId,
          `${new Date().getFullYear()}-01-01`,
          `${new Date().getFullYear()}-12-31`,
        ),
      ]);

      const baseTypes: LeaveTypeRow[] = (typeData ?? []).map((r: any) => ({
        id: Number(r.id),
        name: r.name ?? null,
        leave_limit: Number(r.leave_limit ?? 0),
      }));

      const otherLeaves = leaveId
        ? (leavesData ?? []).filter((l: any) => String(l.id) !== String(leaveId))
        : leavesData ?? [];

      const ranges = otherLeaves
        .filter((l: any) =>
          ["approved", "pending"].includes(String(l.status).toLowerCase()),
        )
        .map((l: any) => ({ start: l.start_date, end: l.end_date }));

      setAppliedDateRanges(ranges);

      const approvedByType = new Map<number, number>();
      const pendingByType = new Map<number, number>();

      for (const l of otherLeaves as any[]) {
        const typeId = Number(l.leave_type_id);
        const days = calcLeaveDays(l);
        const st = String(l.status ?? "").toLowerCase();

        if (st === "approved") {
          approvedByType.set(typeId, (approvedByType.get(typeId) ?? 0) + days);
        } else if (st === "pending") {
          pendingByType.set(typeId, (pendingByType.get(typeId) ?? 0) + days);
        }
      }

      const merged: LeaveTypeWithStats[] = baseTypes.map((t) => {
        const approvedUsed = +(approvedByType.get(t.id) ?? 0);
        const pending = +(pendingByType.get(t.id) ?? 0);
        const remaining = +(t.leave_limit - approvedUsed - pending);
        return { ...t, approvedUsed, pending, remaining };
      });

      setLeaveTypes(merged);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load leave types.");
    } finally {
      setLoadingTypes(false);
    }
  }, [userId, orgId, leaveId]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") void loadLeaveTypesWithStats();
    });
    return () => subscription.remove();
  }, [loadLeaveTypesWithStats]);

  // Initial load via Promise.then
  useEffect(() => {
    if (!userId || !orgId) return;

    let cancelled = false;

    Promise.all([
      fetchLeaveTypesService(orgId),
      fetchUserLeavesByYear(
        userId,
        `${new Date().getFullYear()}-01-01`,
        `${new Date().getFullYear()}-12-31`,
      ),
    ])
      .then(([typeData, leavesData]) => {
        if (cancelled) return;

        const baseTypes: LeaveTypeRow[] = (typeData ?? []).map((r: any) => ({
          id: Number(r.id),
          name: r.name ?? null,
          leave_limit: Number(r.leave_limit ?? 0),
        }));

        const otherLeaves = leaveId
          ? (leavesData ?? []).filter((l: any) => String(l.id) !== String(leaveId))
          : leavesData ?? [];

        const ranges = otherLeaves
          .filter((l: any) =>
            ["approved", "pending"].includes(String(l.status).toLowerCase()),
          )
          .map((l: any) => ({ start: l.start_date, end: l.end_date }));

        setAppliedDateRanges(ranges);

        const approvedByType = new Map<number, number>();
        const pendingByType = new Map<number, number>();

        for (const l of otherLeaves as any[]) {
          const typeId = Number(l.leave_type_id);
          const days = calcLeaveDays(l);
          const st = String(l.status ?? "").toLowerCase();

          if (st === "approved") {
            approvedByType.set(typeId, (approvedByType.get(typeId) ?? 0) + days);
          } else if (st === "pending") {
            pendingByType.set(typeId, (pendingByType.get(typeId) ?? 0) + days);
          }
        }

        const merged: LeaveTypeWithStats[] = baseTypes.map((t) => {
          const approvedUsed = +(approvedByType.get(t.id) ?? 0);
          const pending = +(pendingByType.get(t.id) ?? 0);
          const remaining = +(t.leave_limit - approvedUsed - pending);
          return { ...t, approvedUsed, pending, remaining };
        });

        setLeaveTypes(merged);
      })
      .catch((e: any) => {
        if (cancelled) return;
        Alert.alert("Error", e?.message ?? "Failed to load leave types.");
      });

    return () => {
      cancelled = true;
    };
  }, [userId, orgId, leaveId]);

  // Prepopulate if editing
  useEffect(() => {
    if (!leaveId) return;

    let cancelled = false;

    fetchLeaveById(leaveId)
      .then((existing) => {
        if (cancelled || !existing) return;
        setSelectedLeaveType(existing.leave_type_id ?? null);
        setLocalStartDate(existing.start_date || "");
        setLocalEndDate(existing.end_date || "");

        const isHalf = existing.days_count === 0.5 || existing.day_type === "FIRST_SHIFT" || existing.day_type === "SECOND_SHIFT";
        const session =
          existing.day_type === "SECOND_SHIFT" ? "second_shift" : "first_shift";

        reset({
          reason: existing.reason || "",
          isHalfDay: isHalf,
          halfSession: session,
        });
        setScreenLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        Alert.alert("Error", err?.message ?? "Failed to load leave for editing.");
        setScreenLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [leaveId, reset]);

  // Sync end date when half-day is checked
  const handleHalfDayChange = useCallback(
    (halfDayActive: boolean) => {
      if (halfDayActive && localStartDate) {
        setLocalEndDate(localStartDate);
      }
    },
    [localStartDate],
  );

  const openCalendar = useCallback(
    (field: "start" | "end") => {
      setActiveDateField(field);
      const sourceDate =
        field === "start"
          ? localStartDate || localEndDate
          : localEndDate || localStartDate;

      const parts = getDateParts(sourceDate);
      setCalYear(parts.year);
      setCalMonth(parts.month);
      setCalendarVisible(true);
    },
    [localStartDate, localEndDate],
  );

  const closeCalendar = useCallback(() => {
    setCalendarVisible(false);
    setActiveDateField(null);
  }, []);

  const isDateAlreadyApplied = useCallback(
    (dateStr: string) =>
      appliedDateRanges.some(
        (range) => dateStr >= range.start && dateStr <= range.end,
      ),
    [appliedDateRanges],
  );

  const hasRangeOverlap = useCallback(
    (start: string, end: string) =>
      appliedDateRanges.some(
        (range) => start <= range.end && end >= range.start,
      ),
    [appliedDateRanges],
  );

  const onDayPress = useCallback(
    (day: { dateString: string }) => {
      const selectedDate = day.dateString;
      if (selectedDate < todayStr) return;

      if (isDateAlreadyApplied(selectedDate)) {
        Alert.alert(
          "Already Applied",
          "You already have a pending or approved leave on this date.",
        );
        return;
      }

      if (activeDateField === "start") {
        setLocalStartDate(selectedDate);
        if (isHalfDay) {
          setLocalEndDate(selectedDate);
        } else if (!localEndDate || selectedDate > localEndDate) {
          setLocalEndDate(selectedDate);
        }
        setDateError("");
        closeCalendar();
        return;
      }

      if (activeDateField === "end") {
        if (localStartDate && selectedDate < localStartDate) {
          setDateError("End date must be after start date");
          return;
        }

        if (localStartDate && hasRangeOverlap(localStartDate, selectedDate)) {
          Alert.alert(
            "Overlap Detected",
            "Your selected date range overlaps with an existing leave.",
          );
          return;
        }

        setLocalEndDate(selectedDate);
        setDateError("");
        closeCalendar();
      }
    },
    [
      todayStr,
      isDateAlreadyApplied,
      activeDateField,
      isHalfDay,
      localEndDate,
      closeCalendar,
      localStartDate,
      hasRangeOverlap,
    ],
  );

  const handleLeaveTypeChange = useCallback((id: number | null) => {
    setSelectedLeaveType(id);
    if (id != null) setLeaveTypeError("");
  }, []);

  const validateManualFields = useCallback((): boolean => {
    let hasError = false;

    if (selectedLeaveType == null) {
      setLeaveTypeError("Leave type is required");
      hasError = true;
    } else {
      setLeaveTypeError("");
    }

    if (!localStartDate || !localEndDate) {
      setDateError("Start and end date are required");
      hasError = true;
    } else if (localStartDate > localEndDate) {
      setDateError("End date must be after start date");
      hasError = true;
    } else {
      setDateError("");
    }

    return hasError;
  }, [selectedLeaveType, localStartDate, localEndDate]);

  const submitLeave = useCallback(
    async (values: FormValues) => {
      if (validateManualFields()) return;

      if (hasRangeOverlap(localStartDate, localEndDate)) {
        Alert.alert(
          "Overlap Detected",
          "Your selected dates overlap with an existing pending or approved leave.",
        );
        return;
      }

      const daysCount = computedDaysCount;
      if (daysCount == null || daysCount <= 0) {
        setDateError(daysCount === 0 ? "Choose at least one working day. Weekends and holidays do not use leave." : "Wait for the working-day calculation, or choose your dates again to retry.");
        return;
      }

      if (!userId || !orgId) {
        Alert.alert("Error", "User or organization profile not found.");
        return;
      }

      const type = leaveTypes.find((t) => t.id === selectedLeaveType);
      if (type && daysCount > type.remaining) {
        Alert.alert(
          "Leave limit exceeded",
          `You selected ${daysCount} day(s) but only ${type.remaining} remaining.`,
        );
        return;
      }

      const dayType =
        isHalfDay && localStartDate === localEndDate
          ? values.halfSession === "second_shift"
            ? "SECOND_SHIFT"
            : "FIRST_SHIFT"
          : "FULL";

      try {
        setSubmitting(true);

        if (leaveId) {
          await updateLeaveRequest(leaveId, userId, {
            leave_type_id: selectedLeaveType,
            start_date: localStartDate,
            end_date: localEndDate,
            day_type: dayType,
            days_count: daysCount,
            reason: values.reason.trim(),
            status: "pending",
          });
          Alert.alert("Success", "Leave updated successfully.");
        } else {
          const payload: CreateLeaveInput = {
            user_id: userId,
            organization_id: orgId,
            leave_type_id: selectedLeaveType,
            start_date: localStartDate,
            end_date: localEndDate,
            day_type: dayType,
            days_count: daysCount,
            reason: values.reason.trim(),
            status: "pending",
          };
          await createLeaveRequest(payload);
          Alert.alert("Success", "Leave applied successfully.");
        }

        onSuccess?.();
      } catch (e: any) {
        Alert.alert(
          "Error",
          e?.message ?? `Failed to ${leaveId ? "update" : "submit"} leave.`,
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      validateManualFields,
      hasRangeOverlap,
      localStartDate,
      localEndDate,
      computedDaysCount,
      userId,
      orgId,
      leaveTypes,
      selectedLeaveType,
      isHalfDay,
      leaveId,
      onSuccess,
    ],
  );

  const handleSubmitPress = useCallback(async () => {
    const manualHasError = validateManualFields();
    const isValid = await trigger();
    if (!manualHasError && isValid) {
      handleSubmit(submitLeave)();
    }
  }, [validateManualFields, trigger, handleSubmit, submitLeave]);

  return {
    form,
    control,
    errors,
    setValue,
    isHalfDay,
    selectedLeaveType,
    leaveTypeError,
    leaveTypes,
    loadingTypes,
    localStartDate,
    localEndDate,
    dateError: dateError || calculationError || (computedDaysCount === 0 ? "These dates contain no working days." : ""),
    calculatingDays,
    submitting,
    screenLoading,
    calendarVisible,
    calYear,
    calMonth,
    markedDates,
    todayStr,
    computedDaysCount,
    selectedType,
    setCalYear,
    setCalMonth,
    handleLeaveTypeChange,
    handleHalfDayChange,
    loadLeaveTypesWithStats,
    openCalendar,
    closeCalendar,
    onDayPress,
    handleSubmitPress,
  };
}

export default useLeaveForm;
