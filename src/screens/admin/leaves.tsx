import { Search, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import tw from "twrnc";

export default function LeaveTab() {
  const [search, setSearch] = useState("");

  return (
    <View style={tw`flex-1 bg-[#FFFFFF]`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <ScrollView
            keyboardShouldPersistTaps="always"
            contentContainerStyle={tw`px-4 pt- pb-8`}
          >
            <View
              style={tw`mt-3 bg-white rounded-xl border border-[#E5E5E5] flex-row items-center px-3 h-12`}
            >
              <Search size={20} color="#9CA3AF" />
              <TextInput
                style={tw`flex-1 ml-2 text-[16px] text-[#0C0C0C]`}
                placeholder="Search employees..."
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {search.length > 0 ? (
                <X size={20} color="#9CA3AF" onPress={() => setSearch("")} />
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}
