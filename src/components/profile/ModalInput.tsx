import { TW } from "@/theme/twStyles";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";

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
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: "#6B7280",
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
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        placeholder={placeholder}
        placeholderTextColor="#C9D0D8"
        style={{
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: error ? TW.DANGER : focused ? TW.bgSecondary : "#E5E7EB",
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 13,
          fontSize: 15,
          fontWeight: "500",
          color: TW.textPrimary,
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
