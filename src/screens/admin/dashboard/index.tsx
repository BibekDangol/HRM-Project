import * as React from "react";

import { CircleCheckBig, User } from "lucide-react-native";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { fetchAdminProfileService, fetchUsersService } from "@/src/services/admin.service";
import { useEffect, useState } from "react";

import StatCard from "@/src/screens/admin/components/StatCard";
import tw from "twrnc";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useAdminsStore";

export default function DashboardScreen() {
  const { setAdminProfile, users, setUsers } = useUsersStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const totalusers = users.length;
  const loadUsers = async () => {
    if (!user) return;
    const profile = await fetchAdminProfileService(user.id);
    setAdminProfile(profile);
    const res = await fetchUsersService(profile.organization_id);
    setUsers(res);
  }
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();   // reuse your existing function
    setRefreshing(false);
  };

  useEffect(() => {
    loadUsers();
  }, [])
  return (
    <View style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`px-4 pt-6 pb-10`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1F7A4D"]}      // Android spinner color
            tintColor="#1F7A4D"       // iOS spinner color
          />
        }>
        <Text style={tw`mb-2 font-bold text-xl`}>Dashboard</Text>
        {/* Stats */}
        <View style={tw`flex-row flex-wrap justify-between bg`}>
          <StatCard
            title="Total Employees"
            value={totalusers}
            icon={<User size={24} color="white" />}
          />
          <StatCard
            title="Total Projects"
            value={1}
            icon={<CircleCheckBig size={24} color="white" />}
          />
        </View>

        <View style={tw`bg-gray-50 rounded-2xl p-4 shadow-sm`}>
          <Text style={tw`mb-2 text-lg font-bold text-gray-800`}>
            Incoming Holidays
          </Text>
          <Text style={tw`text-gray-600`}>Date and why</Text>
        </View>
      </ScrollView>
    </View>
  );
}
