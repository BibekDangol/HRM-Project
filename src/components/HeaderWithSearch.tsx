import { ArrowLeft, Search, X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    onSearchChange("");
    inputRef.current?.blur();
  };

  const searchFn = (str: unknown) => {
    console.log("🚀 ~ searchFn ~ str:", str);
  };

  return (
    <View style={tw`flex-row items-center px-4 py-3 bg-white`}>
      {/* Back button */}
      <Pressable
        onPress={() => {
          if (isSearchOpen) closeSearch();
          else onBack?.();
        }}
        style={tw`w-10 h-10 items-center justify-center rounded-full mr-2`}>
        <ArrowLeft size={22} color="#1B4A5A" />
      </Pressable>

      {isSearchOpen ? (
        <View
          style={tw`flex-1 flex-row items-center rounded-xl px-3 py-2 border border-gray-300`}>
          <Search size={18} color="#7AA5B2" />
          <TextInput
            ref={inputRef}
            placeholder="Search..."
            value={search}
            onChangeText={onSearchChange}
            style={tw`flex-1 ml-2 text-base`}
          />
          {search.length > 0 && (
            <Pressable onPress={() => onSearchChange("")}>
              <X size={18} color="#7AA5B2" />
            </Pressable>
          )}
        </View>
      ) : (
        <Pressable
          onPress={openSearch}
          style={tw`w-10 h-10 items-end justify-center flex-1`}>
          <Search size={22} color="#1B4A5A" />
        </Pressable>
      )}
    </View>
  );
}
