import type { ReactNode } from "react";
import { Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import AppButton from "@/src/components/ui/AppButton";
import { TW } from "@/theme/twStyles";
import tw from "@/theme/tw";

type Props = {
  icon?: ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
  style,
}: Props) {
  return (
    <View
      style={[
        compact
          ? tw`items-center justify-center py-6`
          : tw`items-center justify-center py-16 px-6`,
        style,
      ]}
    >
      {icon ? <View style={tw`mb-3`}>{icon}</View> : null}
      <Text style={tw`text-base font-semibold ${TW.textPrimary} text-center`}>
        {title}
      </Text>
      {message ? (
        <Text style={tw`text-sm ${TW.textSecondary} text-center mt-1`}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          size="sm"
          style={tw`mt-4`}
        />
      ) : null}
    </View>
  );
}
