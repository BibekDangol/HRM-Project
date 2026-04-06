import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import HeaderWithSearch from "@/src/components/HeaderWithSearch";
import LoadingIndicator from "@/src/components/LoadingIndicator"; 
import { useDebounce } from "@/src/hooks/useDebounce";
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
  const [loading, setLoading] = useState(true); 
  const { currentUserProfile  } = useUsersStore();
  const debouncedSearchQuery = useDebounce(search, 300);
  // const filteredUsers = users.filter((u) =>
  //   u.first_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
  // );
  const getSupervisorName = () => "No supervisor";

  const loadUsers = useCallback(async () => {
    if (!currentUserProfile ?.id) return;

    setLoading(true); // start loading
    try {
      const usersData = await fetchUsersService(
        currentUserProfile .organization_id,
        debouncedSearchQuery,
      );
      setUsers(usersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUserProfile ?.id, currentUserProfile ?.organization_id, debouncedSearchQuery]);

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

      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <LoadingIndicator message="Loading Users..." />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={tw`px-4 pb-6 flex gap-4`}
          data={users}
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
              <UserCard
                user={item}
                getSupervisorName={getSupervisorName}
                showRightArrow
              />
              {/* <ChevronRight size={20} color="#9ca3af" /> show right arrow in user card onnly from this page*/}
            </Pressable>
          )}
        />
      )}
    </View>
  );
};

export default AttendanceUserList;
