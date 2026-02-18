import { Text, View } from "react-native";
import React from "react";
import tw from "twrnc";

type Colors = "red" | "green" | "yellow" | "orange";

const capsuleConfig: Record<Colors, { bg: string; text: string }> = {
  red: { bg: "bg-red-500", text: "text-white" },
  green: { bg: "bg-green-500", text: "text-white" },
  yellow: { bg: "bg-yellow-300", text: "text-orange-900" },
  orange: { bg: "bg-orange-200", text: "text-amber-950" },
};
type CapsuleProps = {
  text: string | null;
  color: Colors;
};

const Capsule = ({ text, color }: CapsuleProps) => {
  const cfg = capsuleConfig[color];
  return (
    <View style={tw`px-3 py-1 rounded-full ${cfg.bg} self-start`}>
      <Text style={tw`text-sm ${cfg.text}`}>{text}</Text>
    </View>
  );
};

export default Capsule;
