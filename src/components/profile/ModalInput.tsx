import React from "react";
import { Text, TextInput, View } from "react-native";
import { TW } from "@/theme/twStyles";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
};

export default function ModalInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
}: Props) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: TW.textSecondary,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          marginBottom: 7,
        }}
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#C9D0D8"
        style={{
          backgroundColor: error ? "#FEF2F2" : TW.BORDER,
          borderWidth: 1,
          borderColor: error ? TW.DANGER : TW.BORDER,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 13,
          fontSize: 15,
          fontWeight: "500",
          color: TW.bgSecondary,
        }}
      />

      {!!error && (
        <Text
          style={{
            fontSize: 12,
            color: TW.DANGER,
            fontWeight: "500",
            marginTop: 5,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
