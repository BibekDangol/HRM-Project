import { useLocalSearchParams, useRouter } from "expo-router";
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
import { z } from "zod";

import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";

const schema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Max 500 characters"),
  isHalfDay: z.boolean().default(false),
});

type FormValues = z.input<typeof schema>;
type LeaveTypeRow = { id: string; name: string };

function firstParam(v?: string | string[]) {
  if (!v) return "";
  return Array.isArray(v) ? String(v[0] ?? "") : String(v);
}

function parseISODateOnly(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map((n) => Number(n));
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function diffDaysInclusive(startStr: string, endStr: string) {
  const s = parseISODateOnly(startStr);
  const e = parseISODateOnly(endStr);
  if (!s || !e) return null;

  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.round((e.getTime() - s.getTime()) / msPerDay);
  return diff + 1;
}

function DateField({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <View style={tw`mt-4`}>
      <Text style={tw`text-slate-800 font-semibold`}>{label}</Text>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          tw`mt-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white`,
          pressed && tw`opacity-85`,
        ]}
      >
        <Text
          style={tw`${value ? "text-slate-900" : "text-slate-400"} font-semibold`}
        >
          {value || `Pick ${label.toLowerCase()}`}
        </Text>
      </Pressable>
    </View>
  );
}

function LeaveTypeDropdown({
  value,
  onChange,
  types,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  types: LeaveTypeRow[];
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);

  const currentLabel = useMemo(() => {
    if (!value) return "Select Leave Type";
    return types.find((t) => t.id === value)?.name ?? "Select Leave Type";
  }, [value, types]);

  return (
    <View>
      <Text style={tw`text-slate-800 font-semibold`}>Leave Type</Text>

      <Pressable
        onPress={() => !loading && setOpen((v) => !v)}
        style={({ pressed }) => [
          tw`mt-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white`,
          pressed && tw`opacity-85`,
          loading && tw`opacity-60`,
        ]}
      >
        <Text
          style={tw`${value ? "text-slate-900" : "text-slate-400"} font-semibold`}
        >
          {loading ? "Loading leave types..." : currentLabel}
        </Text>
      </Pressable>

      {open && !loading && (
        <View
          style={tw`mt-2 rounded-2xl border border-slate-200 overflow-hidden`}
        >
          {types.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => {
                onChange(t.id);
                setOpen(false);
              }}
              style={({ pressed }) => [
                tw`px-4 py-3 bg-white border-b border-slate-100`,
                pressed && tw`bg-slate-50`,
              ]}
            >
              <Text style={tw`text-slate-900 font-semibold`}>{t.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ApplyLeaveScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const params = useLocalSearchParams<{
    id?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
    fresh?: string | string[];
  }>();

  const leaveId = firstParam(params.id);
  const startDateParam = firstParam(params.startDate);
  const endDateParam = firstParam(params.endDate);

  const isEditMode = !!leaveId;

  // Where the calendar should navigate back to
  // (keep this aligned with your expo-router file structure)
  const returnTo = isEditMode ? "/(users)/leaves/edit" : "/(users)/leaves/apply";

  const [screenLoading, setScreenLoading] = useState(false);

  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");
  const [dateError, setDateError] = useState("");

  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeRow[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // leave type NOT in zod
  const [selectedLeaveType, setSelectedLeaveType] = useState("");
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
    resolver: zodResolver(schema),
    defaultValues: { reason: "", isHalfDay: false },
    mode: "onChange",
  });

  const isHalfDay = watch("isHalfDay") ?? false;

  const isSingleDay = useMemo(() => {
    return (
      !!localStartDate && !!localEndDate && localStartDate === localEndDate
    );
  }, [localStartDate, localEndDate]);

  const computedDaysCount = useMemo(() => {
    if (!localStartDate || !localEndDate) return null;
    if (localStartDate > localEndDate) return null;

    if (localStartDate === localEndDate) return isHalfDay ? 0.5 : 1;

    const n = diffDaysInclusive(localStartDate, localEndDate);
    return n ?? null;
  }, [localStartDate, localEndDate, isHalfDay]);

  // Load leave types
  useEffect(() => {
    (async () => {
      try {
        setLoadingTypes(true);
        const { data, error } = await supabase
          .from("leave_types")
          .select("id,name")
          .order("name", { ascending: true });
        if (error) throw error;
        setLeaveTypes((data ?? []) as LeaveTypeRow[]);
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Failed to load leave types.");
      } finally {
        setLoadingTypes(false);
      }
    })();
  }, []);

  // If edit mode: load existing leave once to prefill
  useEffect(() => {
    (async () => {
      if (!isEditMode) return;
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
          Alert.alert("Not allowed", "You can’t edit this leave.");
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
        setSelectedLeaveType(String(data.leave_type_id ?? ""));
        reset({
          reason: String(data.reason ?? ""),
          isHalfDay: !!data.day_type,
        });
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Failed to load leave.");
        router.back();
      } finally {
        setScreenLoading(false);
      }
    })();
  }, [isEditMode, leaveId, reset, router, user?.id]);

  // Apply route params into local state (when coming back from calendar)
  useEffect(() => {
    if (startDateParam) setLocalStartDate(startDateParam);
    if (endDateParam) setLocalEndDate(endDateParam);

    if (startDateParam && endDateParam) setDateError("");

    if (startDateParam && endDateParam && startDateParam !== endDateParam) {
      setValue("isHalfDay", false, { shouldValidate: true });
    }
  }, [startDateParam, endDateParam, setValue]);

  // Reset ONLY when not editing
  useEffect(() => {
    if (isEditMode) return;

    if (!startDateParam || !endDateParam) {
      setLocalStartDate("");
      setLocalEndDate("");
      setSelectedLeaveType("");
      setLeaveTypeError("");
      setDateError("");
      reset({ reason: "", isHalfDay: false });
    }
  }, [isEditMode, startDateParam, endDateParam, reset]);

  const handleLeaveTypeChange = (id: string) => {
    setSelectedLeaveType(id);
    setLeaveTypeError("");
  };

  const onSubmit = async (values: FormValues) => {
    if (!selectedLeaveType) {
      setLeaveTypeError("Leave type is required");
      Alert.alert("Form Error", "Please select a leave type.");
      return;
    }

    if (!localStartDate || !localEndDate) {
      setDateError("Start and end date are required");
      Alert.alert("Form Error", "Please pick start and end date.");
      router.push({
        pathname: "/(users)/leaves/calendar",
        params: {
          from: isEditMode ? "edit" : "apply",
          id: leaveId || undefined,
          returnTo,
          startDate: localStartDate,
          endDate: localEndDate,
        },
      });
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
      router.push({
        pathname: "/(users)/leaves/calendar",
        params: {
          from: isEditMode ? "edit" : "apply",
          id: leaveId || undefined,
          returnTo,
          startDate: localStartDate,
          endDate: localEndDate,
        },
      });
      return;
    }

    if (!user?.id) {
      Alert.alert("Not signed in", "Please sign in again.");
      return;
    }

    const finalIsHalfDay =
      localStartDate === localEndDate ? (values.isHalfDay ?? false) : false;

    const payload = {
      leave_type_id: selectedLeaveType,
      reason: values.reason.trim(),
      start_date: localStartDate,
      end_date: localEndDate,
      day_type: finalIsHalfDay,
      days_count: daysCount,
      status: "pending",
      action_taken_by: null, // matches your constraint
    };

    try {
      setSubmitting(true);

      let error: any;

      if (leaveId) {
        // ✅ EDIT (update 1 row)
        ({ error } = await supabase
          .from("leaves")
          .update(payload)
          .eq("id", leaveId)
          .eq("user_id", user.id));
      } else {
        // ✅ NEW (insert)
        ({ error } = await supabase.from("leaves").insert({
          user_id: user.id,
          ...payload,
        }));
      }

      if (error) throw error;

      Alert.alert(
        "Success",
        leaveId ? "Leave updated successfully." : "Leave applied successfully.",
      );
      router.replace("/(users)/leaves");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to submit leave.");
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
    <View style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`px-4 pt-4 pb-10`}>
        <Text style={tw`text-xl font-bold text-slate-900`}>
          {leaveId ? "Edit Leave" : "Apply for Leave"}
        </Text>

        {/* Dates */}
        <View style={tw`mt-4`}>
          <DateField
            label="Start Date"
            value={localStartDate}
            onPress={() =>
              router.push({
                pathname: "/(users)/leaves/calendar",
                params: {
                  from: leaveId ? "edit" : "apply",
                  id: leaveId || undefined,
                  returnTo,
                  startDate: localStartDate,
                  endDate: localEndDate,
                },
              })
            }
          />

          {!!dateError && (
            <Text style={tw`mt-2 text-red-600 font-semibold`}>{dateError}</Text>
          )}

          <DateField
            label="End Date"
            value={localEndDate}
            onPress={() =>
              router.push({
                pathname: "/(users)/leaves/calendar",
                params: {
                  from: leaveId ? "edit" : "apply",
                  id: leaveId || undefined,
                  returnTo,
                  startDate: localStartDate,
                  endDate: localEndDate,
                },
              })
            }
          />

          {/* Days count */}
          <View style={tw`mt-4`}>
            <Text style={tw`text-slate-800 font-semibold`}>Days Count</Text>
            <View
              style={tw`mt-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white`}
            >
              <Text style={tw`text-slate-900 font-semibold`}>
                {computedDaysCount == null ? "-" : String(computedDaysCount)}
              </Text>
            </View>
          </View>

          {/* Half day only when single day */}
          {isSingleDay && (
            <View style={tw`mt-4`}>
              <Text style={tw`text-slate-800 font-semibold`}>Half Day</Text>

              <Controller
                control={control}
                name="isHalfDay"
                render={({ field: { value, onChange } }) => (
                  <Pressable
                    onPress={() => onChange(!value)}
                    style={({ pressed }) => [
                      tw`mt-2 flex-row items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 bg-white`,
                      pressed && tw`opacity-85`,
                    ]}
                  >
                    <Text style={tw`text-slate-900 font-semibold`}>
                      {value ? "Yes (0.5 day)" : "No (1 day)"}
                    </Text>

                    <View
                      style={tw`h-6 w-6 rounded-md border ${
                        value
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white border-slate-300"
                      } items-center justify-center`}
                    >
                      {value ? (
                        <Text style={tw`text-white font-bold`}>✓</Text>
                      ) : null}
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}
        </View>

        {/* Leave type */}
        <View style={tw`mt-5`}>
          <LeaveTypeDropdown
            value={selectedLeaveType}
            onChange={handleLeaveTypeChange}
            types={leaveTypes}
            loading={loadingTypes}
          />

          {!!leaveTypeError && (
            <Text style={tw`mt-2 text-red-600 font-semibold`}>
              {leaveTypeError}
            </Text>
          )}
        </View>

        {/* Description */}
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
                style={tw`mt-2 px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 h-32`}
              />
            )}
          />

          {!!errors.reason?.message && (
            <Text style={tw`mt-2 text-red-600 font-semibold`}>
              {errors.reason.message}
            </Text>
          )}
        </View>

        {/* Buttons */}
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
              {submitting ? "Saving..." : leaveId ? "Save" : "Submit"}
            </Text>
          </Pressable>

          <Pressable
            disabled={submitting}
            onPress={() => router.replace("/(users)/leaves")}
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
  );
}
