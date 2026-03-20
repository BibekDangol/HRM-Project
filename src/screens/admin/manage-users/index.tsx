import * as Clipboard from "expo-clipboard";

import { Copy, Plus, Search } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import AddUserModal, { AddUserFormData } from "./AddUserModal";

import { apiClient } from "@/src/api/apiClient";
import HeaderWithSearch from "@/src/components/HeaderWithSearch";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { useDebounce } from "@/src/hooks/useDebounce";
import { fetchUsersService } from "@/src/services/admin.service";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { TW } from "@/theme/twStyles";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "twrnc";
import { UserCard } from "../components/UserCard";
import EditUserModal from "./EditUserModal";

const PAGE_SIZE = 10;

const ManageUsers = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, session } = useAuthStore();
  const token = session?.access_token;
  const { users, userProfile, setUserProfile, setUsers } = useUsersStore();

  const [search, setSearch] = useState("");
  const debouncedSearchQuery = useDebounce(search, 300);
  const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");
  const [currentPage, setCurrentPage] = useState(1);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearchQuery]);

  const tabUsers = activeTab === "pending" ? pendingUsers : activeUsers;
  const totalPages = Math.max(1, Math.ceil(tabUsers.length / PAGE_SIZE));
  const pagedUsers = tabUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const loadAdmin = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const profile = await fetchCurrentUserProfleService(user.id);
      setUserProfile(profile);
      const fetchedUsers = await fetchUsersService(
        profile.organization_id,
        debouncedSearchQuery,
      );
      setUsers(fetchedUsers);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, user?.id, setUserProfile, setUsers]);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

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
      const response = await apiClient.post("/admin-delete-user", {
        userId: id,
      });
      if (!response.data.success)
        throw new Error(response.data.error || "Failed to delete user");
      Alert.alert("Deleted", "User deleted successfully");
      const updatedUsers = await fetchUsersService(userProfile.organization_id);
      setUsers(updatedUsers);
    } catch (err: any) {}
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

  const tabs: { key: "pending" | "active"; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "active", label: "Active", count: activeCount },
  ];

  const getPageNumbers = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  };

  return (
    <>
      <View style={tw`flex-1 ${TW.bgPrimary}`}>
        <KeyboardAvoidingView
          style={tw`flex-1`}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <View style={tw`px-4 pt-1 pb-0`}>
            <HeaderWithSearch
              search={search}
              onSearchChange={setSearch}
              onBack={() => router.back()}
            />
          </View>

          {/* Tabs row + Add button */}
          <View style={tw`flex-row items-center gap-2 px-4 pt-3 pb-2`}>
            {/* Tabs — take remaining space */}
            <View style={tw`flex-1 flex-row rounded-2xl p-1 bg-slate-100`}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={({ pressed }) => [
                      tw`flex-1 py-3 rounded-xl items-center`,
                      isActive ? tw`${TW.bgAction}` : null,
                      pressed && !isActive && tw`opacity-70`,
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-sm font-bold`,
                        isActive ? tw`${TW.textButton}` : tw`${TW.textPrimary}`,
                      ]}
                    >
                      {tab.label.toUpperCase()}{" "}
                      {tab.count > 0 && (
                        <Text style={tw`${TW.textTertiary}`}></Text>
                      )}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Add User button — same height as tab bar */}
            <Pressable
              onPress={() => setShowAddModal(true)}
              style={({ pressed }) => [
                tw`h-12 w-12 rounded-full ${TW.bgAction}/90 items-center justify-center`,
                pressed && tw`opacity-85`,
              ]}
            >
              <Plus size={22} color="white" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Result count */}
          <Text style={tw`text-xs ${TW.textSecondary} px-4 pb-2`}>
            {activeTab === "pending" ? pendingCount : activeCount} users found
          </Text>

          {/* Users List */}
          <FlatList
            data={pagedUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <UserCard
                user={item}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                getSupervisorName={getSupervisorName}
              />
            )}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 16,
            }}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={tw`h-3`} />}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              loading ? (
                <LoadingIndicator message="Loading Users" />
              ) : (
                <View style={tw`items-center justify-center py-20`}>
                  <View
                    style={tw`h-16 w-16 rounded-full ${TW.bgCards} items-center justify-center mb-4`}
                  >
                    <Search size={26} color="#9ca3af" />
                  </View>
                  <Text style={tw`text-base font-semibold ${TW.textPrimary}`}>
                    No users found
                  </Text>
                  <Text
                    style={tw`text-sm mt-1 ${TW.textSecondary} text-center`}
                  >
                    {activeTab === "pending"
                      ? "No pending users at the moment"
                      : "No active users at the moment"}
                  </Text>
                </View>
              )
            }
            ListFooterComponent={
              tabUsers.length > 0 ? (
                <View style={tw`pt-4 pb-2`}>
                  {/* Prev / Next full-width row */}
                  <View style={tw`flex-row items-center gap-2 mb-2`}>
                    <Pressable
                      onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={[
                        tw`flex-1 h-10 rounded-xl items-center justify-center border ${TW.BORDER}`,
                        currentPage === 1 && tw`opacity-30`,
                      ]}
                    >
                      <Text style={tw`${TW.textPrimary} font-bold text-base`}>
                        ‹ Prev
                      </Text>
                    </Pressable>

                    {/* Page numbers */}
                    {getPageNumbers().map((page) => (
                      <Pressable
                        key={page}
                        onPress={() => setCurrentPage(page)}
                        style={[
                          tw`h-10 w-10 rounded-xl items-center justify-center`,
                          currentPage === page
                            ? tw`${TW.bgAction}`
                            : tw`border ${TW.BORDER}`,
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-sm font-semibold`,
                            currentPage === page
                              ? tw`${TW.textButton}`
                              : tw`${TW.textPrimary}`,
                          ]}
                        >
                          {page}
                        </Text>
                      </Pressable>
                    ))}

                    <Pressable
                      onPress={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      style={[
                        tw`flex-1 h-10 rounded-xl items-center justify-center border ${TW.BORDER}`,
                        currentPage === totalPages && tw`opacity-30`,
                      ]}
                    >
                      <Text style={tw`${TW.textPrimary} font-bold text-base`}>
                        Next ›
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : null
            }
          />
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
          <View
            style={[
              tw`bg-white w-full rounded-t-3xl px-6 pt-4`,
              { paddingBottom: insets.bottom + 16 },
            ]}
          >
            <View style={tw`items-center mb-5`}>
              <View style={tw`h-1 w-10 rounded-full bg-slate-200`} />
            </View>
            <Text style={tw`text-xl font-bold ${TW.textPrimary} mb-1`}>
              User Created
            </Text>
            <Text style={tw`text-sm ${TW.textSecondary} mb-5`}>
              Save this temporary password — it won`&apos;`t be shown again.
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
                Alert.alert("Copied", "Temporary password copied to clipboard");
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
