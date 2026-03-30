import { Pressable, Text } from "react-native";

export function FAB({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#1B4A5A",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <Text style={{ color: "#fff", fontSize: 24 }}>+</Text>
    </Pressable>
  );
}
