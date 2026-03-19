import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import HeaderWithSearch from "@/src/components/HeaderWithSearch";
import LoadingIndicator from "@/src/components/LoadingIndicator"; // 👈 create or import a loading spinner
import { fetchUsersService } from "@/src/services/admin.service";
import { useUsersStore } from "@/src/store/useUsersStore";
import { UserProfile } from "@/src/types/admin";
import { useRouter } from "expo-router";
import tw from "twrnc";
import { UserCard } from "../../components/UserCard";

const AttendanceUserList = () => {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true); // 👈 loading state
  const { userProfile } = useUsersStore();

  const filteredUsers = users.filter((u) =>
    u.first_name?.toLowerCase().includes(search.toLowerCase()),
  );
  const getSupervisorName = () => "No supervisor";

  const loadUsers = useCallback(async () => {
    if (!userProfile?.id) return;

    setLoading(true); // start loading
    try {
      const usersData = await fetchUsersService(
        userProfile.organization_id,
        search,
      );
      setUsers(usersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // stop loading
    }
  }, [userProfile?.id, userProfile?.organization_id, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Search Bar */}
      <HeaderWithSearch
        search={search}
        onSearchChange={setSearch}
        onBack={() => router.back()}
      />

      {/* Users List */}
      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <LoadingIndicator message="Loading Users..." />
        </View>
      ) : (
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
              }>
              <UserCard user={item} getSupervisorName={getSupervisorName} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
};

export default AttendanceUserList;
