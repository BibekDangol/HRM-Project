import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';

import { supabase } from '@/src/supabase/supabaseClient';
import { useRouter } from 'expo-router';
import tw from "twrnc";

export type AttendanceUser = {
  id: string;
  first_name: string | null;
  last_name: string | null;
}
const AdminUsersScreen = () => {
  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.from("profiles")
      .select("id, first_name, last_name")
      .then(({ data }) => setUsers(data ?? []))
  }, [])
  const filteredUsers = users.filter(u => u.first_name?.toLowerCase())
  return (
    <View style={tw`flex-1 bg-gray-100`}>
      {/* Search Bar */}
      <View style={tw`px-4 py-3`}>
        <TextInput
          placeholder="Search employee..."
          value={search}
          onChangeText={setSearch}
          style={tw`bg-white rounded-xl px-4 py-3 shadow text-gray-900`}
        />
      </View>
      {/* Users List */}
      <FlatList
        contentContainerStyle={tw`px-4 pb-6`}
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={tw`text-center text-gray-500 mt-10`}>No users found</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              tw`bg-white rounded-xl shadow p-4 mb-3 flex-row justify-between items-center`,
              pressed && tw`opacity-80`
            ]}
            onPress={() =>
              router.push({
                pathname: "/(admin)/AttendanceScreen",
                params: { userId: item.id, name: item.first_name },
              })
            }
          >
            <Text style={tw`text-gray-900 text-lg`}>
              {`${item.first_name ?? ""} ${item.last_name ?? ""}`}
            </Text>
          </Pressable>
        )}
      />
    </View>
  )
}

export default AdminUsersScreen
