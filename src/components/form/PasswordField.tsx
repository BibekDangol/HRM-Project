import { useState } from "react";
import { Pressable } from "react-native";

import { Eye, EyeClosed } from "lucide-react-native";
import tw from "twrnc";

import FormField, { FormFieldProps } from "./FormField";

type Props = Omit<FormFieldProps, "secureTextEntry" | "rightAccessory"> & {
  iconSize?: number;
  iconColor?: string;
};

export default function PasswordField({
  iconSize = 22,
  iconColor = "#7e7e7e",
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
          style={tw`pl-2`}
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
