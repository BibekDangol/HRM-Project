import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check, X } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { FormValues, LeaveTypeWithStats } from "@/src/types/userLeave";
import React, { useEffect, useMemo, useState } from "react";
import {
  buildPeriodMarks,
  isBeforeOrEqual,
} from "@/src/components/Calendar/userCalendar";
import { diffDaysInclusive, firstParam } from "@/src/utils/leaveUtils";
import { useLocalSearchParams, useRouter } from "expo-router";

import BackButton from "@/src/components/BackButton";
import { DateField } from "@/src/components/userLeave/DateField";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LeaveTypeDropdown } from "@/src/components/userLeave/LeaveTypeDropdown";
import { SharedCalendar } from "@/src/components/SharedCalendar";
import { TW } from "@/theme/twStyles";
import { buildAdminMarks } from "@/src/utils/adminCalendar";
import { supabase } from "@/src/supabase/supabaseClient";
import tw from "twrnc";
import { useAuthStore } from "@/src/store/useAuthStore";
import { userLeaveSchema } from "@/src/schema/users/userLeaveApply.schema";
import { zodResolver } from "@hookform/resolvers/zod";

const SPACING = {
  screenX: 20,
  top: 10,
  section: 16,
  labelBottom: 8,
  rowGap: 10,
  smallGap: 6,
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

export default function EditLeaveScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const params = useLocalSearchParams<{ leaveId?: string | string[] }>();
  const leaveId = firstParam(params.leaveId);

  const [screenLoading, setScreenLoading] = useState(false);
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeWithStats[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState<number | null>(
    null,
  );
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [leaveTypeError, setLeaveTypeError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedStart, setSelectedStart] = useState("");
  const [selectedEnd, setSelectedEnd] = useState("");
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(userLeaveSchema),
    defaultValues: { reason: "", isHalfDay: false, halfSession: "first_shift" },
    mode: "all",
  });

  const isHalfDay = watch("isHalfDay") ?? false;

  useEffect(() => {
    if (isHalfDay && localStartDate) setLocalEndDate(localStartDate);
  }, [isHalfDay, localStartDate]);

  const computedDaysCount = useMemo(() => {
    if (!localStartDate || !localEndDate) return null;
    if (localStartDate > localEndDate) return null;
    if (localStartDate === localEndDate) return isHalfDay ? 0.5 : 1;
    const n = diffDaysInclusive(localStartDate, localEndDate);
    return n ?? null;
  }, [localStartDate, localEndDate, isHalfDay]);

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
        text: { color: "#FFB300", fontWeight: "bold" },
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
          text: { color: "#fff", fontWeight: "bold" },
        },
      },
    };
  } else {
    markedDates = { ...adminMarks, ...todayMark };
  }

  const markingType = selectedStart && selectedEnd ? "period" : "custom";

  const openCalendar = () => {
    setSelectedStart(localStartDate || "");
    setSelectedEnd(isHalfDay ? localStartDate || "" : localEndDate || "");
    setCalendarVisible(true);
  };

  const onDayPress = (day: { dateString: string }) => {
    const dateStr = day.dateString;

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

    setSelectedStart(finalStart);
    setSelectedEnd(finalEnd);
    setLocalStartDate(finalStart);
    setLocalEndDate(finalEnd);
    setDateError("");
    setCalendarVisible(false);

    if (finalStart !== finalEnd) {
      setValue("isHalfDay", false, { shouldValidate: true });
      setValue("halfSession", "first_shift", { shouldValidate: true });
    }
  };

  const fetchLeaveTypes = async () => {
    if (!user?.id) return;

    try {
      setLoadingTypes(true);

      const { data: types, error: typesError } = await supabase
        .from("leave_types")
        .select("id,name,leave_limit")
        .order("name", { ascending: true });

      if (typesError) throw typesError;

      const { data: usedData, error: usedError } = await supabase
        .from("leaves")
        .select("leave_type_id, days_count")
        .eq("user_id", user.id)
        .eq("status", "approved");

      if (usedError) throw usedError;

      const { data: pendingData, error: pendingError } = await supabase
        .from("leaves")
        .select("leave_type_id, days_count")
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (pendingError) throw pendingError;

      const usedMap: Record<number, number> = {};
      for (const row of usedData ?? []) {
        const id = Number(row.leave_type_id);
        usedMap[id] = (usedMap[id] ?? 0) + Number(row.days_count ?? 0);
      }

      const pendingMap: Record<number, number> = {};
      for (const row of pendingData ?? []) {
        const id = Number(row.leave_type_id);
        pendingMap[id] = (pendingMap[id] ?? 0) + Number(row.days_count ?? 0);
      }

      const withStats: LeaveTypeWithStats[] = (types ?? []).map((r) => {
        const id = Number(r.id);
        const limit = Number(r.leave_limit ?? 0);
        const approvedUsed = usedMap[id] ?? 0;
        const pending = pendingMap[id] ?? 0;
        const remaining = Math.max(0, limit - approvedUsed);

        return {
          id,
          name: r.name ?? "",
          leave_limit: limit,
          approvedUsed,
          pending,
          remaining,
        };
      });

      setLeaveTypes(withStats);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load leave types.");
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, [user?.id]);

  useEffect(() => {
    (async () => {
      if (!leaveId || !user?.id) return;

      try {
        setScreenLoading(true);

        const { data, error } = await supabase
          .from("leaves")
          .select(
            "id,user_id,status,reason,leave_type_id,start_date,end_date,day_type",
          )
          .eq("id", leaveId)
          .single();

        if (error) throw error;

        if (!data || data.user_id !== user.id) {
          Alert.alert("Not allowed", "You can't edit this leave.");
          router.back();
          return;
        }

        if (String(data.status).toLowerCase() !== "pending") {
          Alert.alert("Not editable", "Only pending leaves can be edited.");
          router.back();
          return;
        }

        const start = data.start_date ?? "";
        const end = data.end_date ?? "";
        setLocalStartDate(start);
        setLocalEndDate(end);
        setSelectedStart(start);
        setSelectedEnd(end);
        setSelectedLeaveType(
          data.leave_type_id ? Number(data.leave_type_id) : null,
        );

        const dayType = String(data.day_type ?? "").toUpperCase();
        const isHalf = dayType === "FIRST_SHIFT" || dayType === "SECOND_SHIFT";
        const session =
          dayType === "SECOND_SHIFT" ? "second_shift" : "first_shift";
        reset({
          reason: data.reason ?? "",
          isHalfDay: isHalf,
          halfSession: session,
        });
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Failed to load leave.");
        router.back();
      } finally {
        setScreenLoading(false);
      }
    })();
  }, [leaveId, user?.id]);

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

    const daysCount = computedDaysCount;
    if (daysCount == null) {
      setDateError("Could not calculate days. Please re-pick dates.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Not signed in", "Please sign in again.");
      return;
    }

    let dayType = "FULL";
    if (isHalfDay && localStartDate === localEndDate) {
      dayType =
        values.halfSession === "first_shift" ? "FIRST_SHIFT" : "SECOND_SHIFT";
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("leaves")
        .update({
          leave_type_id: selectedLeaveType,
          reason: values.reason.trim(),
          start_date: localStartDate,
          end_date: localEndDate,
          day_type: dayType,
          days_count: daysCount,
          status: "pending",
          action_taken_by: null,
        })
        .eq("id", leaveId)
        .eq("user_id", user.id);

      if (error) throw error;

      Alert.alert("Success", "Leave updated successfully.");
      router.replace({
        pathname: "/(users)/leaves/(tabs)",
        params: { tab: "pending" },
      });
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to update leave.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePress = async () => {
    const manualHasError = validateManualFields();
    await trigger();

    if (!manualHasError) {
      handleSubmit(onSubmit)();
    }
  };

  if (screenLoading) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, fontSize: 13, color: "#94A3B8" }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Modal
        visible={calendarVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCalendarVisible(false)}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
          onPress={() => setCalendarVisible(false)}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "#ffffff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingBottom: Platform.OS === "ios" ? 40 : 28,
            }}>
            <View
              style={{ alignItems: "center", paddingTop: 12, marginBottom: 8 }}>
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
                paddingVertical: 10,
                marginBottom: 8,
              }}>
              <View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                    color: TW.bgSecondary,
                  }}>
                  Select Date
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: "#94A3B8",
                  }}>
                  {selectedStart && !selectedEnd
                    ? "Tap again to set end date"
                    : "Tap once for start, again for end"}
                </Text>
              </View>

              <Pressable
                onPress={() => setCalendarVisible(false)}
                style={({ pressed }) => ({
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#F1F5F9",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.5 : 1,
                })}>
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
            />

            <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: TW.bgSecondary,
                }}>
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

          <View style={{ marginBottom: 28 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: TW.bgSecondary,
              }}>
              Edit Leave Request
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "#94A3B8",
              }}>
              Update the details of your pending leave
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
              onRefresh={fetchLeaveTypes}
            />

            {!!leaveTypeError && (
              <Text style={ERROR_TEXT}>{leaveTypeError}</Text>
            )}
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

          <View style={{ marginBottom: SPACING.section }}>
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
                      setValue("halfSession", "first_shift", {
                        shouldValidate: true,
                      });
                      return;
                    }

                    const next = !value;
                    onChange(next);

                    if (next) {
                      setValue("halfSession", "first_shift", {
                        shouldValidate: true,
                      });
                      if (localStartDate) setLocalEndDate(localStartDate);
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
                      borderRadius: 6,
                      borderWidth: 2,
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
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      {(["first_shift", "second_shift"] as const).map(
                        (session) => (
                          <Pressable
                            key={session}
                            onPress={() => onChange(session)}
                            style={({ pressed }) => ({
                              flex: 1,
                              paddingVertical: 13,
                              borderRadius: 12,
                              borderWidth: 1.5,
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
                                  value === session
                                    ? "#ffffff"
                                    : TW.bgSecondary,
                              }}>
                              {session.charAt(0).toUpperCase() +
                                session.slice(1)}
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
                    borderRadius: 12,
                    borderWidth: 1.5,
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

          <View style={{ marginTop: 4, flexDirection: "row", gap: 12 }}>
            <Pressable
              disabled={submitting}
              onPress={() =>
                router.replace({
                  pathname: "/(users)/leaves/(tabs)",
                  params: { tab: "pending" },
                })
              }
              style={({ pressed }) => ({
                flex: 1,
                borderWidth: 1.5,
                borderColor: "#CBD5E1",
                borderRadius: 14,
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
              onPress={handleSavePress}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: TW.bgSecondary,
                borderRadius: 14,
                paddingVertical: SPACING.buttonY,
                alignItems: "center",
                opacity: submitting ? 0.55 : pressed ? 0.8 : 1,
              })}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#ffffff",
                }}>
                {submitting ? "Saving..." : "Save Changes"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </>
  );
}
