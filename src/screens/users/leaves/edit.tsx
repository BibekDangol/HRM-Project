import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import tw from "twrnc";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { ArrowLeft, Check } from "lucide-react-native";
import { userLeaveSchema } from "@/src/schema/users/userLeaveApply.schema";
import { FormValues, LeaveTypeRow } from "@/src/types/userLeave";
import { DateField } from "@/src/components/userLeave/DateField";
import { LeaveTypeDropdown } from "@/src/components/userLeave/LeaveTypeDropdown";
import { diffDaysInclusive, firstParam } from "@/src/utils/leaveUtils";


export default function EditLeaveScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const params = useLocalSearchParams<{
    id?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
  }>();

  const leaveId = firstParam(params.id);
  const startDateParam = firstParam(params.startDate);
  const endDateParam = firstParam(params.endDate);

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

  // When half day is selected, sync end date with start date
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
      if (!leaveId) return;
      if (!user?.id) return;

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

        setLocalStartDate(String(data.start_date ?? ""));
        setLocalEndDate(String(data.end_date ?? ""));
        setSelectedLeaveType(Number(data.leave_type_id ?? ""));

        const dayType = String(data.day_type ?? "").toUpperCase();
        const isHalf = dayType === "MORNING" || dayType === "EVENING";
        const session = dayType === "EVENING" ? "evening" : "morning";

        reset({
          reason: String(data.reason ?? ""),
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
  }, [leaveId, reset, router, user?.id]);

  // Update dates from calendar selection
  useEffect(() => {
    if (startDateParam) setLocalStartDate(startDateParam);
    if (endDateParam) setLocalEndDate(endDateParam);

    if (startDateParam && endDateParam) setDateError("");

    // If multi-day selection, disable half day
    if (startDateParam && endDateParam && startDateParam !== endDateParam) {
      setValue("isHalfDay", false, { shouldValidate: true });
      setValue("halfSession", "morning", { shouldValidate: true });
    }
  }, [startDateParam, endDateParam, setValue]);

  const handleLeaveTypeChange = (id: number) => {
    setSelectedLeaveType(id);
    setLeaveTypeError("");
  };

  const goToCalendar = () => {
    router.push({
      pathname: "/(users)/leaves/calendar",
      params: {
        from: "edit",
        id: leaveId || undefined,
        returnTo: "/(users)/leaves/edit",
        startDate: localStartDate || "",
        endDate: isHalfDay ? localStartDate || "" : localEndDate || "",
      },
    });
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

    // Determine day_type based on half day selection
    let dayType = "FULL";
    if (isHalfDay && localStartDate === localEndDate) {
      dayType = values.halfSession === "morning" ? "MORNING" : "EVENING";
    }

    const payload = {
      leave_type_id: selectedLeaveType,
      reason: values.reason.trim(),
      start_date: localStartDate,
      end_date: localEndDate,
      day_type: dayType,
      days_count: daysCount,
      status: "pending",
      action_taken_by: null,
    };

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("leaves")
        .update(payload)
        .eq("id", leaveId)
        .eq("user_id", user.id);

      if (error) throw error;

      Alert.alert("Success", "Leave updated successfully.");
      router.replace("/(users)/leaves/(tabs)/requests");
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
      {/* <Stack.Screen
        options={{
          title: "",
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerLeft: () => (
            <Pressable
              onPress={() => router.replace("/(users)/leaves")}
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

      <View style={tw`flex-1 bg-white`}>
        <ScrollView contentContainerStyle={tw`px-4 pt-4 pb-28`}>
          <Text style={tw`text-xl font-semibold text-gray-900 mb-4`}>
            Edit Leave Request
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
                      setLocalEndDate(localStartDate);
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
                  <Text style={tw`text-slate-900 font-medium`}>Half Day</Text>
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
              types={leaveTypes}
              loading={loadingTypes}
              onRefresh={async () => {}} // No refresh needed in edit
              showStats={false} // Don't show stats in edit mode
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
              onPress={handleSubmit(onSubmit)}
              style={({ pressed }) => [
                tw`flex-1 mr-2 px-4 py-4 rounded-2xl bg-blue-600 items-center`,
                pressed && tw`opacity-85`,
                submitting && tw`opacity-60`,
              ]}
            >
              <Text style={tw`text-white font-bold`}>
                {submitting ? "Saving..." : "Save Changes"}
              </Text>
            </Pressable>

            <Pressable
              disabled={submitting}
              onPress={() => router.replace("/(users)/leaves/(tabs)/requests")}
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
    </>
  );
}
