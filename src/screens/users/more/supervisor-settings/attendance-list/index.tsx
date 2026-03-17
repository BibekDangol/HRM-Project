import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";

import { UserProfile } from "@/src/types/admin";
import { fetchSupervisorUnderUsersService } from "@/src/services/admin.service";
import tw from "twrnc";
import { useRouter } from "expo-router";
import { useUsersStore } from "@/src/store/useUsersStore";
import HeaderWithSearch from "@/src/components/HeaderWithSearch";
import { UserCard } from "@/src/screens/admin/components/UserCard";

const AttendanceUserList = () => {
  const router = useRouter();
  const { userProfile } = useUsersStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const getSupervisorName = () => "No supervisor";
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
    <View style={tw`flex-1 bg-white`}>
      {/* Search Bar */}
      <HeaderWithSearch />
      {/* Users List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          tw`px-4 pt-2 pb-6`,
          users.length === 0 ? tw`flex-grow justify-center` : undefined,
        ]}
        ItemSeparatorComponent={() => <View style={tw`h-3`} />}
        ListEmptyComponent={
          <View style={tw`items-center justify-center py-16`}>
            <Text style={tw`text-base text-gray-500`}>
              {loading ? "Loading..." : "No users found"}
            </Text>
          </View>
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
            style={tw`rounded-2xl overflow-hidden`}
          >
            <UserCard user={item} getSupervisorName={getSupervisorName} />
          </Pressable>
        )}
      />
    </View>
  );
};

export default AttendanceUserList;
