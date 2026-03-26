import { TW } from "@/theme/twStyles";
import { Text, View } from "react-native";

type Props = {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
  isLast?: boolean;
  locked?: boolean;
};

export default function InfoRow({
  icon,
  label,
  value,
  onPress,
  isLast,
  locked,
}: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 13,
        backgroundColor: "#ffffff",
        borderBottomWidth: isLast ? 0 : 0.5,
        borderBottomColor: "#E5E7EB",
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          backgroundColor: `${TW.bgSecondary}12`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 13,
        }}
      >
        {icon}
      </View>

      {/* Text Content */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: "#8d8d8d",
            letterSpacing: 0.3,
            marginBottom: 2,
          }}
        >
          {label}
        </Text>

        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: locked ? "#D3D3D3" : TW.bgSecondary,
            letterSpacing: 0.1,
          }}
          numberOfLines={1}
        >
          {value || "—"}
        </Text>
      </View>
    </View>
  );
}
