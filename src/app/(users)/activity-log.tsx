import { ScrollView, View } from "react-native";

import { ActivityLogSection } from "@/src/components/ActivityLog";
import { BackButton } from "@/src/components/BackButton";
import React from "react";
import { router } from "expo-router";

export default function ActivityLogPage() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Outside ScrollView = fixed on screen, won't scroll */}
      <BackButton floating onPress={() => router.back()} />

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
