import { Pressable, Text, View } from "react-native";

type Props = {
  title: string;
  children: React.ReactNode;
  onRightPress?: () => void;
  rightText?: string;
};

export default function Section({
  title,
  children,
  onRightPress,
  rightText,
}: Props) {
  return (
    <View style={{ marginBottom: 5 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            letterSpacing: 1,
            color: "#6B7280",
          }}
        >
          {title.toUpperCase()}
        </Text>

        {rightText && (
          <Pressable onPress={onRightPress}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#6B7280",
              }}
            >
              {rightText}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Content */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        {children}
      </View>
    </View>
  );
}
