import { Search, X } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

import React from "react";
import tw from "twrnc";

type HeaderWithSearchProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onBack?: () => void;
};

export default function HeaderWithSearch({
  search,
  onSearchChange,
  onBack,
}: HeaderWithSearchProps) {
  return (
    <View style={tw`flex-row items-center px-4 py-3 bg-white`}>
      {/* <Pressable
        onPress={onBack}
        style={tw`w-10 h-10 items-center justify-center mr-2`}
      >
        <ChevronLeft size={22} color="#1B4A5A" />
      </Pressable> */}

      <View
        style={[
          tw`flex-1 flex-row items-center rounded-2xl px-3 h-11`,
          {
            backgroundColor: "#F5F7F8",
            borderWidth: 1,
            borderColor: "#D9E2E8",
          },
        ]}>
        <Search size={18} color="#7AA5B2" />

        <TextInput
          placeholder="Search..."
          value={search}
          onChangeText={onSearchChange}
          placeholderTextColor="#7AA5B2"
          style={tw`flex-1 ml-2 text-base text-black`}
        />

        {search.length > 0 && (
          <Pressable onPress={() => onSearchChange("")}>
            <X size={18} color="#7AA5B2" />
          </Pressable>
        )}
      </View>
    </View>
  );
}
