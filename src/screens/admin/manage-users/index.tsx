import * as Clipboard from "expo-clipboard";

import {
  fetchAdminProfileService,
  fetchUsersService,
} from "@/src/services/admin.service";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import AddUserModal, { AddUserFormData } from "./AddUserModal";

import { apiClient } from "@/src/api/apiClient";
import { useDebounce } from "@/src/hooks/useDebounce";
import UserCard from "@/src/screens/admin/components/UserCard";
import { useUsersStore } from "@/src/store/useAdminsStore";
import { useAuthStore } from "@/src/store/useAuthStore";
import { UserProfile } from "@/src/types/admin";
import tw from "twrnc";
import EditUserModal from "./EditUserModal";
import { Copy, Plus, Search, X } from "lucide-react-native";

const ManageUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { users, organizationName, adminProfile, setAdminProfile, setUsers } =
    useUsersStore();
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
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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
      const users = await fetchUsersService(adminProfile.organization_id);
      setUsers(users);
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
    if (!id || !adminProfile) return;
    if (!token) {
      Alert.alert("Error", "User is not logged in");
      return;
    }
    try {
      const response = await apiClient.post("/hyper-api", { userId: id });
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to delete user");
      }
      Alert.alert("Deleted", "User deleted successfully");
      const users = await fetchUsersService(adminProfile.organization_id);
      setUsers(users);
    } catch (error: any) {
      console.error("Error deleting user:", error.message);
    }
  };

  const handleSubmitEdit = async (userId: string) => {
    if (!adminProfile) return;
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
      Alert.alert("Success", "User updated successfully");
      setShowEditModal(false);
      setEditingUser(null);
      const users = await fetchUsersService(adminProfile.organization_id);
      setUsers(users);
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
    const loadAdmin = async () => {
      try {
        const profile = await fetchAdminProfileService(user.id);
        setAdminProfile(profile);
        const users = await fetchUsersService(
          profile.organization_id,
          debouncedSearchQuery,
        );
        setUsers(users);
      } catch (err) {
        console.log("Init load error", err);
      }
    };
    loadAdmin();
  }, [user?.id]);

  return (
    <>
      <View style={tw`flex-1 bg-white`}>
        <KeyboardAvoidingView
          style={tw`flex-1`}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={tw`flex-1`}>
            {/* Header */}
            <View style={tw`px-5 pt-5 pb-3`}>
              <View style={tw`flex-row items-center justify-between mb-5`}>
                <View>
                  <Text style={tw`text-2xl font-bold text-slate-900`}>
                    {organizationName}
                  </Text>
                  <Text style={tw`text-sm text-slate-400 mt-0.5`}>
                    Manage your team members
                  </Text>
                </View>
                <Pressable
                  onPress={() => setShowAddModal(true)}
                  style={({ pressed }) => [
                    tw`h-11 w-11 rounded-2xl bg-green-700 items-center justify-center`,
                    pressed && tw`opacity-85`,
                  ]}
                >
                  <Plus size={22} color="white" strokeWidth={2.5} />
                </Pressable>
              </View>

              {/* Search */}
              <View
                style={tw`flex-row bg-slate-50 rounded-2xl px-4 items-center border border-slate-100`}
              >
                <Search size={18} color="#94a3b8" />
                <TextInput
                  placeholder="Search users..."
                  placeholderTextColor="#94a3b8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={[
                    tw`flex-1 ml-3 text-sm text-slate-900`,
                    {
                      paddingVertical: Platform.OS === "ios" ? 14 : 10,
                      paddingHorizontal: 0,
                    },
                  ]}
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => setSearchQuery("")}
                    hitSlop={10}
                    style={({ pressed }) => [pressed && tw`opacity-70`]}
                  >
                    <X size={18} color="#94a3b8" />
                  </Pressable>
                )}
              </View>

              {/* Tabs */}
              <View style={tw`flex-row mt-4 bg-slate-100 rounded-2xl p-1`}>
                <Pressable
                  onPress={() => setActiveTab("pending")}
                  style={[
                    tw`flex-1 py-2.5 rounded-xl items-center`,
                    activeTab === "pending" && tw`bg-white`,
                  ]}
                >
                  <Text
                    style={[
                      tw`text-sm font-semibold`,
                      activeTab === "pending"
                        ? tw`text-slate-900`
                        : tw`text-slate-400`,
                    ]}
                  >
                    Pending
                    {pendingCount > 0 && (
                      <Text style={tw`text-blue-600`}> ({pendingCount})</Text>
                    )}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setActiveTab("active")}
                  style={[
                    tw`flex-1 py-2.5 rounded-xl items-center`,
                    activeTab === "active" && tw`bg-white`,
                  ]}
                >
                  <Text
                    style={[
                      tw`text-sm font-semibold`,
                      activeTab === "active"
                        ? tw`text-slate-900`
                        : tw`text-slate-400`,
                    ]}
                  >
                    Active
                    {activeCount > 0 && (
                      <Text style={tw`text-blue-600`}> ({activeCount})</Text>
                    )}
                  </Text>
                </Pressable>
              </View>

              {/* Count */}
              <Text style={tw`text-xs text-slate-400 mt-3`}>
                {activeTab === "pending" ? pendingCount : activeCount} users
                found
              </Text>
            </View>

            {/* List */}
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
              contentContainerStyle={tw`px-5 pb-6`}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={tw`h-3`} />}
              ListEmptyComponent={
                <View style={tw`items-center justify-center py-20`}>
                  <View
                    style={tw`h-16 w-16 rounded-full bg-slate-100 items-center justify-center mb-4`}
                  >
                    <Search size={26} color="#94a3b8" />
                  </View>
                  <Text style={tw`text-slate-700 font-semibold text-base`}>
                    No users found
                  </Text>
                  <Text style={tw`text-slate-400 text-sm mt-1`}>
                    {activeTab === "pending"
                      ? "No pending users at the moment"
                      : "No active users at the moment"}
                  </Text>
                </View>
              }
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

      {/* Temp Password Modal */}
      {tempPassword && (
        <View style={tw`absolute inset-0 bg-black/50 items-center justify-end`}>
          <View style={tw`bg-white w-full rounded-t-3xl px-6 pt-4 pb-10`}>
            {/* Handle */}
            <View style={tw`items-center mb-5`}>
              <View style={tw`h-1 w-10 rounded-full bg-slate-200`} />
            </View>

            <Text style={tw`text-xl font-bold text-slate-900 mb-1`}>
              User Created
            </Text>
            <Text style={tw`text-sm text-slate-400 mb-5`}>
              Save this temporary password — it won&apos;t be shown again.
            </Text>

            {/* Password Box */}
            <View
              style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 mb-5`}
            >
              <Text style={tw`text-xs text-slate-400 mb-1`}>
                Temporary Password
              </Text>
              <Text
                selectable
                style={tw`text-lg font-bold text-slate-900 tracking-widest`}
              >
                {tempPassword}
              </Text>
            </View>

            <Pressable
              onPress={async () => {
                await Clipboard.setStringAsync(tempPassword);
                Alert.alert("Copied", "Temporary password copied to clipboard");
              }}
              style={({ pressed }) => [
                tw`flex-row items-center justify-center bg-blue-600 py-4 rounded-2xl mb-3`,
                pressed && tw`opacity-85`,
              ]}
            >
              <Copy size={18} color="white" />
              <Text style={tw`text-white font-bold ml-2`}>Copy Password</Text>
            </Pressable>

            <Pressable
              onPress={() => setTempPassword(null)}
              style={({ pressed }) => [
                tw`py-4 rounded-2xl border border-slate-200 items-center`,
                pressed && tw`opacity-80`,
              ]}
            >
              <Text style={tw`text-slate-700 font-semibold`}>Done</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
};

export default ManageUsers;
