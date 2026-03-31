import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert } from "react-native";
import { adminAddUserService } from "@/src/services/admin/AddUser.service";
import { apiClient } from "@/src/api/apiClient";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { fetchUsersService } from "@/src/services/admin.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useUsersStore } from "@/src/store/useUsersStore";

export const useManageUsers = () => {
  const { user } = useAuthStore();
  const { users, setUsers, setUserProfile, userProfile } = useUsersStore();

  // ---------------- UI STATE ----------------
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editingUser, setEditingUser] = useState<any>(null);
  const [editRole, setEditRole] = useState("user");
  const [editSupervisor, setEditSupervisor] = useState<string | null>(null);

  // ---------------- LOAD USERS ----------------
  const loadUsers = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const profile = await fetchCurrentUserProfleService(user.id);
      setUserProfile(profile);

      const data = await fetchUsersService(
        profile.organization_id,
        debouncedSearch,
      );

      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [user?.id, debouncedSearch]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ---------------- REFRESH ----------------
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  // ---------------- FILTER USERS ----------------
  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      activeTab === "pending" ? u.status === "pending" : u.status === "active",
    );
  }, [users, activeTab]);
  const pendingUsers = users.filter((u) => u.status === "pending");
  const activeUsers = users.filter((u) => u.status === "active");
  const pendingCount = pendingUsers.length;
  const activeCount = activeUsers.length;
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const tabs: { key: "pending" | "active"; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "active", label: "Active", count: activeCount },
  ];

  const getSupervisorName = (supervisorId?: string | null) => {
    if (!supervisorId) return "No supervisor yet";

    const supervisor = users.find((u) => u.id === supervisorId);

    return supervisor
      ? `${supervisor.first_name} ${supervisor.last_name}`.trim()
      : "Unknown Supervisor";
  };

  // ---------------- ADD USER ----------------
  const handleAddUser = async (data: any) => {
    if (!userProfile) {
      Alert.alert("Error", "Profile not ready");
      return;
    }
    try {
      const response = await adminAddUserService({
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        orgId: userProfile.organization_id,
        supervisor_id: data.supervisor_id,
      });
      if (response.tempPassword) {
        setTempPassword(response.tempPassword);
      }
      // 2. refresh users
      const updatedUsers = await fetchUsersService(userProfile.organization_id);
      setUsers(updatedUsers);

      // 3. close modal (if needed)
      setShowAddModal(false);

      // 4. SUCCESS ALERT (important)
      Alert.alert("Success", "User added successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // ---------------- EDIT USER ----------------
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditSupervisor(user.supervisor_id);
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (userId: string) => {
    if (!userProfile) return;

    try {
      const res = await apiClient.post("/admin-edit-user", {
        userId,
        role: editRole,
        supervisor_id: editSupervisor,
      });

      Alert.alert("Success", "User updated successfully");
      if (!res.data.success) {
        Alert.alert("Error", res.data.error);
        return;
      }

      const updated = await fetchUsersService(userProfile.organization_id);

      setUsers(updated);
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // ---------------- DELETE USER ----------------
  const handleDeleteUser = async (id?: string) => {
    if (!id || !userProfile) return;

    try {
      await apiClient.post("/admin-delete-user", {
        userId: id,
      });

      const updated = await fetchUsersService(userProfile.organization_id);

      setUsers(updated);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return {
    // state
    search,
    setSearch,
    activeTab,
    setActiveTab,

    loading,
    refreshing,

    showAddModal,
    setShowAddModal,
    showEditModal,
    setShowEditModal,

    user,
    users,
    editingUser,
    editRole,
    setEditRole,
    editSupervisor,
    setEditSupervisor,
    getSupervisorName,

    // data
    filteredUsers,
    tabs,
    // actions
    onRefresh,
    handleAddUser,
    handleEditUser,
    handleSubmitEdit,
    handleDeleteUser,
    tempPassword,
    setTempPassword,
  };
};
