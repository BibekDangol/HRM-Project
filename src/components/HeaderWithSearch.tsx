import { TW } from "@/theme/twStyles";
import { useRouter } from "expo-router";
import { ArrowLeft, Search, X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import tw from "twrnc";

export default function HeaderWithSearch() {
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const inputRef = useRef<TextInput>(null);

  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearch("");
    inputRef.current?.blur();
  };

  return (
    <View style={tw`flex-row items-center px-4 py-3 bg-white`}>
      {/* Back button */}
      <Pressable
        onPress={() => {
          if (isSearchOpen) {
            closeSearch();
          } else {
            router.back();
          }
        }}
        style={tw`w-10 h-10 items-center justify-center rounded-full mr-2`}
      >
        <ArrowLeft size={22} color="#1B4A5A" />
      </Pressable>

      {/* Middle / right area */}
      {isSearchOpen ? (
        <View
          style={[
            tw`flex-1 flex-row items-center rounded-xl px-3 py-2`,
            {
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E2E8F0",
            },
          ]}
        >
          <Search size={18} color={TW.bgSecondary} />

          <TextInput
            ref={inputRef}
            placeholder="Search..."
            placeholderTextColor={TW.bgSecondary}
            value={search}
            onChangeText={setSearch}
            style={[
              tw`flex-1 ml-2 text-base text-gray-900 justify-center`,
              { paddingVertical: 4 },
            ]}
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} style={tw`ml-2`}>
              <X size={18} color="#7AA5B2" />
            </Pressable>
          )}
        </View>
      ) : (
        <>
          {/* <View style={tw`flex-1`}></View> */}

          <Pressable
            onPress={openSearch}
            style={tw`w-10 h-10 items-end justify-center rounded-full flex-1`}
          >
            <Search size={22} color="#1B4A5A" />
          </Pressable>
        </>
      )}
    </View>
  );
}
