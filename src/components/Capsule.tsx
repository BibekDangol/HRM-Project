import { Text, View } from "react-native";

import React from "react";
import tw from "twrnc";

type Colors = "red" | "green" | "yellow" | "orange" | "gray" | "teal"; // added gray

const capsuleConfig: Record<Colors, { bg: string; text: string }> = {
  red: { bg: "bg-red-400", text: "text-white" },
  teal: { bg: "bg-[#1B4A5A]/50", text: "text-white" },
  green: { bg: "bg-green-500", text: "text-white" },
  yellow: { bg: "bg-yellow-300", text: "text-orange-900" },
  orange: { bg: "bg-orange-200", text: "text-amber-950" },
  gray: { bg: "bg-slate-100", text: "text-slate-500" }, // muted gray
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