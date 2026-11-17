import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import { apiClient } from "@/src/api/apiClient";
import type { AddUserFormData } from "@/src/screens/admin/manage-users/AddUserModal";
import { adminAddUserService } from "@/src/services/admin/add-user-service";
import {
  fetchSupervisorUnderUsersService,
  fetchUsersService,
} from "@/src/services/admin.service";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { UserProfile } from "@/src/types/admin";

export type UserDirectoryMode =
  | "manage"
  | "admin-attendance"
  | "supervisor-attendance";

export type UserDirectoryOptions = {
  mode?: UserDirectoryMode;
  initialTab?: "pending" | "active";
};

export function useUserDirectory({
  mode = "manage",
  initialTab = "pending",
}: UserDirectoryOptions = {}) {
  const { user } = useAuthStore();
  const { users, setUsers, currentUserProfile, setCurrentUserProfile } =
    useUsersStore();

  const [search, setSearch] = useState("");
  const [manualActiveTab, setManualActiveTab] =
    useState<"pending" | "active">(initialTab);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState("user");
  const [editSupervisor, setEditSupervisor] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const currentUserId = user?.id;
  const organizationId = currentUserProfile?.organization_id;

  // ---------------- FETCH FUNCTION ----------------
  const fetchDirectoryUsers = useCallback(
    async (query = ""): Promise<UserProfile[]> => {
      if (!currentUserId) return [];

      let profile = currentUserProfile;
      if (!profile) {
        profile = await fetchCurrentUserProfleService(currentUserId);
        setCurrentUserProfile(profile);
      }

      if (!profile?.organization_id) return [];

      if (mode === "supervisor-attendance") {
        return await fetchSupervisorUnderUsersService(
          profile.organization_id,
          query,
          currentUserId,
        );
      }

      return await fetchUsersService(profile.organization_id, query);
    },
    [currentUserId, currentUserProfile, setCurrentUserProfile, mode],
  );

  // ---------------- LOAD USERS ----------------
  // Note: HeaderWithSearch already debounces inputs by 300ms, so search here is single-debounced.
  useEffect(() => {
    let cancelled = false;

    fetchDirectoryUsers(search)
      .then((data) => {
        if (cancelled) return;
        setUsers(data ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("useUserDirectory error:", err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchDirectoryUsers, search, setUsers]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await fetchDirectoryUsers(search);
      setUsers(data ?? []);
    } catch (err) {
      console.error("useUserDirectory refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchDirectoryUsers, search, setUsers]);

  // ---------------- TAB AUTO-SWITCHING & FILTERING ----------------
  // Auto-switch tabs during render if search produces hits only in the other tab
  const autoSwitchedTab = useMemo(() => {
    if (mode !== "manage" || !search.trim()) return null;

    const query = search.trim().toLowerCase();
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

    if (hasPending && !hasActive) return "pending";
    if (hasActive && !hasPending) return "active";
    return null;
  }, [search, users, mode]);

  const activeTab = autoSwitchedTab ?? manualActiveTab;
  const setActiveTab = setManualActiveTab;

  const filteredUsers = useMemo(() => {
    if (mode !== "manage") {
      return [...users].sort((a, b) =>
        (a.first_name ?? "").localeCompare(b.first_name ?? ""),
      );
    }

    return users.filter((u) =>
      activeTab === "pending" ? u.status === "pending" : u.status === "active",
    );
  }, [users, activeTab, mode]);

  const pendingCount = useMemo(
    () => users.filter((u) => u.status === "pending").length,
    [users],
  );
  const activeCount = useMemo(
    () => users.filter((u) => u.status === "active").length,
    [users],
  );

  const tabs: { key: "pending" | "active"; label: string; count: number }[] =
    useMemo(
      () => [
        { key: "pending", label: "Pending", count: pendingCount },
        { key: "active", label: "Active", count: activeCount },
      ],
      [pendingCount, activeCount],
    );

  // ---------------- SUPERVISOR HELPER ----------------
  const getSupervisorName = useCallback(
    (supervisorId?: string | null) => {
      if (!supervisorId) return "No supervisor";

      const supervisor = users.find((u) => u.id === supervisorId);
      return supervisor
        ? `${supervisor.first_name} ${supervisor.last_name}`.trim()
        : "Unknown Supervisor";
    },
    [users],
  );

  // ---------------- ACTIONS (MANAGE MODE) ----------------
  const handleAddUser = useCallback(
    async (data: AddUserFormData) => {
      if (!organizationId) {
        Alert.alert("Error", "Organization not ready");
        return false;
      }

      try {
        setIsAddingUser(true);
        const response = await adminAddUserService({
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          orgId: organizationId,
          supervisor_id: data.supervisor_id,
        });

        setTempPassword(response.tempPassword ?? null);
        if (!response.tempPassword) {
          setShowAddModal(false);
          Alert.alert("User created", "No temporary password was returned. Ask the user to reset their password before signing in.");
        }
        void onRefresh();
        return true;
      } catch (err: any) {
        Alert.alert("Error", err.message ?? "Failed to add user");
        return false;
      } finally {
        setIsAddingUser(false);
      }
    },
    [organizationId, onRefresh],
  );

  const handleEditUser = useCallback((selectedUser: UserProfile) => {
    setEditingUser(selectedUser);
    setEditRole(selectedUser.role);
    setEditSupervisor(selectedUser.supervisor_id ?? null);
    setShowEditModal(true);
  }, []);

  const isChanged = useMemo(() => {
    if (!editingUser) return false;
    return (
      editRole !== editingUser.role ||
      (editSupervisor ?? null) !== (editingUser.supervisor_id ?? null)
    );
  }, [editingUser, editRole, editSupervisor]);

  const handleSubmitEdit = useCallback(
    async (userId?: string) => {
      const targetId = userId ?? editingUser?.id;
      if (!targetId || !organizationId) return;

      try {
        setIsEditingUser(true);
        const res = await apiClient.post("/admin-edit-user", {
          userId: targetId,
          role: editRole,
          supervisor_id: editSupervisor,
        });

        if (!res.data.success) {
          Alert.alert("Error", res.data.error);
          return;
        }

        const updated = await fetchDirectoryUsers(search);
        setUsers(updated);

        setShowEditModal(false);
        setEditingUser(null);
        Alert.alert("Success", "User updated successfully");
      } catch (err: any) {
        Alert.alert("Error", err.message ?? "Failed to update user");
      } finally {
        setIsEditingUser(false);
      }
    },
    [
      organizationId,
      editingUser,
      editRole,
      editSupervisor,
      fetchDirectoryUsers,
      search,
      setUsers,
    ],
  );

  const handleDeleteUser = useCallback(
    async (id?: string) => {
      if (!id || !organizationId) return;

      try {
        setIsDeletingUser(true);
        await apiClient.post("/admin-delete-user", { userId: id });

        const updated = await fetchDirectoryUsers(search);
        setUsers(updated);
        Alert.alert("Success", "User deleted successfully");
      } catch (err: any) {
        Alert.alert("Error", err.message ?? "Failed to delete user");
      } finally {
        setIsDeletingUser(false);
      }
    },
    [organizationId, fetchDirectoryUsers, search, setUsers],
  );

  return {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    loading,
    refreshing,
    users,
    filteredUsers,
    tabs,
    onRefresh,
    getSupervisorName,

    // Modal & CRUD states
    showAddModal,
    setShowAddModal,
    showEditModal,
    setShowEditModal,
    editingUser,
    editRole,
    setEditRole,
    editSupervisor,
    setEditSupervisor,
    tempPassword,
    setTempPassword,
    isAddingUser,
    isEditingUser,
    isDeletingUser,
    isChanged,
    handleAddUser,
    handleEditUser,
    handleSubmitEdit,
    handleDeleteUser,
  };
}

export default useUserDirectory;
