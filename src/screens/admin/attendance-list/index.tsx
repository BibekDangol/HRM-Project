import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';

import { fetchUsersService } from '@/src/services/admin.service';
import { useUsersStore } from '@/src/store/useAdminsStore';
import { useRouter } from 'expo-router';
import tw from "twrnc";
import UserCard from '../components/UserCard';
import { UserProfile } from '../manage-users';

const AttendanceUserList = () => {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");

  const { adminProfile } = useUsersStore();
  const filteredUsers = users.filter(u => u.first_name?.toLowerCase())
  const getSupervisorName = () => "No supervisor";

  const loadUsers = useCallback(async () => {
    if (!adminProfile?.id) return;
    try {
      const usersData = await fetchUsersService(adminProfile.organization_id, search);
      setUsers(usersData);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  }, [adminProfile, search])

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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
          <Text style={tw`text-center text-gray-500 mt-10`}>No users found</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(admin)/attendance-list/attendance-details?userId=${item.id}&name=${item.first_name + " " + item.last_name}`)}
          >
            <UserCard user={item} getSupervisorName={getSupervisorName} />
          </Pressable>
        )}
      />
    </View>
  )
}

export default AttendanceUserList
