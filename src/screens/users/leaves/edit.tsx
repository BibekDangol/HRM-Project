import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import tw from "twrnc";

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { supabase } from "@/src/supabase/supabaseClient";
import { useAuthStore } from "@/src/store/useAuthStore";

const schema = z.object({
  description: z.string().trim().min(1, "Description is required").max(500, "Max 500 characters"),
  leaveType: z.string().min(1, "Leave type is required"),
});

type FormValues = z.infer<typeof schema>;

const LEAVE_TYPES = [
  { label: "Annual Leave", value: "annual" },
  { label: "Sick Leave", value: "sick" },
  { label: "Casual Leave", value: "casual" },
  { label: "Work From Home", value: "wfh" },
  { label: "Emergency Leave", value: "emergency" },
];

function SimpleLeaveTypeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentLabel = LEAVE_TYPES.find((t) => t.value === value)?.label ?? "Select Leave Type";

  return (
    <View>
      <Text style={tw`text-slate-800 font-semibold`}>Leave Type</Text>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [
          tw`mt-2 px-4 py-3 rounded-2xl border border-slate-200`,
          pressed && tw`opacity-85`,
        ]}
      >
        <Text style={tw`${value ? "text-slate-900" : "text-slate-400"} font-semibold`}>
          {currentLabel}
        </Text>
      </Pressable>

      {open && (
        <View style={tw`mt-2 rounded-2xl border border-slate-200 overflow-hidden`}>
          {LEAVE_TYPES.map((t) => (
            <Pressable
              key={t.value}
              onPress={() => {
                onChange(t.value);
                setOpen(false);
              }}
              style={({ pressed }) => [
                tw`px-4 py-3 bg-white border-b border-slate-100`,
                pressed && tw`bg-slate-50`,
              ]}
            >
              <Text style={tw`text-slate-900 font-semibold`}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function EditLeaveScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: "", leaveType: "" },
    mode: "onChange",
  });

  useEffect(() => {
    const run = async () => {
      if (!user?.id || !id) return;

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("leaves")
          .select("id,user_id,subject,description,leave_type,status")
          .eq("id", id)
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

        // setValue("subject", data.subject ?? "");
        setValue("description", data.description ?? "");
        setValue("leaveType", data.leave_type ?? "");
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Failed to load leave.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, router, setValue, user?.id]);

  const onSave = async (values: FormValues) => {
    if (!user?.id || !id) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("leaves")
        .update({
          // subject: values.subject.trim(),
          description: values.description.trim(),
          leave_type: values.leaveType,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      Alert.alert("Saved", "Leave updated.");
      router.replace("/leave");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to update leave.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
        <Text style={tw`text-xl font-bold text-slate-900`}>Edit Leave</Text>

        {/* Subject */}
        {/* <View style={tw`mt-5`}>
          <Text style={tw`text-slate-800 font-semibold`}>Subject</Text>
          <Controller
            control={control}
            name="subject"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter subject (max 50 characters)"
                placeholderTextColor="#94a3b8"
                style={tw`mt-2 px-4 py-3 rounded-2xl border border-slate-200 text-slate-900`}
                maxLength={50}
              />
            )}
          />
          {!!errors.subject?.message && (
            <Text style={tw`mt-2 text-red-600 font-semibold`}>{errors.subject.message}</Text>
          )}
        </View> */}

        {/* Description */}
        <View style={tw`mt-5`}>
          <Text style={tw`text-slate-800 font-semibold`}>Reason / Description</Text>
          <Controller
            control={control}
            name="description"
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
          {!!errors.description?.message && (
            <Text style={tw`mt-2 text-red-600 font-semibold`}>{errors.description.message}</Text>
          )}
        </View>

        {/* Leave type */}
        <View style={tw`mt-5`}>
          <Controller
            control={control}
            name="leaveType"
            render={({ field: { value, onChange } }) => (
              <SimpleLeaveTypeSelect value={value} onChange={onChange} />
            )}
          />
          {!!errors.leaveType?.message && (
            <Text style={tw`mt-2 text-red-600 font-semibold`}>{errors.leaveType.message}</Text>
          )}
        </View>

        {/* Buttons */}
        <View style={tw`mt-8 flex-row`}>
          <Pressable
            disabled={saving}
            onPress={handleSubmit(onSave)}
            style={({ pressed }) => [
              tw`flex-1 mr-2 px-4 py-4 rounded-2xl bg-blue-600 items-center`,
              pressed && tw`opacity-85`,
              saving && tw`opacity-60`,
            ]}
          >
            <Text style={tw`text-white font-bold`}>{saving ? "Saving..." : "Save"}</Text>
          </Pressable>

          <Pressable
            disabled={saving}
            onPress={() => router.back()}
            style={({ pressed }) => [
              tw`flex-1 ml-2 px-4 py-4 rounded-2xl border border-slate-200 items-center`,
              pressed && tw`opacity-85`,
              saving && tw`opacity-60`,
            ]}
          >
            <Text style={tw`text-slate-900 font-bold`}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
