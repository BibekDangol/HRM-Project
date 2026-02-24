import { Settings } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import tw from "twrnc";

interface Props {
  onSettingsPress: () => void;
}

export function CalendarHeader({ onSettingsPress }: Props) {
  return (
    <View style={tw`flex-row items-center justify-between p-5`}>
      <Text style={tw`text-2xl font-extrabold text-slate-900`}>
        Calendar Admin
      </Text>
      <Pressable
        onPress={onSettingsPress}
        hitSlop={10}
        style={({ pressed }) => [
          tw`items-center justify-center`,
          pressed && tw`opacity-70`,
        ]}
      >
        <Settings />
      </Pressable>
    </View>
  );
}
