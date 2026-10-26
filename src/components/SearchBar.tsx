import React, { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Search, X } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from "react-native";
import tw from "twrnc";

type HeaderWithSearchProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onBack?: () => void;
  loading?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
};

export default function HeaderWithSearch({
  search,
  onSearchChange,
  onBack,
  loading = false,
  autoFocus = false,
  placeholder = "Search by name...",
}: HeaderWithSearchProps) {
  const [text, setText] = useState(search);
  const isUserInput = useRef(false);

  const onSearchChangeRef = useRef(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  // Sync external prop → local state (only on parent-driven changes)
  // Sync effect: only reset the flag when it was actually consumed
  useEffect(() => {
    if (!isUserInput.current) {
      setText(search);
    } else {
      isUserInput.current = false; // ← reset INSIDE the else, not unconditionally
    }
  }, [search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChangeRef.current(text);
    }, 300);
    return () => clearTimeout(handler);
  }, [text]);

  const handleChangeText = useCallback((value: string) => {
    isUserInput.current = true;
    setText(value);
  }, []);

  // Clear is instant and does trim (empty string either way)
  const handleClear = useCallback(() => {
    isUserInput.current = false;
    setText("");
    onSearchChangeRef.current("");
  }, []);

  return (
    <View style={tw`flex-row items-center px-4 py-3 bg-white`}>
      {onBack && (
        <Pressable
          onPress={onBack}
          style={tw`mr-2`}
          hitSlop={10}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color="#333" />
        </Pressable>
      )}

      <View
        style={[
          tw`flex-1 flex-row items-center rounded-2xl px-3 h-11`,
          { backgroundColor: "#F5F7F8", borderWidth: 1, borderColor: "#D9E2E8" },
        ]}
      >
        <Search size={18} color="#7AA5B2" />

        <TextInput
          style={tw`flex-1 ml-2 text-base text-black`}
          placeholder={placeholder}
          value={text}
          onChangeText={handleChangeText}
          placeholderTextColor="#7AA5B2"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search input"
          onSubmitEditing={() => onSearchChangeRef.current(text.trim())} // trim only on submit
        />

        {loading ? (
          <ActivityIndicator size="small" color="#7AA5B2" />
        ) : text.length > 0 ? (
          <Pressable onPress={handleClear} hitSlop={10} accessibilityLabel="Clear search">
            <X size={18} color="#7AA5B2" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}