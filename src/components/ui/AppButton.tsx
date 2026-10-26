import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

import { TW } from "@/theme/twStyles";
import tw from "twrnc";

export type AppButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type AppButtonSize = "sm" | "md" | "lg";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  loadingTitle?: string;
  disabled?: boolean;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const CONTAINER: Record<AppButtonVariant, string> = {
  primary: TW.bgAction,
  secondary: "bg-white border border-gray-200",
  ghost: "bg-transparent",
  danger: "bg-red-500",
};

const TITLE: Record<AppButtonVariant, string> = {
  primary: TW.textButton,
  secondary: TW.textPrimary,
  ghost: TW.textPrimary,
  danger: "text-white",
};

const SIZE: Record<AppButtonSize, string> = {
  sm: "h-10 px-4",
  md: "h-12 px-5",
  lg: "h-14 px-6",
};

const TEXT_SIZE: Record<AppButtonSize, string> = {
  sm: "text-sm",
  md: "text-[15px]",
  lg: "text-lg",
};

export default function AppButton({
  title,
  onPress,
  loading = false,
  loadingTitle,
  disabled = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  style,
  textStyle,
}: Props) {
  const inactive = disabled || loading;
  const spinnerColor =
    variant === "primary" || variant === "danger" ? "#FFFFFF" : TW.bgSecondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        tw`rounded-xl items-center justify-center flex-row gap-2`,
        tw`${CONTAINER[variant]}`,
        tw`${SIZE[size]}`,
        fullWidth && tw`w-full`,
        inactive && tw`opacity-70`,
        pressed && !inactive && tw`opacity-85`,
        style,
      ]}
    >
      <View style={tw`flex-row items-center gap-2`}>
        {loading ? (
          <ActivityIndicator size="small" color={spinnerColor} />
        ) : (
          icon
        )}
        <Text
          style={[
            tw`font-semibold ${TITLE[variant]} ${TEXT_SIZE[size]}`,
            textStyle,
          ]}
        >
          {loading ? loadingTitle ?? title : title}
        </Text>
      </View>
    </Pressable>
  );
}
