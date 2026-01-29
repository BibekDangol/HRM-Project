import * as React from "react";
import { Text } from "@react-navigation/elements";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function LeavesScreen() {
  return (
    <SafeAreaView style={tw`flex-1 bg-[#F5F5F5] items-center justify-center`}>
      <Text>Leaves</Text>
    </SafeAreaView>
  );
}
