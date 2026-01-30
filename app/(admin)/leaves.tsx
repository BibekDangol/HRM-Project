import React, { useState } from "react";
import { ScrollView, Text, View, TextInput } from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";

export default function LeaveTab() {
  const [search, setSearch] = useState("");

  return (
    <View style={tw`flex-1 bg-[#FFFFFF]`}>
      <ScrollView contentContainerStyle={tw`px-4 pt- pb-8`}>
        <View
          style={tw`mt-3 bg-white rounded-xl border border-[#E5E5E5] flex-row items-center px-3 h-12`}

        >
          <Ionicons name="search" size={20} color="#9CA3AF" />
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
            <Ionicons
              name="close-circle"
              size={20}
              color="#9CA3AF"
              onPress={() => setSearch("")}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
