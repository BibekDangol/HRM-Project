// components/InfoRow.tsx
import { Text, View } from "react-native";
import { ReactNode } from "react";
import tw from "twrnc";

interface InfoRowProps {
  label: string;
  value: string | ReactNode;
  badge?: boolean;
}

export default function InfoRow({ label, value, badge }: InfoRowProps) {
  if (badge) {
    // Horizontal layout for badge rows
    return (
      <View style={tw`flex-row items-center gap-4 mb-8`}>
        <Text style={tw`text-sm font-medium text-gray-700`}>{label}</Text>
        <View style={tw`px-3 py-1 rounded-full bg-yellow-100`}>
          <Text style={tw`text-yellow-700 text-xs font-semibold`}>{value}</Text>
        </View>
      </View>
    );
  }

  // Default vertical layout
  return (
    <View style={tw`mb-2`}>
      <Text style={tw`text-xs text-gray-500 mb-1`}>{label}</Text>
      <Text style={tw`text-sm font-medium`}>{value}</Text>
    </View>
  );
}
