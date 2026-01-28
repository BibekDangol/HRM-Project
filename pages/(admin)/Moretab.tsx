import { useAuthStore } from "@/store/useAuthStore";
import { useNavigation } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

function MoreTab() {
  const signOut = useAuthStore((s) => s.signOut);
  const navigation = useNavigation<any>();

  const onLogout = async () => {
    try {
      await signOut();
      // Back to Login in your ROOT stack
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? "Please try again.");
    }
  };
  return (
    <SafeAreaView>
      <ScrollView>
        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [tw`mt-6`, pressed && tw`opacity-80`]}
        >
          <Text style={tw`text-[#1F7A4D] font-semibold`}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default MoreTab;
