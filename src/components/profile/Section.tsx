import { colors } from "@/theme/colors";
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
            color: colors.muted,
          }}
        >
          {title.toUpperCase()}
        </Text>

        {rightText && (
          <Pressable
            accessibilityRole="button"
            onPress={onRightPress}
            style={{ minHeight: 48, paddingHorizontal: 8, justifyContent: "center" }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.muted,
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
          backgroundColor: colors.surface,
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {children}
      </View>
    </View>
  );
}
