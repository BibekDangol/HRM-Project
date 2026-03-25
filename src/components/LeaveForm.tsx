import React from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    View,
} from "react-native";

export default function LeaveForm() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 20 }}>
          <TextInput
            placeholder="Write reason..."
            multiline
            textAlignVertical="top"
            style={{
              minHeight: 120,
              borderWidth: 1,
              borderColor: "#D1D5DB",
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              backgroundColor: "#FFFFFF",
              fontSize: 14,
              color: "#111827",
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
