import * as React from "react";
import { Text } from "@react-navigation/elements";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function UsersLeave() {
  return (
    <SafeAreaView style={tw`flex-1 bg-white items-center justify-center`}>
      <Text>Leaves</Text>
    </SafeAreaView>
  );
}