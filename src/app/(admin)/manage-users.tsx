import * as Clipboard from "expo-clipboard";

import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AddUserModal, { AddUserFormData } from "../(admin)/AddUserModal";

import { apiClient } from "@/src/api/apiClient";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useUsersStore } from "@/src/store/useAdminsStore";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";

import UserCard from "@/src/screens/admin/components/UserCard";
import EditUserModal from "../(admin)/EditUserModal";

export type UserProfile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  organization_id: number;
  status?: string | null;
  organization?: { name: string | null };
  supervisor_id: string | null;
};
const ManageUsers = () => {
  const { users, fetchUsers, organizationName, fetchAdminProfile } =
    useUsersStore();
  const { adminProfile } = useUsersStore.getState();
  const [searchQuery, setSearchQuery] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRole, setEditRole] = useState<string>("user");
  const [editSupervisor, setEditSupervisor] = useState<string | null>(null);
  const pendingUsers = users.filter((u) => u.status === "pending");
  const activeUsers = users.filter((u) => u.status === "active");
  const pendingCount = pendingUsers.length;
  const activeCount = activeUsers.length;
  const { user } = useAuthStore();
  const { session } = useAuthStore.getState();

  const token = session?.access_token;
  // const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  // const fetchAdminProfile = async () => {
  //   if (!user) return;
  //   const { data, error } = await supabase
  //     .from("profiles")
  //     .select("id, organization_id")
  //     .eq("id", user.id)
  //     .single();
  //   if (error) {
  //     console.log("Admin profile fetching error", error);
  //     return;
  //   }
  //   setAdminProfile(data);
  // };
  // const fetchUsers = useCallback(async () => {
  //   if (!user?.id) return;
  //   if (!adminProfile?.organization_id) return;
  //   const orgId = adminProfile.organization_id;
  //   let query = supabase.from("profiles").select("id, first_name, last_name, email, role, status, organization_id, organization(name), supervisor_id");
  //   if (debouncedSearchQuery.trim() !== "") {
  //     const q = debouncedSearchQuery.trim().replace(/\s+/g, " ");
  //     query = query.or(
  //       `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
  //     ).neq("id", user.id);
  //   } else {
  //     query = query.eq("organization_id", orgId).neq("id", user.id);
  //   }
  //   const { data, error } = await query.limit(11);
  //   if (error) console.log("Fetch users error:", error);
  //   if (!data) {
  //     setUsers([]);
  //     console.log("No data returned");
  //     return;
  //   }
  //   const pendingUsers = data.filter(
  //     (u: UserProfile) => u.status === "pending",
  //   );
  //   const activeUsers = data.filter((u: UserProfile) => u.status === "active");
  //   setPendingUsers(pendingUsers);
  //   setActiveUsers(activeUsers);

  //   //or store all users
  //   setUsers(data || []);
  //   if (data && data.length > 0) {
  //     setAdminOrgName(data[0].organization.name ?? "");
  //   }
  // }, [adminProfile?.organization_id, user?.id, debouncedSearchQuery]);
  const handleAddUser = async (data: AddUserFormData) => {
    if (!user && !adminProfile) return;
    const { session } = useAuthStore.getState();
    if (!session || !adminProfile) {
      Alert.alert("Wait", "Admin profile loading");
      return;
    }
    if (!token) {
      Alert.alert("Error", "User is not logged in");
      return;
    }
    try {
      const response = await apiClient.post("/hyper-service", {
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        orgId: adminProfile.organization_id,
      });
      if (!response.data.success) {
        Alert.alert("Error", response.data.error);
        return;
      }
      if (response.data.success && response.data.tempPassword) {
        setTempPassword(response.data.tempPassword);
      }
      await fetchUsers();
    } catch (err: any) {
      Alert.alert("Errors", err.message);
    }
  };
  const handleEditUser = (user: UserProfile) => {
    setShowEditModal(true);
    setEditingUser(user);
    setEditRole(user.role);
    setEditSupervisor(user.supervisor_id);
  };
  const handleDeleteUser = async (id?: string) => {
    if (!id) return;
    if (!token) {
      Alert.alert("Error", "User is not logged in");
      return;
    }
    try {
      const response = await apiClient.post("/hyper-api", {
        userId: id,
      });
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to delete user");
      }
      Alert.alert("Deleted", "User deleted successfully");
      await fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error.message);
      return false;
    }
  };
  const handleSubmitEdit = async (userId: string) => {
    try {
      const response = await apiClient.post("/hyper-edit", {
        userId,
        role: editRole,
        supervisor_id: editSupervisor,
      });
      if (!response.data.success) {
        Alert.alert("Error", response.data.error);
        return;
      }
      Alert.alert("success", "user updated successfully");
      setShowEditModal(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };
  const getSupervisorName = (supervisorId?: string | null) => {
    if (!supervisorId) return "No supervisor yet";
    const supervisor = users.find((u) => u.id === supervisorId);
    return supervisor
      ? `${supervisor.first_name ?? ""} ${supervisor.last_name ?? ""}`.trim()
      : "Unknown Supervisor";
  };
  const isChanged =
    editRole !== editingUser?.role ||
    editSupervisor !== editingUser?.supervisor_id;
  useEffect(() => {
    if (!user?.id) return;
    fetchAdminProfile(user.id);
  }, [user?.id]);
  useEffect(() => {
    fetchUsers(debouncedSearchQuery);
  }, [debouncedSearchQuery]);
  return (
    <>
      <View style={tw`flex-1 bg-white`}>
        <KeyboardAvoidingView
          style={tw`flex-1`}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* my contents */}
          <View style={{ flex: 1 }}>
            {/* Header-> Add Button + search + Tabs */}
            <View style={tw`p-4`}>
              {/* //  Header */}
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <Text style={tw`text-2xl font-bold text-gray-900`}>
                  {organizationName}
                </Text>
                <TouchableOpacity
                  style={tw`bg-[#1F7A4D] w-12 h-12 rounded-full items-center justify-center`}
                  onPress={() => setShowAddModal(true)}
                >
                  <Ionicons name="add" size={26} color="white" />
                </TouchableOpacity>
              </View>
              {/* // Search */}
              <View
                pointerEvents="box-none"
                style={tw`flex-row bg-white rounded-xl px-3 py-2 items-center mb-4 shadow`}
              >
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                  placeholder="Search users..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={tw`flex-1 ml-2 text-base pr-4`}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPressIn={() => setSearchQuery("")}
                    style={tw`p-1`}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-outline" size={24} color="#94A3B8" />
                  </TouchableOpacity>
                )}
                {/* Search Result -> on main list*/}
              </View>
              {/* User count and pending and active list */}
              <View style={tw`mb-3`}>
                <View>
                  <Text style={tw`text-gray-600`}>
                    {activeTab === "pending" ? pendingCount : activeCount} Users
                  </Text>
                </View>
                <View style={tw`flex-row bg-gray-100 rounded-lg p-2 `}>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveTab("pending");
                    }}
                    style={tw`flex-1 py-2 rounded-md ${
                      activeTab === "pending" ? "bg-white shadow" : ""
                    }`}
                  >
                    <Text
                      style={tw`text-center font-medium ${
                        activeTab === "pending"
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      Pending
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab("active")}
                    style={tw`flex-1 py-2 rounded-md ${
                      activeTab === "active" ? "bg-white shadow" : ""
                    }`}
                  >
                    <Text
                      style={tw`text-center font-medium ${
                        activeTab === "active"
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      Active
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {/* Users list */}
            <FlatList
              data={activeTab === "pending" ? pendingUsers : activeUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <UserCard
                  user={item}
                  onEdit={handleEditUser}
                  getSupervisorName={getSupervisorName}
                  onDelete={handleDeleteUser}
                />
              )}
              contentContainerStyle={tw`p-4`}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </KeyboardAvoidingView>
      </View>
      <AddUserModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        isSubmitting={false}
      />
      <EditUserModal
        visible={showEditModal}
        user={editingUser}
        role={editRole}
        supervisor={editSupervisor}
        setRole={setEditRole}
        setSupervisor={setEditSupervisor}
        users={users}
        onClose={() => setShowEditModal(false)}
        onSave={() => {
          if (!editingUser) return;
          handleSubmitEdit(editingUser.id);
        }}
        isChanged={isChanged}
      />
      {tempPassword && (
        <View
          style={tw`absolute inset-0 bg-black/40 items-center justify-center`}
        >
          <View style={tw`bg-white p-6 rounded-xl w-4/5`}>
            <Text style={tw`text-xl font-bold mb-2 text-gray-900`}>
              User Created
            </Text>

            <Text style={tw`text-gray-500 mb-4`}>
              Temporary password (shown once)
            </Text>

            <View style={tw`bg-gray-100 p-3 rounded-lg mb-4`}>
              <Text selectable style={tw`font-mono text-center text-gray-800`}>
                {tempPassword}
              </Text>
            </View>

            <TouchableOpacity
              onPress={async () => {
                await Clipboard.setStringAsync(tempPassword);
                Alert.alert("Copied", "Temporary password copied to clipboard");
              }}
              style={tw`bg-blue-600 py-3 rounded-lg mb-2`}
            >
              <Text style={tw`text-white text-center font-semibold`}>
                Copy Password
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTempPassword(null)}
              style={tw`bg-green-500 py-3 rounded-lg`}
            >
              <Text style={tw`text-white text-center font-semibold`}>
                I have copied it
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

export default ManageUsers;
