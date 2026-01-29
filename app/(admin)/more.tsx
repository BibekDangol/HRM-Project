import * as React from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { Text } from "@react-navigation/elements";

export default function MoreScreen() {
  const signOut = useAuthStore((s) => s.signOut);
  const router = useRouter();

  // React.useEffect(() => {
  //   (async () => {
  //     try {
  //       await signOut();
  //       router.replace("/(auth)/login");
  //     } catch (e: any) {
  //       Alert.alert("Logout failed", e?.message ?? "Please try again.");
  //       router.back();
  //     }
  //   })();
  // }, [signOut, router]);

  // return (
  //   <SafeAreaView style={tw`flex-1 bg-[#F5F5F5] items-center justify-center`}>
  //     <Text>Logging out...</Text>
  //   </SafeAreaView>
  // );
}
