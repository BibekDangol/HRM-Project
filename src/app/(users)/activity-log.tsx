import { ScrollView, View } from "react-native";

import { ActivityLogSection } from "@/src/components/ActivityLog";
import { BackButton } from "@/src/components/BackButton";
import { TW } from "@/theme/twStyles";
import { router } from "expo-router";
import React from "react";

export default function ActivityLogPage() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Outside ScrollView = fixed on screen, won't scroll */}
      <BackButton
        floating
        color={TW.bgSecondary}
        backgroundColor="rgba(27,74,90,0.08)"
        style={{ marginBottom: 16 }}
        onPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 64, // ← space so content doesn't hide under button
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ActivityLogSection hideTitle />
      </ScrollView>
    </View>
  );
}
