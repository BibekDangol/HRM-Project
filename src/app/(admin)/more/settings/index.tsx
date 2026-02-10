import { Pressable, Text, View } from "react-native";

import { useRouter } from "expo-router";

export default function Settings() {
  const router = useRouter();
  return (
    <View>
      <Pressable onPress={() => router.push("/(admin)/more/settings/leave/add-leave-type")}>
        <Text>Add Leave types</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/(admin)/more/settings/leave")}>
        <Text>Update Type Limits</Text>
      </Pressable>
    </View>
  );
}
