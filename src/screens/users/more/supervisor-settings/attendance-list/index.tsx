import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";

import UserCard from "@/src/screens/admin/components/UserCard";
import { UserProfile } from "@/src/types/admin";
import { fetchSupervisorUnderUsersService } from "@/src/services/admin.service";
import tw from "twrnc";
import { useRouter } from "expo-router";
import { useUsersStore } from "@/src/store/useUsersStore";

const AttendanceUserList = () => {
  const router = useRouter();
  const { userProfile } = useUsersStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!userProfile?.id || !userProfile?.organization_id) return;
    try {
      setLoading(true);
      const data = await fetchSupervisorUnderUsersService(
        userProfile.organization_id,
        search,
        userProfile.id,
      );
      setUsers(data);
    } catch (err) {
      console.error("Error loading supervisor users:", err);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id, userProfile?.organization_id, search]);

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
        data={users}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={tw`text-center text-gray-500 mt-10`}>
            {loading ? "Loading..." : "No users found"}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.navigate({
                pathname:
                  "/(users)/more/supervisor-settings/attendance-list/attendance-details",
                params: {
                  userId: item.id,
                  name: `${item.first_name} ${item.last_name}`,
                },
              })
            }
          >
            <UserCard user={item} />
          </Pressable>
        )}
      />
    </View>
  );
};

export default AttendanceUserList;