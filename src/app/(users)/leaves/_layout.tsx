import { router, Stack } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [
        {
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 2,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <ArrowLeft size={26} color="#0f172a" />
    </Pressable>
  );
}

const sharedHeaderOptions = {
  headerShown: true,
  title: "",
  headerShadowVisible: false,
  headerStyle: { backgroundColor: "#ffffff" },
};

export default function LeavesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="edit" />
      <Stack.Screen
        name="calendar/index"
        options={{
          ...sharedHeaderOptions,
          headerLeft: () => (
            <BackButton onPress={() => router.replace("/(users)/leaves/(tabs)/requests")} />
          ),
        }}
      />
      <Stack.Screen
        name="calendar/apply/index"
        options={{
          ...sharedHeaderOptions,
          headerLeft: () => (
            <BackButton onPress={() => router.replace("/(users)/leaves/calendar")} />
          ),
        }}
      />
    </Stack>
  );
}