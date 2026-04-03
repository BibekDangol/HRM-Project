import { ScrollView, View } from "react-native";

import { ActivityLogSection } from "@/src/components/RecentActivity";
import React from "react";

export default function ActivityLogPage() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Outside ScrollView = fixed on screen, won't scroll */}
      {/* <BackButton
        floating
        color={TW.bgSecondary}
        backgroundColor="rgba(27,74,90,0.08)"
        style={{ marginBottom: 16 }}
        onPress={() => router.back()}
      /> */}

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ActivityLogSection hideTitle />
      </ScrollView>
    </View>
  );
}
