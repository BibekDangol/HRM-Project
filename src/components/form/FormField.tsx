import { colors } from "@/theme/colors";
import { useState } from "react";
import type { ReactNode } from "react";
import { Text, TextInput, View } from "react-native";
import type {
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from "react-native";

import { TW } from "@/theme/twStyles";
import tw from "@/theme/tw";

export type FormFieldVariant = "auth" | "outlined" | "filled";
export type FormFieldLabelVariant = "default" | "compact" | "uppercase";

export type FormFieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  variant?: FormFieldVariant;
  labelVariant?: FormFieldLabelVariant;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  rightAccessory?: ReactNode;
  leftAccessory?: ReactNode;
  forceErrorBorder?: boolean;
} & Pick<
  TextInputProps,
  | "secureTextEntry"
  | "keyboardType"
  | "autoCapitalize"
  | "autoCorrect"
  | "autoComplete"
  | "textContentType"
  | "returnKeyType"
  | "onSubmitEditing"
  | "multiline"
  | "editable"
  | "autoFocus"
  | "maxLength"
  | "numberOfLines"
  | "selectTextOnFocus"
  | "inputMode"
>;

const WRAPPER: Record<FormFieldVariant, string> = {
  auth: "bg-white rounded-xl px-4 min-h-[52px]",
  outlined: "bg-white rounded-xl px-4 min-h-[52px] border",
  filled: "bg-gray-100 rounded-2xl px-4 h-12",
};

const LABEL: Record<FormFieldLabelVariant, string> = {
  default: `${TW.textSecondary} font-semibold mb-2 text-sm`,
  compact: `text-sm font-semibold mb-1 ${TW.textSecondary}`,
  uppercase:
    "text-[13px] font-bold uppercase tracking-wide text-gray-500 mb-2",
};

export default function FormField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  placeholderTextColor = colors.subtle,
  variant = "auth",
  labelVariant = "default",
  containerStyle,
  inputStyle,
  labelStyle,
  rightAccessory,
  leftAccessory,
  forceErrorBorder = false,
  ...inputProps
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error || forceErrorBorder;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={[tw`${LABEL[labelVariant]}`, labelStyle]}>{label}</Text>
      ) : null}

      <View
        style={[
          tw`flex-row items-center`,
          tw`${WRAPPER[variant]}`,
          inputProps.multiline && tw`items-start min-h-[110px] py-3`,
          hasError && {
            borderWidth: 1.5,
            borderColor: TW.DANGER,
          },
          variant === "outlined" &&
            !hasError && {
              borderWidth: 1,
              borderColor: focused ? TW.bgSecondary : colors.border,
            },
        ]}
      >
        {leftAccessory}

        <TextInput
          accessibilityLabel={label ?? placeholder}
          aria-invalid={hasError}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          style={[
            tw`flex-1 text-[15px] ${TW.textPrimary}`,
            inputProps.multiline && tw`min-h-[96px] text-top`,
            inputProps.editable === false && tw`text-gray-500`,
            inputStyle,
          ]}
          {...inputProps}
        />

        {rightAccessory}
      </View>

      {error ? (
        <Text accessibilityRole="alert" style={tw`text-[13px] mt-1 ml-1 text-dangerText`}>{error}</Text>
      ) : null}
    </View>
  );
}
