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
import {
  calcLeaveDays,
  diffDaysInclusive,
  firstParam,
} from "@/src/utils/leaveUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter
} from "expo-router";
import { Check } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
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

export default function ApplyLeaveScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const params = useLocalSearchParams<{
    startDate?: string | string[];
    endDate?: string | string[];
  }>();
  const startDate = firstParam(params.startDate);
  const endDate = firstParam(params.endDate);

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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(userLeaveSchema),
    defaultValues: { reason: "", isHalfDay: false, halfSession: "morning" },

    mode: "onChange",
  });

  const isHalfDay = watch("isHalfDay");

  const selectedType = useMemo(() => {
    if (selectedLeaveType == null) return null;
    return leaveTypes.find((t) => t.id === selectedLeaveType) ?? null;
  }, [leaveTypes, selectedLeaveType]);

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

  const goToCalendar = () => {
    router.push({
      pathname: "/(users)/leaves/calendar",
      params: {
        from: "apply",
        returnTo: "/(users)/leaves/calendar/apply",
        startDate: localStartDate || "",
        endDate: isHalfDay ? localStartDate || "" : localEndDate || "",
      },
    });
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
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);

    if (startDate && endDate) setDateError("");
    if (startDate && endDate && startDate !== endDate) {
      setValue("isHalfDay", false, { shouldValidate: true });
      setValue("halfSession", "morning", { shouldValidate: true });
    }
  }, [startDate, endDate, setValue]);

  useEffect(() => {
    if (!selectedType) return;
    if (computedDaysCount == null) return;
    if (!localStartDate || !localEndDate) return;

    if (computedDaysCount > selectedType.remaining) {
      Alert.alert(
        "Leave limit exceeded",
        `You selected ${computedDaysCount} day(s) but only ${selectedType.remaining} day(s) are remaining for "${selectedType.name ?? "this leave type"}".`,
      );

      setLocalEndDate(localStartDate);
      setValue("isHalfDay", false, { shouldValidate: true });
      setValue("halfSession", "morning", { shouldValidate: true });
    }
  }, [selectedType, computedDaysCount, localStartDate, localEndDate, setValue]);

  const handleLeaveTypeChange = (id: number) => {
    setSelectedLeaveType(id);
    setLeaveTypeError("");
  };

  const onInvalid = () => {
    Alert.alert("Form Error", "Please fill all required fields.");
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
      goToCalendar();
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
      goToCalendar();
      return;
    }

    if (!user?.id) {
      Alert.alert("Not signed in", "Please sign in again.");
      return;
    }

    // Final guard for remaining
    const type = leaveTypes.find((t) => t.id === selectedLeaveType);
    if (type && daysCount > type.remaining) {
      Alert.alert(
        "Leave limit exceeded",
        `You selected ${daysCount} day(s) but only ${type.remaining} day(s) are remaining for "${type.name ?? "this leave type"}".`,
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
        Alert.alert("Error", "Organization ID not found for this user.");
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
      router.replace("/(users)/leaves/(tabs)/requests");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to submit leave.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* <Stack.Screen
        options={{
          title: "",
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerLeft: () => (
            <Pressable
              onPress={() => router.replace("/(users)/leaves/(tabs)/requests")}
              hitSlop={12}
              style={({ pressed }) => [
                {
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 8,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <ArrowLeft size={24} color="#0f172a" />
            </Pressable>
          ),
        }}
      /> */}

      <KeyboardAvoidingView
        style={tw`flex-1 bg-white`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={tw`flex-1 bg-white`}>
            <ScrollView
              contentContainerStyle={tw`px-4 pt-4 pb-28`}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={tw`text-xl font-semibold text-gray-900 mb-4`}>
                New Leave Request
              </Text>

              <View style={tw`gap-4`}>
                <View style={tw`flex-row justify-between gap-3`}>
                  <View style={tw`flex-1`}>
                    <DateField
                      label="Start Date"
                      value={localStartDate}
                      onPress={goToCalendar}
                    />
                  </View>

                  {!isHalfDay && (
                    <View style={tw`flex-1`}>
                      <DateField
                        label="End Date"
                        value={localEndDate}
                        onPress={goToCalendar}
                      />
                    </View>
                  )}
                </View>

                {!!dateError && (
                  <Text style={tw`text-sm text-red-600 font-medium`}>
                    {dateError}
                  </Text>
                )}
              </View>

              <View style={tw`mt-2`}>
                {/* <Text style={tw`text-slate-800 font-semibold`}>Half Day</Text> */}

                <Controller
                  control={control}
                  name="isHalfDay"
                  render={({ field: { value, onChange } }) => (
                    <Pressable
                      onPress={() => {
                        // If multi-day range is selected
                        if (
                          localStartDate &&
                          localEndDate &&
                          localStartDate !== localEndDate
                        ) {
                          // Set end date same as start date
                          setLocalEndDate(localStartDate);
                          // Enable half day
                          onChange(true);
                          setValue("halfSession", "morning", {
                            shouldValidate: true,
                          });
                          return;
                        }

                        // Toggle half day normally
                        const next = !value;
                        onChange(next);

                        if (next) {
                          setValue("halfSession", "morning", {
                            shouldValidate: true,
                          });
                          // Set end date same as start date
                          if (localStartDate) setLocalEndDate(localStartDate);
                        }
                      }}
                      style={({ pressed }) => [
                        tw`flex-row items-center gap-3 px-4 py-3 rounded-xl`,
                        pressed && tw`opacity-85`,
                      ]}
                    >
                      <View
                        style={tw`h-6 w-6 rounded-md border ${
                          value
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-slate-300"
                        } items-center justify-center`}
                      >
                        {value ? <Check color="#ffffff" size={18} /> : null}
                      </View>
                      <Text style={tw`text-slate-900 font-medium`}>
                        Half Day
                      </Text>
                    </Pressable>
                  )}
                />
                {isHalfDay && (
                  <View style={tw`mt-3`}>
                    <Text style={tw`text-slate-800 font-semibold mb-2`}>
                      Session
                    </Text>

                    <Controller
                      control={control}
                      name="halfSession"
                      render={({ field: { value, onChange } }) => (
                        <View style={tw`flex-row gap-3`}>
                          <Pressable
                            onPress={() => onChange("morning")}
                            style={({ pressed }) => [
                              tw`flex-1 px-4 py-3 rounded-xl border items-center`,
                              value === "morning"
                                ? tw`bg-blue-600 border-blue-600`
                                : tw`bg-white border-slate-200`,
                              pressed && tw`opacity-85`,
                            ]}
                          >
                            <Text
                              style={tw`${value === "morning" ? "text-white" : "text-slate-900"} font-semibold`}
                            >
                              Morning
                            </Text>
                          </Pressable>

                          <Pressable
                            onPress={() => onChange("evening")}
                            style={({ pressed }) => [
                              tw`flex-1 px-4 py-3 rounded-xl border items-center`,
                              value === "evening"
                                ? tw`bg-blue-600 border-blue-600`
                                : tw`bg-white border-slate-200`,
                              pressed && tw`opacity-85`,
                            ]}
                          >
                            <Text
                              style={tw`${value === "evening" ? "text-white" : "text-slate-900"} font-semibold`}
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

              <View style={tw`mt-5`}>
                <LeaveTypeDropdown
                  value={selectedLeaveType}
                  onChange={handleLeaveTypeChange}
                  leaveTypes={leaveTypes}
                  loading={loadingTypes}
                  onRefresh={loadLeaveTypesWithStats}
                />

                {!!leaveTypeError && (
                  <Text style={tw`mt-2 text-red-600 font-semibold`}>
                    {leaveTypeError}
                  </Text>
                )}
              </View>

              <View style={tw`mt-5`}>
                <Text style={tw`text-slate-800 font-semibold`}>
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
                      placeholderTextColor="#94a3b8"
                      multiline
                      style={tw`mt-2 px-4 py-3 rounded-2xl border border-slate-200 text-slate-900`}
                    />
                  )}
                />

                {!!errors.reason?.message && (
                  <Text style={tw`mt-2 text-red-600 font-semibold`}>
                    {errors.reason.message}
                  </Text>
                )}
              </View>

              <View style={tw`mt-8 flex-row`}>
                <Pressable
                  disabled={submitting}
                  onPress={handleSubmit(onSubmit, onInvalid)}
                  style={({ pressed }) => [
                    tw`flex-1 mr-2 px-4 py-4 rounded-2xl bg-blue-600 items-center`,
                    pressed && tw`opacity-85`,
                    submitting && tw`opacity-60`,
                  ]}
                >
                  <Text style={tw`text-white font-bold`}>
                    {submitting ? "Submitting..." : "Submit"}
                  </Text>
                </Pressable>

                <Pressable
                  disabled={submitting}
                  onPress={() =>
                    router.replace("/(users)/leaves/(tabs)/requests")
                  }
                  style={({ pressed }) => [
                    tw`flex-1 ml-2 px-4 py-4 rounded-2xl border border-slate-200 items-center`,
                    pressed && tw`opacity-85`,
                    submitting && tw`opacity-60`,
                  ]}
                >
                  <Text style={tw`text-slate-900 font-bold`}>Cancel</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}
