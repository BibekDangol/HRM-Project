import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

import { fetchUsersService } from "@/src/services/admin.service";
import { useUsersStore } from "@/src/store/useUsersStore";
import { UserProfile } from "@/src/types/admin";
import { useRouter } from "expo-router";
import tw from "twrnc";
import { UserCard } from "../../components/UserCard";
import HeaderWithSearch from "@/src/components/HeaderWithSearch";

const AttendanceUserList = () => {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const { userProfile } = useUsersStore();
  const filteredUsers = users.filter((u) => u.first_name?.toLowerCase());
  const getSupervisorName = () => "No supervisor";

  const loadUsers = useCallback(async () => {
    if (!userProfile?.id) return;
    try {
      const usersData = await fetchUsersService(
        userProfile.organization_id,
        search,
      );
      setUsers(usersData);
    } catch (err) {}
  }, [userProfile?.id, userProfile?.organization_id, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <>
      <View style={tw`flex-1 bg-white`}>
        {/* Search Bar */}
        <HeaderWithSearch />
        {/* Users List */}
        <FlatList
          contentContainerStyle={tw`px-4 pb-6 flex gap-4`}
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={tw`text-center text-gray-500 mt-10`}>
              No users found
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.navigate({
                  pathname: "/(admin)/more/attendance-list/attendance-details",
                  params: {
                    userId: item.id,
                    name: item.first_name + " " + item.last_name,
                  },
                })
              }
            >
              <UserCard user={item} getSupervisorName={getSupervisorName} />
            </Pressable>
          )}
        />
      </View>
    </>
  );
};

export default AttendanceUserList;
