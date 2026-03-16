import React from "react";
import { Platform, Text, View } from "react-native";
import { TW } from "@/theme/twStyles";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function Section({ title, children }: Props) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: "#",
          letterSpacing: 0.9,
          textTransform: "uppercase",
          marginBottom: 8,
          marginLeft: 2,
        }}
      >
        {title}
      </Text>

      <View
        style={[
          {
            borderRadius: 16,
            backgroundColor: TW.bgPrimary,
            borderWidth: 1,
            borderColor: "#fff",
          },
          Platform.OS === "ios"
            ? {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
              }
            : { elevation: 1 },
        ]}
      >
        <View style={{ borderRadius: 15, overflow: "hidden" }}>{children}</View>
      </View>
    </View>
  );
}
