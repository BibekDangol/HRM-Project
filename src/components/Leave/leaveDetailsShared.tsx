import { colors } from "@/theme/colors";
import { Text, View } from "react-native";
import tw from "@/theme/tw";

export type StatusConfigValue = { bg: string; text: string; label: string };

export type StatusConfig = Record<string, StatusConfigValue>;

// Presentational label + value block shared by the leave detail screens.
// Lives here (instead of a screen file) so presentational components can
// import it without creating a screen <-> component require cycle.
export function LabelValue({
  label,
  value,
  labelStyle,
  valueStyle,
  containerStyle,
}: {
  label: string;
  value: string | number;
  labelStyle?: object;
  valueStyle?: object;
  containerStyle?: object;
}) {
  return (
    <View style={[{ paddingVertical: 12 }, containerStyle]}>
      <Text style={[tw`text-sm`, { color: colors.muted }, labelStyle]}>
        {label}
      </Text>
      <Text
        style={[tw`text-sm font-semibold`, { color: colors.ink }, valueStyle]}>
        {value}
      </Text>
    </View>
  );
}
