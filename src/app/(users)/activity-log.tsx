import { ActivityLogSection } from "@/src/components/ActivityLog";
import { BackButton } from "@/src/components/BackButton";
import { router } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";

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
      >
        <ActivityLogSection hideTitle />
      </ScrollView>
    </View>
  );
}
