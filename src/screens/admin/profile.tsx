import { LockKeyhole, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { adminProfileSchema } from "@/src/schema/admin/adminprofiles.schema";
import { fetchAdminProfileService } from "@/src/services/admin.service";
import { fetchImageService } from "@/src/services/image.service";
import { useUsersStore } from "@/src/store/useAdminsStore";
import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import tw from "twrnc";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { adminProfile, setAdminProfile } = useUsersStore();
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: { firstName: "", lastName: "", email: "" },
  });
  const image_path = '/ss.png';
  const loadProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchAdminProfileService(user.id);
      setAdminProfile(data);
      reset({
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        email: data.email ?? "",
      });
    } catch (e: any) {
      console.log("Error loading profile:", e?.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadProfile(); }, [user?.id]);
  useEffect(() => {

    const loadImage = async () => {

      const { data: buckets } = await supabase.storage.listBuckets();
      console.log("Buckets:", buckets);
      //Fetch the Profile Image signed Url
      if (image_path) {
        setImageLoading(true);
        const { signedUrl, error } = await fetchImageService(image_path, 24 * 3600);
        console.log(signedUrl)
        if (!error) setProfileImageUrl(signedUrl);
        else console.log("failed to fetch profile image", error);
        setImageLoading(false);
      }
    }
    loadImage();
  }, [])
  const onSave = async (values: any) => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
        })
        .eq("id", user.id);
      if (error) throw error;
      setEditOpen(false);
      loadProfile();
    } catch (e: any) {
      console.log("Save failed:", e?.message);
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-50 items-center justify-center`}>
        <ActivityIndicator size="large" color="#1F7A4D" />
        <Text style={tw`mt-3 text-gray-500`}>Loading profile...</Text>
      </View>
    );
  }

  const fullName = `${adminProfile?.first_name ?? ""} ${adminProfile?.last_name ?? ""}`.trim();

  return (
    <ScrollView style={tw`flex-1 bg-gray-100`}>
      {/* Cover Image */}
      <View style={tw`bg-white`}>
        {imageLoading ? (
          <ActivityIndicator style={tw`h-72 w-full`} size="large" color="#1F7A4D" />
        ) : (
          <Image
            source={{ uri: profileImageUrl ?? 'https://picsum.photos/600/300' }}
            style={tw`h-72 w-full`}
            resizeMode="cover"
          />
        )}
        <View style={tw`px-6 pt-4 pb-6`}>
          <Text style={tw`text-3xl font-bold text-gray-900`}>
            {fullName || "—"}
          </Text>

          {/* Active Status */}
          <View style={tw`flex-row items-center mt-2`}>
            <View style={tw`w-3 h-3 rounded-full bg-green-500 mr-2`} />
            <Text style={tw`text-base text-gray-700`}>Active</Text>
          </View>

          <Text style={tw`text-gray-500 mt-1 text-base`}>
            {new Date().toLocaleTimeString()} local time
          </Text>

          {/* Buttons */}
          <View style={tw`flex-col gap-2 mt-8 space-y-3`}>
            <Pressable
              style={({ pressed }) => [
                tw`bg-gray-100 py-4 rounded-xl items-center`,
                pressed && tw`opacity-80`,
              ]}
            >
              <Text style={tw`text-lg font-semibold text-gray-800`}>
                Edit Status
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setEditOpen(true)}
              style={({ pressed }) => [
                tw`bg-gray-100 py-4 rounded-xl items-center`,
                pressed && tw`opacity-80`,
              ]}
            >
              <Text style={tw`text-lg font-semibold text-gray-800`}>
                Edit Profile
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={tw`mt-6 bg-white px-6 py-5`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-xl font-semibold text-gray-900`}>
            Contact Information
          </Text>
          <Pressable onPress={() => setEditOpen(true)}>
            <Text style={tw`text-blue-600 font-semibold text-lg`}>
              Edit
            </Text>
          </Pressable>
        </View>

        {/* Phone */}
        <View style={tw`flex-row items-center py-4 border-b border-gray-200`}>
          <Text style={tw`text-gray-900 text-lg`}>
            97875738321
          </Text>
        </View>

        {/* Email */}
        <View style={tw`flex-row items-center py-4`}>
          <Text style={tw`text-gray-900 text-lg`}>
            {adminProfile?.email ?? "—"}
          </Text>
        </View>
      </View>

      {/* Edit Modal */}
      <Modal visible={editOpen} transparent animationType="fade">
        <Pressable onPress={() => setEditOpen(false)} style={tw`flex-1 bg-black/40 justify-center px-4`}>
          <Pressable onPress={() => { }} style={tw`bg-white rounded-xl p-5 shadow-md`}>
            <View style={tw`flex-row items-center justify-between`}>
              <Text style={tw`text-lg font-bold text-gray-900`}>Edit Profile</Text>
              <Pressable onPress={() => setEditOpen(false)} hitSlop={10}>
                <X size={20} color="#0C0C0C" />
              </Pressable>
            </View>

            <ScrollView style={tw`mt-4`} keyboardShouldPersistTaps="handled">
              {/* First Name */}
              <Text style={tw`text-gray-700 font-bold mb-1 mt-3`}>First Name</Text>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="First Name"
                    placeholderTextColor="#9CA3AF"
                    style={tw`border border-gray-300 bg-gray-100 px-4 py-3 rounded-md text-gray-900`}
                  />
                )}
              />

              {/* Last Name */}
              <Text style={tw`text-gray-700 font-bold mb-1 mt-3`}>Last Name</Text>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Last Name"
                    placeholderTextColor="#9CA3AF"
                    style={tw`border border-gray-300 bg-gray-100 px-4 py-3 rounded-md text-gray-900`}
                  />
                )}
              />

              {/* Email */}
              <View style={tw`flex-row gap-1 text-gray-700 font-bold mb-1 mt-3 flex-row items-center`}>
                <LockKeyhole size={16} color="#1F7A4D" />
                <Text>Email</Text>
              </View>
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={tw`border border-gray-300 bg-gray-100 px-4 py-3 rounded-md text-gray-900`}
                  />
                )}
              />

              {/* Buttons */}
              <View style={tw`flex-row gap-2 mt-6 space-x-3`}>
                <Pressable
                  onPress={() => setEditOpen(false)}
                  style={({ pressed }) => [tw`flex-1 border border-gray-300 bg-white py-3 items-center rounded-md`, pressed && tw`opacity-80`]}
                >
                  <Text style={tw`font-bold text-gray-900`}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleSubmit(onSave)}
                  disabled={saving}
                  style={({ pressed }) => [tw`flex-1 bg-green-700 py-3 items-center rounded-md`, saving && tw`opacity-60`, pressed && !saving && tw`opacity-85`]}
                >
                  <Text style={tw`text-white font-bold`}>{saving ? "Saving..." : "Update"}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
