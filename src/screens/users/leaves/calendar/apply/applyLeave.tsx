import {
  FormValues,
  LeaveTypeRow,
  LeaveTypeWithStats,
} from "@/src/types/userLeave";
import { calcLeaveDays, diffDaysInclusive } from "@/src/utils/leaveUtils";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { BackButton } from "@/src/components/BackButton";
import { SharedCalendar } from "@/src/components/SharedCalendar";
import { DateField } from "@/src/components/userLeave/DateField";
import { LeaveTypeDropdown } from "@/src/components/userLeave/LeaveTypeDropdown";
import { userLeaveSchema } from "@/src/schema/users/userLeaveApply.schema";
import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import tw from "twrnc";

async function getOrganizationIdByUserId(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data?.organization_id ?? null;
}

const SPACING = {
  screenX: 20,
  top: 10,
  section: 16,
  labelBottom: 8,
  rowGap: 10,
  inputY: 12,
  inputX: 14,
  buttonY: 13,
};

const ERROR_TEXT = {
  marginTop: 6,
  fontSize: 12,
  color: "#EF4444",
  fontWeight: "500" as const,
};

type ActiveDateField = "start" | "end" | null;

function getDateParts(dateStr?: string) {
  if (!dateStr) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function ApplyLeaveScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const todayStr = new Date().toISOString().split("T")[0];

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
  const [activeDateField, setActiveDateField] = useState<ActiveDateField>(null);
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
      halfSession: "first_shift",
    },
    mode: "all",
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

    if (localStartDate === localEndDate) {
      return isHalfDay ? 0.5 : 1;
    }

    const n = diffDaysInclusive(localStartDate, localEndDate);
    return n ?? null;
  }, [localStartDate, localEndDate, isHalfDay]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    if (localStartDate) {
      marks[localStartDate] = {
        customStyles: {
          container: {
            backgroundColor: TW.bgSecondary,
          },
          text: {
            color: "#ffffff",
            fontWeight: "700",
          },
        },
      };
    }

    if (localEndDate && localEndDate !== localStartDate) {
      marks[localEndDate] = {
        customStyles: {
          container: {
            backgroundColor: TW.bgSecondary,
          },
          text: {
            color: "#ffffff",
            fontWeight: "700",
          },
        },
      };
    }

    return marks;
  }, [localStartDate, localEndDate]);

  const openCalendar = (field: "start" | "end") => {
    setActiveDateField(field);

    const sourceDate =
      field === "start"
        ? localStartDate || localEndDate
        : localEndDate || localStartDate;

    const parts = getDateParts(sourceDate);
    setCalYear(parts.year);
    setCalMonth(parts.month);
    setCalendarVisible(true);
  };

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

  const onDayPress = (day: { dateString: string }) => {
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
      setCalendarVisible(false);
      setActiveDateField(null);
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
      setCalendarVisible(false);
      setActiveDateField(null);
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

        return {
          ...t,
          approvedUsed,
          pending,
          remaining,
        };
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
      setValue("halfSession", "first_shift", { shouldValidate: true });
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
      isHalfDay && localStartDate === localEndDate
        ? values.halfSession === "second_shift"
          ? "second_shift"
          : "first_shift"
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
    <View style={tw`flex-1 bg-white`}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableAutomaticScroll
        contentContainerStyle={{
          paddingHorizontal: SPACING.screenX,
          paddingTop: SPACING.top,
          paddingBottom: 36,
        }}>
        <BackButton
          color={TW.bgSecondary}
          backgroundColor="rgba(27,74,90,0.08)"
          style={{ marginBottom: 18 }}
          onPress={() => router.replace("/(users)/leaves/(tabs)")}
        />

        <View style={tw`mb-7`}>
          <Text style={[tw`text-2xl font-bold`, { color: TW.bgSecondary }]}>
            New Leave Request
          </Text>
          <Text style={tw`mt-1.5 text-[13px] text-slate-400`}>
            Fill in the details to submit a leave request
          </Text>
        </View>

        <View style={{ marginBottom: SPACING.section }}>
          <Text
            style={[
              tw`text-base font-semibold`,
              { color: TW.bgSecondary, marginBottom: SPACING.labelBottom },
            ]}>
            Leave Type
          </Text>

          <LeaveTypeDropdown
            value={selectedLeaveType}
            onChange={handleLeaveTypeChange}
            leaveTypes={leaveTypes}
            loading={loadingTypes}
            onRefresh={loadLeaveTypesWithStats}
          />

          {!!leaveTypeError && <Text style={ERROR_TEXT}>{leaveTypeError}</Text>}
        </View>

        <View>
          <Text
            style={[
              tw`text-base font-semibold`,
              { color: TW.bgSecondary, marginBottom: SPACING.labelBottom },
            ]}>
            Duration
          </Text>

          <View style={{ flexDirection: "row", gap: SPACING.rowGap }}>
            <View style={tw`flex-1`}>
              <DateField
                label="Start Date"
                value={localStartDate || "Select start date"}
                onPress={() => openCalendar("start")}
              />
            </View>

            {!isHalfDay && (
              <View style={tw`flex-1`}>
                <DateField
                  label="End Date"
                  value={localEndDate || "Select end date"}
                  onPress={() => openCalendar("end")}
                />
              </View>
            )}
          </View>

          {!!dateError && <Text style={ERROR_TEXT}>{dateError}</Text>}
        </View>

        <View style={{ marginBottom: SPACING.section }}>
          <Text
            style={[
              tw`text-base font-semibold`,
              { color: TW.bgSecondary, marginBottom: SPACING.labelBottom },
            ]}>
            Day Option
          </Text>

          <Controller
            control={control}
            name="isHalfDay"
            render={({ field: { value, onChange } }) => (
              <Pressable
                onPress={() => {
                  const next = !value;
                  onChange(next);

                  if (next && localStartDate) {
                    setLocalEndDate(localStartDate);
                    setValue("halfSession", "first_shift", {
                      shouldValidate: true,
                    });
                  }
                }}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  alignSelf: "flex-start",
                  opacity: pressed ? 0.85 : 1,
                  marginBottom: value ? 14 : 0,
                })}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderWidth: 2,
                    borderRadius: 5,
                    borderColor: value ? TW.bgSecondary : "#CBD5E1",
                    backgroundColor: value ? TW.bgSecondary : "#ffffff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  {value ? (
                    <Check color="#ffffff" size={12} strokeWidth={3} />
                  ) : null}
                </View>

                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: TW.bgSecondary,
                  }}>
                  Half Day
                </Text>
              </Pressable>
            )}
          />

          {isHalfDay && (
            <View>
              <Text
                style={[
                  tw`text-base font-semibold`,
                  {
                    color: TW.bgSecondary,
                    marginBottom: SPACING.labelBottom,
                  },
                ]}>
                Session
              </Text>

              <Controller
                control={control}
                name="halfSession"
                render={({ field: { value, onChange } }) => (
                  <View style={tw`flex-row gap-2.5`}>
                    {(["first_shift", "second_shift"] as const).map(
                      (session) => (
                        <Pressable
                          key={session}
                          onPress={() => onChange(session)}
                          style={({ pressed }) => ({
                            flex: 1,
                            paddingVertical: 13,
                            borderWidth: 1.5,
                            borderRadius: 10,
                            borderColor:
                              value === session ? TW.bgSecondary : "#E2E8F0",
                            backgroundColor:
                              value === session ? TW.bgSecondary : "#ffffff",
                            alignItems: "center",
                            opacity: pressed ? 0.85 : 1,
                          })}>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "500",
                              color:
                                value === session ? "#ffffff" : TW.bgSecondary,
                            }}>
                            {session.charAt(0).toUpperCase() + session.slice(1)}
                          </Text>
                        </Pressable>
                      ),
                    )}
                  </View>
                )}
              />
            </View>
          )}
        </View>

        <View style={{ marginBottom: SPACING.section }}>
          <Text
            style={[
              tw`text-base font-semibold`,
              { color: TW.bgSecondary, marginBottom: SPACING.labelBottom },
            ]}>
            Reason / Description
          </Text>

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
                  paddingHorizontal: SPACING.inputX,
                  paddingVertical: SPACING.inputY,
                  borderWidth: 1.5,
                  borderRadius: 10,
                  borderColor: errors.reason ? "#EF4444" : "#E2E8F0",
                  color: TW.bgSecondary,
                  fontSize: 14,
                  lineHeight: 22,
                  minHeight: 90,
                  backgroundColor: "#ffffff",
                }}
              />
            )}
          />

          {!!errors.reason?.message && (
            <Text style={ERROR_TEXT}>{errors.reason.message}</Text>
          )}
        </View>

        <View style={tw`mt-1 flex-row gap-3`}>
          <Pressable
            disabled={submitting}
            onPress={() => router.replace("/(users)/leaves/(tabs)")}
            style={({ pressed }) => ({
              flex: 1,
              borderWidth: 1.5,
              borderColor: "#CBD5E1",
              borderRadius: 10,
              paddingVertical: SPACING.buttonY,
              alignItems: "center",
              backgroundColor: "#ffffff",
              opacity: pressed || submitting ? 0.6 : 1,
            })}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#64748B",
              }}>
              Cancel
            </Text>
          </Pressable>

          <Pressable
            disabled={submitting}
            onPress={handleSubmitPress}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: TW.bgSecondary,
              borderRadius: 10,
              paddingVertical: SPACING.buttonY,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              opacity: submitting ? 0.55 : pressed ? 0.8 : 1,
            })}>
            {submitting && <ActivityIndicator size="small" color="#ffffff" />}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#ffffff",
              }}>
              {submitting ? "Submitting" : "Submit"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>

      <Modal
        visible={calendarVisible}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setCalendarVisible(false);
          setActiveDateField(null);
        }}>
        <View style={tw`flex-1 bg-black/25 justify-center items-center px-4`}>
          <Pressable
            style={tw`absolute inset-0`}
            onPress={() => {
              setCalendarVisible(false);
              setActiveDateField(null);
            }}
          />

          <SharedCalendar
            year={calYear}
            month={calMonth}
            markedDates={markedDates}
            markingType="custom"
            onDayPress={onDayPress}
            onMonthChange={(m) => {
              setCalYear(m.year);
              setCalMonth(m.month);
            }}
            minDate={todayStr}
          />
        </View>
      </Modal>
    </View>
  );
}
