import { FormInput, FormOutput } from "@/src/types/user";
import { Camera, Lock, Pencil, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

import { usersProfileSchema } from "@/src/schema/users/userprofiles.schema";
import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { ProfileData } from "@/src/types/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import tw from "twrnc";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(usersProfileSchema),
    defaultValues: {
      orgName: "",
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, email, organization_id, organization(name)",
        )
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const profileData = data as unknown as ProfileData;
      setProfile(profileData);

      reset({
        firstName: profileData.first_name ?? "",
        lastName: profileData.last_name ?? "",
        email: profileData.email ?? "",
        orgName: profileData.organization?.name ?? "",
      });
    } catch (e: unknown) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to load profile.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const openEdit = () => {
    if (!profile) return;

    reset({
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      email: profile.email ?? "",
      orgName: profile.organization?.name ?? "",
    });

    setEditOpen(true);
  };

  const onSave = async (values: FormOutput) => {
    if (!user?.id || !profile) return;

    try {
      setIsSaving(true);

      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          email: values.email.trim() || null,
        })
        .eq("id", user.id);

      if (profileErr) throw profileErr;

      if (profile.organization_id && values.orgName.trim().length > 0) {
        const { error: orgErr } = await supabase
          .from("organization")
          .update({ name: values.orgName.trim() })
          .eq("id", profile.organization_id);

        if (orgErr) throw orgErr;
      }

      setEditOpen(false);
      await fetchProfile();
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator />
        <Text style={tw`mt-3 text-gray-500 font-semibold`}>Loading…</Text>
      </View>
    );
  }

  const fullName =
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Avatar centered */}
      <View style={tw`items-center px-5 pt-9`}>
        <View
          style={tw`w-44 h-44 rounded-full bg-[#F2F6FC] border border-[#E5E5E5] items-center justify-center`}
        >
          <Camera size={44} color="#0C0C0C" />
        </View>

        {/* Edit button */}
        <View style={tw`w-full mt-4 flex-row items-center justify-end`}>
          <Pressable
            onPress={openEdit}
            style={({ pressed }) => [
              tw`flex-row items-center px-3 py-2`,
              pressed && tw`opacity-80`,
            ]}
          >
            <Pencil size={16} color="#1F7A4D" />
            <Text style={tw`ml-2 font-extrabold text-[#1F7A4D]`}>Edit</Text>
          </Pressable>
        </View>

        {/* Organization */}
        <Text style={tw`mt-8 text-2xl font-extrabold text-green-700`}>
          {profile?.organization?.name ?? "—"}
        </Text>
        <View style={tw`w-24 h-px bg-gray-200 my-4`} />

        {/* Name */}
        <Text style={tw`text-4xl font-black text-gray-900`}>
          {fullName || "—"}
        </Text>
        <View style={tw`w-24 h-px bg-gray-200 my-4`} />

        {/* Email */}
        <Text style={tw`text-xl font-semibold text-gray-500`}>
          {profile?.email ?? "—"}
        </Text>
      </View>

      {/* ===== Edit Modal ===== */}
      <Modal visible={editOpen} transparent animationType="fade">
        <Pressable
          onPress={() => setEditOpen(false)}
          style={tw`flex-1 bg-black/40 justify-center px-4`}
        >
          <Pressable
            onPress={() => { }}
            style={tw`bg-white border border-[#E5E5E5] p-4`}
          >
            <View style={tw`flex-row items-center justify-between`}>
              <Text style={tw`text-lg font-extrabold text-[#0C0C0C]`}>
                Edit Profile
              </Text>
              <Pressable onPress={() => setEditOpen(false)} hitSlop={10}>
                <X size={20} color="#0C0C0C" />
              </Pressable>
            </View>

            {/* First Name */}
            <Text style={tw`mt-4 text-[#0C0C0C] font-bold mb-2`}>
              First Name
            </Text>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="First name"
                  placeholderTextColor="#9CA3AF"
                  style={tw`border border-[#E5E5E5] bg-[#F2F6FC] px-4 py-3 text-[#0C0C0C]`}
                />
              )}
            />
            {!!errors.firstName?.message && (
              <Text style={tw`mt-1 text-red-600 font-semibold`}>
                {errors.firstName.message}
              </Text>
            )}

            {/* Last Name */}
            <Text style={tw`mt-4 text-[#0C0C0C] font-bold mb-2`}>
              Last Name
            </Text>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Last name"
                  placeholderTextColor="#9CA3AF"
                  style={tw`border border-[#E5E5E5] bg-[#F2F6FC] px-4 py-3 text-[#0C0C0C]`}
                />
              )}
            />
            {!!errors.lastName?.message && (
              <Text style={tw`mt-1 text-red-600 font-semibold`}>
                {errors.lastName.message}
              </Text>
            )}

            {/* Email label with icon aligned */}
            <View style={tw`mt-4 mb-2 flex-row items-center`}>
              <Lock size={16} color="#0C0C0C" />
              <Text style={tw`ml-2 text-[#0C0C0C] font-bold`}>Email</Text>
            </View>

            <Controller
              control={control}
              name="email"
              render={() => (
                <Text style={tw`text-base text-gray-600`}>
                  {profile?.email ?? "—"}
                </Text>
              )}
            />

            {!!errors.email?.message && (
              <Text style={tw`mt-1 text-red-600 font-semibold`}>
                {errors.email.message}
              </Text>
            )}

            {/* Buttons */}
            <View style={tw`flex-row mt-5`}>
              <Pressable
                onPress={() => setEditOpen(false)}
                style={({ pressed }) => [
                  tw`flex-1 border border-[#E5E5E5] bg-white py-3 items-center`,
                  pressed && tw`opacity-80`,
                ]}
              >
                <Text style={tw`font-bold text-[#0C0C0C]`}>Cancel</Text>
              </Pressable>

              <View style={tw`w-3`} />

              <Pressable
                onPress={handleSubmit(onSave)}
                disabled={isSaving}
                style={({ pressed }) => [
                  tw`flex-1 bg-[#1F7A4D] py-3 items-center`,
                  isSaving && tw`opacity-60`,
                  pressed && !isSaving && tw`opacity-85`,
                ]}
              >
                <Text style={tw`text-white font-extrabold`}>
                  {isSaving ? "Saving..." : "Update"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
