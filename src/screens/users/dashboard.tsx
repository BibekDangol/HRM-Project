import { ProfileData } from "@/src/types/profile";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase/supabaseClient";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import tw from "twrnc";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isloading, setIsLoading] = useState(false);

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
      setProfile(data as ProfileData);
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
  }, [user?.id]);

  const fullName =
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();

  return (
    <ScrollView style={tw`bg-white flex-1 p-4`}>
      {/* Header */}
      <View style={tw`mb-6`}>
        <Text style={tw`text-3xl font-bold text-gray-800`}>
          Welcome to{" "}
          <Text style={tw`text-3xl font-extrabold text-green-700`}>
            {profile?.organization?.name ?? "—"}
          </Text>
        </Text>

        <Text style={tw`text-2xl text-gray-800 mt-1`}>
          Greetings,{" "}
          <Text style={tw`text-red-700 text-2xl`}>{fullName || "—"}</Text>
        </Text>
      </View>

      {/* Attendance for this Month */}
      <View style={tw`bg-gray-50 rounded-2xl p-4 border border-gray-100`}>
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <Text style={tw`text-lg font-bold text-gray-800`}>
            Attendance for this Month
          </Text>

          <Pressable
            onPress={() => {
              // later: open month picker
            }}
            style={({ pressed }) => [
              tw`bg-blue-50 px-3 py-2 rounded-full border border-blue-100`,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={tw`text-blue-600 font-bold`}>📅 APR</Text>
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={tw`flex-row gap-3`}>
          {/* Present */}
          <View style={tw`flex-1 rounded-xl p-4 bg-green-100 items-center`}>
            <Text style={tw`text-3xl font-extrabold text-green-600`}>1</Text>
            <Text style={tw`text-gray-700 mt-1 font-semibold`}>Present</Text>
          </View>

          {/* Absent */}
          <View style={tw`flex-1 rounded-xl p-4 bg-red-100 items-center`}>
            <Text style={tw`text-3xl font-extrabold text-red-500`}>2</Text>
            <Text style={tw`text-gray-700 mt-1 font-semibold`}>Absents</Text>
          </View>

          {/* Late */}
          <View style={tw`flex-1 rounded-xl p-4 bg-yellow-100 items-center`}>
            <Text style={tw`text-3xl font-extrabold text-yellow-600`}>1</Text>
            <Text style={tw`text-gray-700 mt-1 font-semibold`}>Late in</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
