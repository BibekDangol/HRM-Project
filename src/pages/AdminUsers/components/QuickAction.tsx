import { Pressable, Text } from "react-native";

import React from "react";
import tw from "twrnc";

export default function QuickAction({ label, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        tw`bg-white flex-1 mr-2 rounded-xl p-4 items-center shadow-sm`,
        pressed && tw`opacity-80`,
      ]}
    >
      <Text style={tw`font-semibold text-gray-800`}>{label}</Text>
    </Pressable>
  );
}
