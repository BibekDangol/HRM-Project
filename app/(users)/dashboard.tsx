import { Alert, ScrollView, Text, View } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import React, { useEffect, useState } from "react";
import tw from "twrnc";
import { supabase } from "@/supabase/supabaseClient";

type ProfileData = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  organization_id: number | null;
  organization?: { name: string | null } | null;
};
export default function HomeScreen() {
  // const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  // const signOut = useAuthStore.getState().signOut;
  // const handleLogout = async () => {
  //   await signOut();
  //   Alert.alert("success", "You have been logged out");
  //   router.push("/(auth)/login");
  // };

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, email, organization_id, organization(name)",
        )
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const p = data as unknown as ProfileData;
      setProfile(p);
    } catch (e: unknown) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to load profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  const fullName =
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();

  return (
    <ScrollView style={tw`bg-white flex-1 p-4 `}>
      {/* Header */}
      <View style={tw`mb-6`}>
        <Text style={tw`text-3xl font-bold text-gray-800`}>
          Welcome to{" "}
          <Text style={tw`mt-8 text-3xl font-extrabold text-green-700`}>
            {profile?.organization?.name ?? "—"}
          </Text>
        </Text>

        <Text style={tw`text-2xl text-gray-800`}>
          Greetings,{" "}
          <Text style={tw`text-red-700 text-2xl`}>
            {fullName || "—"}
          </Text>
        </Text>
        
      </View>
      

      {/* Menu */}
      {/* {menuItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={tw`bg-white rounded-xl p-4 mb-4 shadow`}
          onPress={() => console.log(`Navigate to ${item.title}`)}
        >
          <Text style={tw`text-xl font-semibold text-gray-800`}>
            {item.title}
          </Text>
          <Text style={tw`text-gray-500 mt-1`}>{item.description}</Text>
        </TouchableOpacity>
      ))} */}

      {/* Quick Action Buttons
      <View style={tw`mt-6`}>
        <Text style={tw`text-xl font-bold mb-2`}>Quick Actions</Text>
        <View style={tw`flex-row justify-between`}>
          <TouchableOpacity style={tw`bg-blue-500 rounded-xl p-4 flex-1 mr-2`}>
            <Text style={tw`text-white text-center font-semibold`}>
              Add Employee
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`bg-green-500 rounded-xl p-4 flex-1 ml-2`}>
            <Text style={tw`text-white text-center font-semibold`}>
              Mark Attendance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-green-500 rounded-xl p-4 flex-1 ml-2`}
            onPress={handleLogout}
          >
            <Text style={tw`text-white text-center font-semibold`}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View> */}
    </ScrollView>
  );
}
