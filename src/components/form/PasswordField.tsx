import { colors } from "@/theme/colors";
import { useState } from "react";
import { Pressable } from "react-native";

import { Eye, EyeClosed } from "lucide-react-native";
import tw from "@/theme/tw";

import FormField, { FormFieldProps } from "./FormField";

type Props = Omit<FormFieldProps, "secureTextEntry" | "rightAccessory"> & {
  iconSize?: number;
  iconColor?: string;
};

export default function PasswordField({
  iconSize = 22,
  iconColor = colors.subtle,
  ...props
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      {...props}
      secureTextEntry={!visible}
      autoCapitalize={props.autoCapitalize ?? "none"}
      autoCorrect={props.autoCorrect ?? false}
      rightAccessory={
        <Pressable
          onPress={() => setVisible((value) => !value)}
          hitSlop={10}
          style={tw`min-w-[48px] min-h-[48px] items-center justify-center`}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <Eye size={iconSize} color={iconColor} />
          ) : (
            <EyeClosed size={iconSize} color={iconColor} />
          )}
        </Pressable>
      }
    />
  );
}
