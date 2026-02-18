import React from "react";
import { Pressable, Text, View } from "react-native";
import { Clock } from "lucide-react-native";
import tw from "twrnc";
import { useRouter } from "expo-router";

export default function UsersMoreScreen() {
  const router = useRouter();

  return (
    <View style={tw`flex-1 bg-white px-6 items-center justify-center`}>
      <View
        style={tw`h-20 w-20 rounded-full bg-slate-100 items-center justify-center`}
      >
        <Clock size={34} color="#0f172a" />
      </View>

      <Text style={tw`mt-5 text-2xl font-bold text-slate-900`}>
        Coming Soon
      </Text>

      <Text style={tw`mt-2 text-slate-500 text-center`}>
        We&apos;re working on this page. It&apos;ll be available in a future
        update.
      </Text>

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          tw`border border-red-200 px-6 py-3 rounded-xl items-center m-5`,
          pressed && tw`opacity-80`,
        ]}
      >
        <Text style={tw`text-red-600 font-semibold`}>Go Back</Text>
      </Pressable>
    </View>
  );
}
