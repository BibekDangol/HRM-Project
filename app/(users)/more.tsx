import * as React from "react";
import { Alert, Pressable } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { Text } from "@react-navigation/elements";

export default function UsersMoreScreen() {
  const signOut = useAuthStore((s) => s.signOut);
  const onLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? "Please try again.");
    }
  };
  return (
    <SafeAreaView>
    <Pressable
      onPress={onLogout}
      style={({ pressed }) => [tw`mt-6`, pressed && tw`opacity-80`]}
    >
      <Text style={tw`text-[#1F7A4D] font-semibold underline`}>Logout</Text>
    </Pressable>
    </SafeAreaView>
  );
}
