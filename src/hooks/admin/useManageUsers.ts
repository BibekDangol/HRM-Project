import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import { apiClient } from "@/src/api/apiClient";
import { useDebounce } from "@/src/hooks/useDebounce";
import { adminAddUserService } from "@/src/services/admin/add-user-service";
import { fetchUsersService } from "@/src/services/admin.service";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";

export const useManageUsers = () => {
  const { user } = useAuthStore();
  const { users, setUsers, currentUserProfile, setCurrentUserProfile } =
    useUsersStore();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [activeTab, setActiveTab] = useState("pending");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editingUser, setEditingUser] = useState<any>(null);
  const [editRole, setEditRole] = useState("user");
  const [editSupervisor, setEditSupervisor] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  // ---------------- LOAD USERS ----------------
  const loadUsers = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      let profile = currentUserProfile;

      if (!profile) {
        profile = await fetchCurrentUserProfleService(user.id);
        setCurrentUserProfile(profile);
      }

      const data = await fetchUsersService(
        profile.organization_id,
        debouncedSearch,
      );

      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [
    user?.id,
    currentUserProfile,
    debouncedSearch,
    setCurrentUserProfile,
    setUsers,
  ]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 🔥 AUTO TAB SWITCH ON SEARCH
  useEffect(() => {
    if (!debouncedSearch.trim()) return;

    const query = debouncedSearch.toLowerCase();

    const hasPending = users.some(
      (u) =>
        u.status === "pending" &&
        `${u.first_name} ${u.last_name} ${u.email}`
          .toLowerCase()
          .includes(query),
    );

    const hasActive = users.some(
      (u) =>
        u.status === "active" &&
        `${u.first_name} ${u.last_name} ${u.email}`
          .toLowerCase()
          .includes(query),
    );

    if (hasPending && !hasActive) {
      setActiveTab("pending");
    } else if (hasActive && !hasPending) {
      setActiveTab("active");
    }
  }, [debouncedSearch, users]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  // 🔥 FILTER USERS
  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      activeTab === "pending" ? u.status === "pending" : u.status === "active",
    );
  }, [users, activeTab]);

  const pendingUsers = users.filter((u) => u.status === "pending");
  const activeUsers = users.filter((u) => u.status === "active");
  const pendingCount = pendingUsers.length;
  const activeCount = activeUsers.length;

  const tabs: { key: "pending" | "active"; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "active", label: "Active", count: activeCount },
  ];

  // 🔥 HELPERS
  const getSupervisorName = (supervisorId?: string | null) => {
    if (!supervisorId) return "No supervisor yet";

    const supervisor = users.find((u) => u.id === supervisorId);

    return supervisor
      ? `${supervisor.first_name} ${supervisor.last_name}`.trim()
      : "Unknown Supervisor";
  };

  // 🔥 ADD USER
  const handleAddUser = async (data: any) => {
    if (!currentUserProfile) {
      Alert.alert("Error", "Profile not ready");
      return;
    }

    try {
      setIsAddingUser(true);

      const response = await adminAddUserService({
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        orgId: currentUserProfile.organization_id,
        supervisor_id: data.supervisor_id,
      });

      if (response.tempPassword) {
        setTempPassword(response.tempPassword);
      }

      const updatedUsers = await fetchUsersService(
        currentUserProfile.organization_id,
      );
      setUsers(updatedUsers);

      setShowAddModal(false);
      Alert.alert("Success", "User added successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setIsAddingUser(false);
    }
  };

  // 🔥 EDIT USER
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditSupervisor(user.supervisor_id);
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (userId: string) => {
    if (!currentUserProfile) return;

    try {
      setIsEditingUser(true);

      const res = await apiClient.post("/admin-edit-user", {
        userId,
        role: editRole,
        supervisor_id: editSupervisor,
      });

      if (!res.data.success) {
        Alert.alert("Error", res.data.error);
        return;
      }

      Alert.alert("Success", "User updated successfully");

      const updated = await fetchUsersService(
        currentUserProfile.organization_id,
      );

      setUsers(updated);

      setShowEditModal(false);
      setEditingUser(null);

      Alert.alert("Success", "User updated successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setIsEditingUser(false);
    }
  };

  // 🔥 DELETE USER
  const handleDeleteUser = async (id?: string) => {
    if (!id || !currentUserProfile) return;

    try {
      setIsDeletingUser(true);

      await apiClient.post("/admin-delete-user", {
        userId: id,
      });

      const updated = await fetchUsersService(
        currentUserProfile.organization_id,
      );

      setUsers(updated);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setIsDeletingUser(false);
    }
  };

  return {
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

    filteredUsers,
    tabs,

    onRefresh,
    getSupervisorName,

    editingUser,
    editRole,
    setEditRole,
    editSupervisor,
    setEditSupervisor,

    handleAddUser,
    handleEditUser,
    handleSubmitEdit,
    handleDeleteUser,

    tempPassword,
    setTempPassword,

    isAddingUser,
    isEditingUser,
    isDeletingUser,
  };
};
