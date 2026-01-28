import * as React from "react";

import { useCallback, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView } from "react-native";

import { useAuthStore } from "@/store/useAuthStore";
import { Text } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

function AdminDashboardTab() {
  const signOut = useAuthStore((s) => s.signOut);
  const router = useRouter();

  const onLogout = async () => {
    try {
      await signOut();
      // Back to Login in your ROOT stack
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: "Login" }],
      // });
      router.push("/(auth)/login");
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? "Please try again.");
    }
  };
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // TODO: re-fetch your dashboard data here
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <SafeAreaView style={tw`flex-1 bg-[#F5F5F5]`}>
      <ScrollView
        contentContainerStyle={tw`px-4 pt-4 pb-8`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1F7A4D"
            colors={["#1F7A4D"]}
          />
        }
      >
        <Text style={tw`text-2xl font-extrabold text-gray-800`}>
          Hello, Admin
        </Text>

        <Pressable
          onPress={() => router.push("/manage-users")}
          style={({ pressed }: any) => [
            tw`h-[56px] rounded-2xl bg-[#1F7A4D] items-center justify-center mt-6`,
            pressed && tw`opacity-90`,
          ]}
        >
          <Text style={tw`text-white font-bold text-[18px]`}>Manage Users</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(users)/HomeScreen")}
          style={({ pressed }: any) => [
            tw`h-[56px] rounded-2xl bg-white border border-gray-200 items-center justify-center mt-3`,
            pressed && tw`opacity-90`,
          ]}
        >
          <Text style={tw`text-gray-900 font-bold text-[18px]`}>
            Go to Home
          </Text>
        </Pressable>

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [tw`mt-6`, pressed && tw`opacity-80`]}
        >
          <Text style={tw`text-[#1F7A4D] font-semibold underline`}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default AdminDashboardTab;
