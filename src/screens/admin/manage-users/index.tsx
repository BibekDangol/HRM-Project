import * as Clipboard from "expo-clipboard";

import { Copy, Plus, Search, X } from "lucide-react-native";
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
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { useDebounce } from "@/src/hooks/useDebounce";
import { fetchUsersService } from "@/src/services/admin.service";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { TW } from "@/theme/twStyles";
import tw from "twrnc";
import UserCard from "../components/UserCard";
import EditUserModal from "./EditUserModal";

const ManageUsers = () => {
  const { user, session } = useAuthStore();
  const token = session?.access_token;
  const { users, organizationName, userProfile, setUserProfile, setUsers } =
    useUsersStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRole, setEditRole] = useState<string>("user");
  const [editSupervisor, setEditSupervisor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const pendingUsers = users.filter((u) => u.status === "pending");
  const activeUsers = users.filter((u) => u.status === "active");

  const pendingCount = pendingUsers.length;
  const activeCount = activeUsers.length;

  const loadAdmin = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const profile = await fetchCurrentUserProfleService(user.id);
      setUserProfile(profile);

      const fetchedUsers = await fetchUsersService(
        profile.organization_id,
        debouncedSearchQuery
      );
      setUsers(fetchedUsers);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, [debouncedSearchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdmin();
    setRefreshing(false);
  };

  const handleAddUser = async (data: AddUserFormData) => {
    if (!token || !userProfile) {
      Alert.alert("Error", "Admin profile or session not ready");
      return;
    }

    try {
      const response = await apiClient.post("/admin-add-user", {
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        orgId: userProfile.organization_id,
        supervisor_id: data.supervisor_id,
      });

      if (!response.data.success) {
        Alert.alert("Error", response.data.error);
        return;
      }

      if (response.data.tempPassword)
        setTempPassword(response.data.tempPassword);

      const updatedUsers = await fetchUsersService(userProfile.organization_id);
      setUsers(updatedUsers);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditSupervisor(user.supervisor_id);
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (userId: string) => {
    if (!userProfile) return;
    try {
      const response = await apiClient.post("/admin-edit-user", {
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

      const updatedUsers = await fetchUsersService(userProfile.organization_id);
      setUsers(updatedUsers);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleDeleteUser = async (id?: string) => {
    if (!id || !userProfile || !token) return;
    try {
      const response = await apiClient.post("/hyper-api", { userId: id });
      if (!response.data.success)
        throw new Error(response.data.error || "Failed to delete user");

      Alert.alert("Deleted", "User deleted successfully");
      const updatedUsers = await fetchUsersService(userProfile.organization_id);
      setUsers(updatedUsers);
    } catch (err: any) { }
  };

  const getSupervisorName = (supervisorId?: string | null) => {
    if (!supervisorId) return "No supervisor yet";
    const supervisor = users.find((u) => u.id === supervisorId);
    return supervisor
      ? `${supervisor.first_name} ${supervisor.last_name}`.trim()
      : "Unknown Supervisor";
  };

  const isChanged =
    editRole !== editingUser?.role ||
    editSupervisor !== editingUser?.supervisor_id;

  return (
    <>
      <View style={tw`flex-1 ${TW.bgPrimary}`}>
        <KeyboardAvoidingView
          style={tw`flex-1`}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={tw`flex-1 mx-4 mt-8`}>
            <View style={tw`flex-col gap-4 mb-4`}>
              {/* Search */}
              <View
                style={tw`flex-row ${TW.bgButton} rounded-3xl px-4 py-2 items-center border ${TW.BORDER} justify-between`}
              >
                <Search size={18} color={TW.bgSecondary.replace("text-", "#")} />
                <TextInput
                  placeholder="Search users..."
                  placeholderTextColor={TW.textSecondary.replace("text-", "#")}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={[
                    tw`flex-1 ml-3 text-sm ${TW.textPrimary}`,
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
                    style={({ pressed }) => pressed && tw`opacity-70`}
                  >
                    <X
                      size={18}
                      color={TW.textSecondary.replace("text-", "#")}
                    />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => setShowAddModal(true)}
                  style={({ pressed }) => [
                    tw`h-11 w-11 rounded-2xl ${TW.bgSecondary} items-center justify-center`,
                    pressed && tw`opacity-85`,
                  ]}
                >
                  <Plus size={22} color="white" strokeWidth={2.5} />
                </Pressable>
              </View>
              {/* Tabs */}
              <View style={tw`flex-row rounded-2xl p-1`}>
                <Pressable
                  onPress={() => setActiveTab("pending")}
                  style={[
                    tw`flex-1 py-2.5 rounded-xl items-center`,
                    activeTab === "pending" && tw`${TW.bgAction}`,
                  ]}
                >
                  <Text
                    style={[
                      tw`text-sm font-semibold`,
                      activeTab === "pending"
                        ? tw`${TW.textButton}`
                        : { color: TW.textPrimary }, // raw hex
                    ]}
                  >
                    Pending{" "}
                    {pendingCount > 0 && (
                      <Text style={{ color: TW.textTertiary }}>({pendingCount})</Text>
                    )}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setActiveTab("active")}
                  style={[
                    tw`flex-1 py-2.5 rounded-xl items-center`,
                    activeTab === "active" && tw`${TW.bgAction}`,
                  ]}
                >
                  <Text
                    style={[
                      tw`text-sm font-semibold`,
                      activeTab === "active"
                        ? tw`${TW.textButton}`
                        : { color: TW.textPrimary },
                    ]}
                  >
                    Active{" "}
                    {activeCount > 0 && (
                      <Text style={{ color: TW.textTertiary }}>({activeCount})</Text>
                    )}
                  </Text>
                </Pressable>
              </View>
              <Text style={tw`text - xs ${TW.textSecondary}`}> {activeTab === "pending" ? pendingCount : activeCount} users found </Text>
            </View>
            {/* Users List */}
            <FlatList
              data={activeTab === "pending" ? pendingUsers : activeUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <UserCard
                  user={item}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  getSupervisorName={getSupervisorName}
                />
              )}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={tw`h-3`} />}
              refreshing={refreshing}
              onRefresh={onRefresh}
              ListEmptyComponent={
                loading ? (
                  <LoadingIndicator message="Loading Users" />
                ) : (
                  <View style={tw`items-center justify-center py-20`}>
                    <View
                      style={tw`h-16 w-16 rounded-full ${TW.bgCards} items-center justify-center mb-4`}
                    >
                      <Search size={26} color={TW.textSecondary.replace("text-", "#")} />
                    </View>
                    <Text style={tw`text-base font-semibold ${TW.textPrimary}`}>
                      No users found
                    </Text>
                    <Text style={tw`text-sm mt-1 ${TW.textSecondary}`}>
                      {activeTab === "pending"
                        ? "No pending users at the moment"
                        : "No active users at the moment"}
                    </Text>
                  </View>
                )
              }
            />
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Modals */}
      <AddUserModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        isSubmitting={false}
        supervisors={users}
        currentUserId={user?.id ?? ""}
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
        onSave={() => editingUser && handleSubmitEdit(editingUser.id)}
        isChanged={isChanged}
      />

      {/* Temp Password Modal */}
      {tempPassword && (
        <View style={tw`absolute inset-0 bg-black/50 items-center justify-end`}>
          <View style={tw`bg-white w-full rounded-t-3xl px-6 pt-4 pb-10`}>
            <View style={tw`items-center mb-5`}>
              <View style={tw`h-1 w-10 rounded-full bg-slate-200`} />
            </View>
            <Text style={tw`text-xl font-bold ${TW.textPrimary} mb-1`}>
              User Created
            </Text>
            <Text style={tw`text-sm ${TW.textSecondary} mb-5`}>
              Save this temporary password — it won’t be shown again.
            </Text>

            <View
              style={tw`bg-slate-50 border ${TW.BORDER} rounded-2xl px-4 py-4 mb-5`}
            >
              <Text style={tw`text-xs ${TW.textSecondary} mb-1`}>
                Temporary Password
              </Text>
              <Text
                selectable
                style={tw`text-lg font-bold ${TW.textPrimary} tracking-widest`}
              >
                {tempPassword}
              </Text>
            </View>

            <Pressable
              onPress={async () => {
                await Clipboard.setStringAsync(tempPassword);
                Alert.alert(
                  "Copied",
                  "Temporary password copied to clipboard"
                );
              }}
              style={({ pressed }) => [
                tw`flex-row items-center justify-center ${TW.bgSecondary} py-4 rounded-2xl mb-3`,
                pressed && tw`opacity-85`,
              ]}
            >
              <Copy size={18} color="white" />
              <Text style={tw`text-white font-bold ml-2`}>Copy Password</Text>
            </Pressable>

            <Pressable
              onPress={() => setTempPassword(null)}
              style={({ pressed }) => [
                tw`py-4 rounded-2xl border ${TW.BORDER} items-center`,
                pressed && tw`opacity-80`,
              ]}
            >
              <Text style={tw`font-semibold ${TW.textPrimary}`}>Done</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
};

export default ManageUsers;