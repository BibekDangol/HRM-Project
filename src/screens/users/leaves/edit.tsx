import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import tw from "twrnc";

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
import { FormValues, LeaveTypeRow } from "@/src/types/userLeave";
import { buildAdminMarks } from "@/src/utils/adminCalendar";
import { diffDaysInclusive, firstParam } from "@/src/utils/leaveUtils";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";

export default function EditLeaveScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const params = useLocalSearchParams<{
    leaveId?: string | string[];
  }>();

  const leaveId = firstParam(params.leaveId);

  const [screenLoading, setScreenLoading] = useState(false);
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeRow[]>([]);
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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(userLeaveSchema),
    defaultValues: { reason: "", isHalfDay: false, halfSession: "morning" },
    mode: "onChange",
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
      setValue("halfSession", "morning", { shouldValidate: true });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoadingTypes(true);
        const { data, error } = await supabase
          .from("leave_types")
          .select("id,name,leave_limit")
          .order("name", { ascending: true });
        if (error) throw error;
        setLeaveTypes(
          (data ?? []).map((r) => ({
            id: Number(r.id),
            name: r.name ?? "",
            leave_limit: Number(r.leave_limit ?? 0),
          })),
        );
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Failed to load leave types.");
      } finally {
        setLoadingTypes(false);
      }
    })();
  }, []);

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
        const isHalf = dayType === "MORNING" || dayType === "EVENING";
        const session = dayType === "EVENING" ? "evening" : "morning";

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

  const handleLeaveTypeChange = (id: number) => {
    setSelectedLeaveType(id);
    setLeaveTypeError("");
  };

  const onSubmit = async (values: FormValues) => {
    if (selectedLeaveType == null) {
      setLeaveTypeError("Leave type is required");
      Alert.alert("Form Error", "Please select a leave type.");
      return;
    }
    if (!localStartDate || !localEndDate) {
      setDateError("Start and end date are required");
      Alert.alert("Form Error", "Please pick start and end date.");
      openCalendar();
      return;
    }
    if (localStartDate > localEndDate) {
      setDateError("End date must be after start date");
      Alert.alert("Form Error", "End date must be after start date.");
      return;
    }
    const daysCount = computedDaysCount;
    if (daysCount == null) {
      Alert.alert(
        "Form Error",
        "Could not calculate days count. Please re-pick dates.",
      );
      openCalendar();
      return;
    }
    if (!user?.id) {
      Alert.alert("Not signed in", "Please sign in again.");
      return;
    }

    let dayType = "FULL";
    if (isHalfDay && localStartDate === localEndDate) {
      dayType = values.halfSession === "morning" ? "MORNING" : "EVENING";
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

  if (screenLoading) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator />
        <Text style={tw`mt-2 text-slate-500`}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        animationType="slide"
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
            {/* Drag handle */}
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

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: TW.bgSecondary,
                  letterSpacing: -0.3,
                }}
              >
                Select Date
              </Text>
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

            {/* Subtitle */}
            <Text
              style={{
                paddingHorizontal: 20,
                marginBottom: 8,
                color: "#94A3B8",
                fontSize: 13,
              }}
            >
              {selectedStart && !selectedEnd
                ? "Tap again for end date"
                : "Tap once for start date, tap again for end date"}
            </Text>

            {/* Calendar */}
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

            {/* Selected display */}
            <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
              <Text
                style={{
                  color: TW.bgSecondary,
                  fontWeight: "600",
                  fontSize: 14,
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
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 112,
          }}
          showsVerticalScrollIndicator={false}
        >
          <BackButton
            color={TW.bgSecondary}
            backgroundColor="rgba(27,74,90,0.08)"
            style={{ marginBottom: 16 }}
            onPress={() =>
              router.replace({
                pathname: "/(users)/leaves/(tabs)",
                params: { tab: "pending" },
              })
            }
          />

          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: TW.bgSecondary,
              marginBottom: 20,
              letterSpacing: -0.3,
            }}
          >
            Edit Leave Request
          </Text>

          {/* Date Fields */}
          <View style={{ gap: 12 }}>
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
            {!!dateError && (
              <Text
                style={{ fontSize: 13, color: "#EF4444", fontWeight: "500" }}
              >
                {dateError}
              </Text>
            )}
          </View>

          {/* Half Day */}
          <View style={{ marginTop: 8 }}>
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
                    gap: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: value ? TW.bgSecondary : "#CBD5E1",
                      backgroundColor: value ? TW.bgSecondary : "#ffffff",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {value ? (
                      <Check color="#ffffff" size={14} strokeWidth={3} />
                    ) : null}
                  </View>
                  <Text
                    style={{
                      fontSize: 15,
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
              <View style={{ marginTop: 12, paddingHorizontal: 4 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#94A3B8",
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Session
                </Text>
                <Controller
                  control={control}
                  name="halfSession"
                  render={({ field: { value, onChange } }) => (
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <Pressable
                        onPress={() => onChange("morning")}
                        style={({ pressed }) => ({
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 12,
                          borderWidth: 1.5,
                          borderColor:
                            value === "morning" ? TW.bgSecondary : "#E2E8F0",
                          backgroundColor:
                            value === "morning" ? TW.bgSecondary : "#ffffff",
                          alignItems: "center",
                          opacity: pressed ? 0.85 : 1,
                        })}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color:
                              value === "morning" ? "#ffffff" : TW.bgSecondary,
                          }}
                        >
                          Morning
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => onChange("evening")}
                        style={({ pressed }) => ({
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 12,
                          borderWidth: 1.5,
                          borderColor:
                            value === "evening" ? TW.bgSecondary : "#E2E8F0",
                          backgroundColor:
                            value === "evening" ? TW.bgSecondary : "#ffffff",
                          alignItems: "center",
                          opacity: pressed ? 0.85 : 1,
                        })}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color:
                              value === "evening" ? "#ffffff" : TW.bgSecondary,
                          }}
                        >
                          Evening
                        </Text>
                      </Pressable>
                    </View>
                  )}
                />
              </View>
            )}
          </View>

          {/* Leave Type */}
          <View style={{ marginTop: 20 }}>
            <LeaveTypeDropdown
              value={selectedLeaveType}
              onChange={handleLeaveTypeChange}
              leaveTypes={leaveTypes}
              loading={loadingTypes}
              onRefresh={async () => {}}
              showStats={false}
            />
            {!!leaveTypeError && (
              <Text
                style={{
                  marginTop: 6,
                  color: "#EF4444",
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                {leaveTypeError}
              </Text>
            )}
          </View>

          {/* Reason */}
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#94A3B8",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
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
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: "#E2E8F0",
                    color: TW.bgSecondary,
                    fontSize: 15,
                    minHeight: 96,
                    textAlignVertical: "top",
                  }}
                />
              )}
            />
            {!!errors.reason?.message && (
              <Text
                style={{
                  marginTop: 6,
                  color: "#EF4444",
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                {errors.reason.message}
              </Text>
            )}
          </View>

          {/* Buttons */}
          <View style={{ marginTop: 32, flexDirection: "row", gap: 12 }}>
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
                borderColor: "#6B7280",
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                backgroundColor: "transparent",
                opacity: pressed || submitting ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: TW.bgSecondary,
                }}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              disabled={submitting}
              onPress={handleSubmit(onSubmit)}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: TW.bgSecondary,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                opacity: submitting ? 0.55 : pressed ? 0.8 : 1,
              })}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#ffffff" }}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
