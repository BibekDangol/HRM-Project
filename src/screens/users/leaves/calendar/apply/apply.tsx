import { BackButton } from "@/src/components/BackButton";
import {
  buildPeriodMarks,
  isBeforeOrEqual,
} from "@/src/components/Calendar/userCalendar";
import { SharedCalendar } from "@/src/components/SharedCalendar";
import { DateField } from "@/src/components/userLeave/DateField";
import { LeaveTypeDropdown } from "@/src/components/userLeave/LeaveTypeDropdown";
import { userLeaveSchema } from "@/src/schema/users/userLeaveApply.schema";
import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";
import {
  FormValues,
  LeaveTypeRow,
  LeaveTypeWithStats,
} from "@/src/types/userLeave";
import { buildAdminMarks } from "@/src/utils/adminCalendar";
import { calcLeaveDays, diffDaysInclusive } from "@/src/utils/leaveUtils";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFocusEffect, useRouter } from "expo-router";
import { Check, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

async function getOrganizationIdByUserId(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data?.organization_id ?? null;
}

const SECTION_LABEL = {
  fontSize: 11,
  fontWeight: "700" as const,
  color: "#94A3B8",
  letterSpacing: 0.9,
  textTransform: "uppercase" as const,
  marginBottom: 8,
};

const ERROR_TEXT = {
  marginTop: 5,
  fontSize: 12,
  color: "#EF4444",
  fontWeight: "500" as const,
};

export default function ApplyLeaveScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [selectedLeaveType, setSelectedLeaveType] = useState<number | null>(
    null,
  );
  const [leaveTypeError, setLeaveTypeError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeWithStats[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");
  const [dateError, setDateError] = useState("");

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedStart, setSelectedStart] = useState("");
  const [selectedEnd, setSelectedEnd] = useState("");
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);

  const [appliedDateRanges, setAppliedDateRanges] = useState<
    { start: string; end: string }[]
  >([]);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(userLeaveSchema),
    defaultValues: {
      reason: "",
      isHalfDay: false,
      halfSession: "morning",
    },
    mode: "onChange",
  });

  const isHalfDay = watch("isHalfDay");

  const selectedType = useMemo(() => {
    if (selectedLeaveType == null) return null;
    return leaveTypes.find((t) => t.id === selectedLeaveType) ?? null;
  }, [leaveTypes, selectedLeaveType]);

  useEffect(() => {
    if (isHalfDay && localStartDate) {
      setLocalEndDate(localStartDate);
    }
  }, [isHalfDay, localStartDate]);

  const computedDaysCount = useMemo(() => {
    if (!localStartDate || !localEndDate) return null;
    if (localStartDate > localEndDate) return null;
    if (localStartDate === localEndDate) return isHalfDay ? 0.5 : 1;
    const n = diffDaysInclusive(localStartDate, localEndDate);
    return n ?? null;
  }, [localStartDate, localEndDate, isHalfDay]);

  const openCalendar = () => {
    setSelectedStart(localStartDate || "");
    setSelectedEnd(isHalfDay ? localStartDate || "" : localEndDate || "");
    setCalendarVisible(true);
  };

  const adminMarks = buildAdminMarks(calYear, calMonth);
  const todayStr = new Date().toISOString().split("T")[0];

  const todayMark = {
    [todayStr]: {
      customStyles: {
        container: {
          borderWidth: 2,
          borderColor: "#FFB300",
          borderRadius: 8,
          backgroundColor: "transparent",
          width: 32,
          height: 32,
          alignItems: "center",
          justifyContent: "center",
        },
        text: { color: "#FFB300", fontWeight: "bold" as const },
      },
    },
  };

  let markedDates: Record<string, any>;

  if (selectedStart && selectedEnd) {
    const start = isBeforeOrEqual(selectedStart, selectedEnd)
      ? selectedStart
      : selectedEnd;
    const end = isBeforeOrEqual(selectedStart, selectedEnd)
      ? selectedEnd
      : selectedStart;
    markedDates = buildPeriodMarks(start, end);
  } else if (selectedStart && !selectedEnd) {
    markedDates = {
      ...adminMarks,
      ...todayMark,
      [selectedStart]: {
        customStyles: {
          container: {
            backgroundColor: "#FFB300",
            borderRadius: 999,
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
          },
          text: { color: "#fff", fontWeight: "bold" as const },
        },
      },
    };
  } else {
    markedDates = { ...adminMarks, ...todayMark };
  }

  const markingType = selectedStart && selectedEnd ? "period" : "custom";

  const isDateAlreadyApplied = useCallback(
    (dateStr: string) => {
      return appliedDateRanges.some(
        (range) => dateStr >= range.start && dateStr <= range.end,
      );
    },
    [appliedDateRanges],
  );

  const hasRangeOverlap = useCallback(
    (start: string, end: string) => {
      return appliedDateRanges.some(
        (range) => start <= range.end && end >= range.start,
      );
    },
    [appliedDateRanges],
  );

  const onDayPress = (day: { dateString: string }) => {
    const dateStr = day.dateString;

    if (isDateAlreadyApplied(dateStr)) {
      Alert.alert(
        "Already Applied",
        "You already have a pending or approved leave on this date.",
      );
      return;
    }

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dateStr);
      setSelectedEnd("");
      return;
    }

    const finalStart = isBeforeOrEqual(selectedStart, dateStr)
      ? selectedStart
      : dateStr;
    const finalEnd = isBeforeOrEqual(selectedStart, dateStr)
      ? dateStr
      : selectedStart;

    if (hasRangeOverlap(finalStart, finalEnd)) {
      Alert.alert(
        "Overlap Detected",
        "Your selected date range overlaps with an existing leave.",
      );
      setSelectedStart("");
      setSelectedEnd("");
      return;
    }

    setSelectedStart(finalStart);
    setSelectedEnd(finalEnd);
    setLocalStartDate(finalStart);
    setLocalEndDate(finalEnd);
    setDateError("");
    setCalendarVisible(false);

    if (finalStart !== finalEnd) {
      setValue("isHalfDay", false, { shouldValidate: true });
      setValue("halfSession", "morning", { shouldValidate: true });
    }
  };

  const loadLeaveTypesWithStats = useCallback(async () => {
    try {
      if (!user?.id) return;

      setLoadingTypes(true);

      const { data: typeData, error: typeError } = await supabase
        .from("leave_types")
        .select("id,name,leave_limit")
        .order("name", { ascending: true });

      if (typeError) throw typeError;

      const baseTypes: LeaveTypeRow[] = (typeData ?? []).map((r: any) => ({
        id: Number(r.id),
        name: r.name ?? null,
        leave_limit: Number(r.leave_limit ?? 0),
      }));

      const now = new Date();
      const year = now.getFullYear();
      const from = `${year}-01-01`;
      const to = `${year}-12-31`;

      const { data: leavesData, error: leavesError } = await supabase
        .from("leaves")
        .select("leave_type_id,start_date,end_date,day_type,days_count,status")
        .eq("user_id", user.id)
        .gte("start_date", from)
        .lte("start_date", to);

      if (leavesError) throw leavesError;

      const ranges = (leavesData ?? [])
        .filter((l: any) =>
          ["approved", "pending"].includes(String(l.status).toLowerCase()),
        )
        .map((l: any) => ({ start: l.start_date, end: l.end_date }));

      setAppliedDateRanges(ranges);

      const approvedByType = new Map<number, number>();
      const pendingByType = new Map<number, number>();

      for (const l of (leavesData ?? []) as any[]) {
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
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadLeaveTypesWithStats();
    }, [loadLeaveTypesWithStats]),
  );

  useEffect(() => {
    if (!selectedType) return;
    if (computedDaysCount == null) return;
    if (!localStartDate || !localEndDate) return;

    if (computedDaysCount > selectedType.remaining) {
      Alert.alert(
        "Leave limit exceeded",
        `You selected ${computedDaysCount} day(s) but only ${selectedType.remaining} day(s) remaining for "${selectedType.name ?? "this leave type"}".`,
      );
      setLocalEndDate(localStartDate);
      setValue("isHalfDay", false, { shouldValidate: true });
      setValue("halfSession", "morning", { shouldValidate: true });
    }
  }, [selectedType, computedDaysCount, localStartDate, localEndDate, setValue]);

  const handleLeaveTypeChange = (id: number | null) => {
    setSelectedLeaveType(id);
    if (id != null) setLeaveTypeError("");
  };

  const validateManualFields = (): boolean => {
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
  };

  const onSubmit = async (values: FormValues) => {
    if (validateManualFields()) return;

    if (hasRangeOverlap(localStartDate, localEndDate)) {
      Alert.alert(
        "Overlap Detected",
        "Your selected dates overlap with an existing pending or approved leave.",
      );
      return;
    }

    const daysCount = computedDaysCount;
    if (daysCount == null) {
      setDateError("Could not calculate days. Please re-pick dates.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Not signed in", "Please sign in again.");
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
      localStartDate === localEndDate
        ? values.halfSession === "morning"
          ? "MORNING"
          : values.halfSession === "evening"
            ? "EVENING"
            : "FULL"
        : "FULL";

    try {
      setSubmitting(true);

      const organizationId = await getOrganizationIdByUserId(user.id);
      if (!organizationId) {
        Alert.alert("Error", "Organization ID not found.");
        return;
      }

      const { error } = await supabase.from("leaves").insert([
        {
          user_id: user.id,
          organization_id: organizationId,
          reason: values.reason.trim(),
          leave_type_id: selectedLeaveType,
          start_date: localStartDate,
          end_date: localEndDate,
          day_type: dayType,
          days_count: daysCount,
          status: "pending",
          action_taken_by: null,
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Leave applied successfully.");
      router.replace("/(users)/leaves/(tabs)");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to submit leave.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPress = async () => {
    const manualHasError = validateManualFields();
    await trigger();
    if (!manualHasError) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <>
      <Modal
        visible={calendarVisible}
        animationType="none"
        transparent
        onRequestClose={() => setCalendarVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
          onPress={() => setCalendarVisible(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "#ffffff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingBottom: Platform.OS === "ios" ? 44 : 32,
            }}
          >
            <View
              style={{ alignItems: "center", paddingTop: 14, marginBottom: 4 }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#E2E8F0",
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 12,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: TW.bgSecondary,
                    letterSpacing: -0.3,
                  }}
                >
                  Select Date
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 12,
                    color: "#94A3B8",
                  }}
                >
                  {selectedStart && !selectedEnd
                    ? "Tap again to set end date"
                    : "Tap once for start, again for end"}
                </Text>
              </View>

              <Pressable
                onPress={() => setCalendarVisible(false)}
                style={({ pressed }) => ({
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F1F5F9",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <X size={15} color={TW.bgSecondary} strokeWidth={2.5} />
              </Pressable>
            </View>

            <SharedCalendar
              year={calYear}
              month={calMonth}
              markedDates={markedDates}
              markingType={markingType}
              onDayPress={onDayPress}
              onMonthChange={(m: { year: number; month: number }) => {
                setCalYear(m.year);
                setCalMonth(m.month);
                setSelectedEnd("");
              }}
              showLegend={true}
            />

            <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: TW.bgSecondary,
                }}
              >
                Selected: {selectedStart || "-"}
                {selectedEnd ? ` → ${selectedEnd}` : ""}
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={24}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableAutomaticScroll
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 32,
          }}
        >
          <BackButton
            color={TW.bgSecondary}
            backgroundColor="rgba(27,74,90,0.08)"
            style={{ marginBottom: 16 }}
            onPress={() => router.replace("/(users)/leaves/(tabs)")}
          />

          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: TW.bgSecondary,
                letterSpacing: -0.4,
              }}
            >
              New Leave Request
            </Text>
            <Text
              style={{
                marginTop: 3,
                fontSize: 13,
                color: "#94A3B8",
                fontWeight: "400",
              }}
            >
              Fill in the details to submit a leave request
            </Text>
          </View>

          {/* Leave Type */}
          <View style={{ marginBottom: 20 }}>
            <Text style={SECTION_LABEL}>Leave Type</Text>
            <LeaveTypeDropdown
              value={selectedLeaveType}
              onChange={handleLeaveTypeChange}
              leaveTypes={leaveTypes}
              loading={loadingTypes}
              onRefresh={loadLeaveTypesWithStats}
            />
            {!!leaveTypeError && (
              <Text style={ERROR_TEXT}>{leaveTypeError}</Text>
            )}
          </View>

          {/* Duration */}
          <View style={{ marginBottom: 20 }}>
            <Text style={SECTION_LABEL}>Duration</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <DateField
                  label="Start Date"
                  value={localStartDate}
                  onPress={openCalendar}
                />
              </View>

              {!isHalfDay && (
                <View style={{ flex: 1 }}>
                  <DateField
                    label="End Date"
                    value={localEndDate}
                    onPress={openCalendar}
                  />
                </View>
              )}
            </View>
            {!!dateError && <Text style={ERROR_TEXT}>{dateError}</Text>}
          </View>

          {/* Day Option */}
          <View style={{ marginBottom: 20 }}>
            <Text style={SECTION_LABEL}>Day Option</Text>
            <Controller
              control={control}
              name="isHalfDay"
              render={({ field: { value, onChange } }) => (
                <Pressable
                  onPress={() => {
                    if (
                      localStartDate &&
                      localEndDate &&
                      localStartDate !== localEndDate
                    ) {
                      setLocalEndDate(localStartDate);
                      onChange(true);
                      setValue("halfSession", "morning", {
                        shouldValidate: true,
                      });
                      return;
                    }

                    const next = !value;
                    onChange(next);

                    if (next) {
                      setValue("halfSession", "morning", {
                        shouldValidate: true,
                      });
                      if (localStartDate) setLocalEndDate(localStartDate);
                    }
                  }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: value ? TW.bgSecondary : "#E2E8F0",
                    backgroundColor: "#ffffff",
                    alignSelf: "flex-start",
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: value ? TW.bgSecondary : "#CBD5E1",
                      backgroundColor: value ? TW.bgSecondary : "#ffffff",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {value ? (
                      <Check color="#ffffff" size={12} strokeWidth={3} />
                    ) : null}
                  </View>

                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: TW.bgSecondary,
                    }}
                  >
                    Half Day
                  </Text>
                </Pressable>
              )}
            />

            {isHalfDay && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ ...SECTION_LABEL, marginBottom: 8 }}>
                  Session
                </Text>
                <Controller
                  control={control}
                  name="halfSession"
                  render={({ field: { value, onChange } }) => (
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      {(["morning", "evening"] as const).map((session) => (
                        <Pressable
                          key={session}
                          onPress={() => onChange(session)}
                          style={({ pressed }) => ({
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 12,
                            borderWidth: 1.5,
                            borderColor:
                              value === session ? TW.bgSecondary : "#E2E8F0",
                            backgroundColor:
                              value === session ? TW.bgSecondary : "#ffffff",
                            alignItems: "center",
                            opacity: pressed ? 0.85 : 1,
                          })}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color:
                                value === session ? "#ffffff" : TW.bgSecondary,
                            }}
                          >
                            {session.charAt(0).toUpperCase() + session.slice(1)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                />
              </View>
            )}
          </View>

          {/* Reason */}
          <View style={{ marginBottom: 20 }}>
            <Text style={SECTION_LABEL}>Reason / Description</Text>
            <Controller
              control={control}
              name="reason"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter reason for leave..."
                  placeholderTextColor="#CBD5E1"
                  multiline
                  textAlignVertical="top"
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 13,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: errors.reason ? "#EF4444" : "#E2E8F0",
                    color: TW.bgSecondary,
                    fontSize: 14,
                    lineHeight: 22,
                    minHeight: 120,
                    backgroundColor: "#ffffff",
                  }}
                />
              )}
            />
            {!!errors.reason?.message && (
              <Text style={ERROR_TEXT}>{errors.reason.message}</Text>
            )}
          </View>

          {/* Actions */}
          <View style={{ marginTop: 12, flexDirection: "row", gap: 12 }}>
            <Pressable
              disabled={submitting}
              onPress={() => router.replace("/(users)/leaves/(tabs)")}
              style={({ pressed }) => ({
                flex: 1,
                borderWidth: 1.5,
                borderColor: "#CBD5E1",
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: "center",
                backgroundColor: "#ffffff",
                opacity: pressed || submitting ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#64748B",
                }}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              disabled={submitting}
              onPress={handleSubmitPress}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: TW.bgSecondary,
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: "center",
                opacity: submitting ? 0.55 : pressed ? 0.8 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#ffffff",
                }}
              >
                {submitting ? "Submitting..." : "Submit"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </>
  );
}
