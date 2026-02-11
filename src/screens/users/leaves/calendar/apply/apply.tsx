import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
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

type LeaveTypeRow = { id: string; name: string };

/**
 * Ensure leaves table has:
 * start_date (date), end_date (date), leave_type_id (uuid), reason (text),
 * is_half_day (bool), days_count (numeric), user_id (uuid), status (text)
 */

const schema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Max 500 characters"),
  isHalfDay: z.boolean().default(false),
});

type FormValues = z.input<typeof schema>;

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
      <View style={tw`flex-row items-center justify-between`}>
        <Text style={tw`text-slate-800 font-semibold`}>Leave Type</Text>
      </View>

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

/** -------- Date helpers (YYYY-MM-DD) -------- */
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

/** Normalize expo-router param (string | string[]) -> string */
function firstParam(v?: string | string[]) {
  if (!v) return "";
  return Array.isArray(v) ? String(v[0] ?? "") : String(v);
}

export default function ApplyLeaveScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  /**
   * IMPORTANT:
   * Your calendar MUST navigate to THIS screen with:
   * router.replace({ pathname: "/(users)/leaves/calendar/apply", params: { startDate, endDate } })
   */
  const params = useLocalSearchParams<{
    startDate?: string | string[];
    endDate?: string | string[];
  }>();

  const startDate = firstParam(params.startDate);
  const endDate = firstParam(params.endDate);

  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("");
  const [leaveTypeError, setLeaveTypeError] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeRow[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [localStartDate, setLocalStartDate] = useState<string>("");
  const [localEndDate, setLocalEndDate] = useState<string>("");

  const [dateError, setDateError] = useState<string>("");

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: "",
      isHalfDay: false,
    },
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

    if (localStartDate === localEndDate) {
      return isHalfDay ? 0.5 : 1;
    }

    const n = diffDaysInclusive(localStartDate, localEndDate);
    return n ?? null;
  }, [localStartDate, localEndDate, isHalfDay]);

  // Debug: confirm params are arriving
  useEffect(() => {}, [params, startDate, endDate]);

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

  // Put params into local state
  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);

    if (startDate && endDate) setDateError("");

    // If range, force half-day off
    if (startDate && endDate && startDate !== endDate) {
      setValue("isHalfDay", false, { shouldValidate: true });
    }
  }, [startDate, endDate, setValue]);

  const handleLeaveTypeChange = (id: string) => {
    setSelectedLeaveType(id);
    setLeaveTypeError("");
  };

  const onInvalid = (formErrors: any) => {
    // console.log("FORM ERRORS:", formErrors);
    Alert.alert("Form Error", "Please fill all required fields.");
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
      router.replace("/(users)/leaves/calendar");
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
      router.replace("/(users)/leaves/calendar");
      return;
    }

    if (!user?.id) {
      Alert.alert("Not signed in", "Please sign in again.");
      return;
    }

    const finalIsHalfDay =
      localStartDate === localEndDate ? (values.isHalfDay ?? false) : false;

    try {
      setSubmitting(true);

      const { error } = await supabase.from("leaves").insert({
        user_id: user.id,
        reason: values.reason.trim(),
        leave_type_id: selectedLeaveType,
        start_date: localStartDate,
        end_date: localEndDate,
        day_type: finalIsHalfDay,
        days_count: daysCount,
        status: "pending",
        action_taken_by: null,
      });

      if (error) throw error;

      Alert.alert("Success", "Leave applied successfully.");
      router.replace("/(users)/leaves");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to submit leave.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`px-4 pt-4 pb-10`}>
        <Text style={tw`text-xl font-bold text-slate-900`}>
          Apply for Leave
        </Text>

        {/* Start / End date (TextInput look, opens calendar) */}
        <View style={tw`mt-4`}>
          <DateField
            label="Start Date"
            value={localStartDate}
            onPress={() =>
              router.push({
                pathname: "/(users)/leaves/calendar",
                params: { from: "apply" },
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
                params: { from: "apply" },
              })
            }
          />

          {/* Days count preview */}
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

          {/* Half-day checkbox (ONLY when single day) */}
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

        {/* Leave type dropdown */}
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
            onPress={() => router.replace("/(users)/leaves/calendar")}
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
