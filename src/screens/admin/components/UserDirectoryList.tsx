import React, { useRef } from "react";
import { FlatList, Pressable } from "react-native";

import AddUserModal from "@/src/screens/admin/manage-users/AddUserModal";
import EditUserModal from "@/src/screens/admin/manage-users/EditUserModal";
import { ListScreen } from "@/src/components/lists/ListScreen";
import { UserCard } from "./UserCard";
import { UserProfile } from "@/src/types/admin";
import { usePagination } from "@/src/hooks/usePagination";
import {
  useUserDirectory,
  UserDirectoryMode,
} from "@/src/hooks/useUserDirectory";

type Props = {
  mode?: UserDirectoryMode;
  onUserPress?: (user: UserProfile) => void;
  onBack?: () => void;
  searchPlaceholder?: string;
};

export default function UserDirectoryList({
  mode = "manage",
  onUserPress,
  onBack,
  searchPlaceholder = "Search by name or email...",
}: Props) {
  const directory = useUserDirectory({ mode });
  const flatListRef = useRef<FlatList<UserProfile>>(null);

  const {
    page,
    setPage,
    totalPages,
    shouldShowPagination,
    pagedData,
    pageNumbers,
    isChangingPage,
  } = usePagination(
    directory.filteredUsers,
    undefined,
    () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
    { resetKey: `${directory.activeTab}-${directory.search}` },
  );

  return (
    <>
      <ListScreen<UserProfile>
        flatListRef={flatListRef as any}
        search={directory.search}
        onSearchChange={directory.setSearch}
        searchPlaceholder={searchPlaceholder}
        onBack={onBack}
        tabs={mode === "manage" ? directory.tabs : undefined}
        activeTab={directory.activeTab}
        onTabChange={(tab) => directory.setActiveTab(tab as any)}
        onPrimaryAction={
          mode === "manage" ? () => directory.setShowAddModal(true) : undefined
        }
        primaryActionLabel="Add User"
        loading={directory.loading}
        refreshing={directory.refreshing}
        onRefresh={directory.onRefresh}
        data={pagedData}
        keyExtractor={(item) => item.id}
        emptyTitle="No users found"
        emptyMessage={
          directory.search
            ? `No users match "${directory.search}"`
            : mode === "manage"
              ? "Try adding a new user to get started."
              : "No users in this directory."
        }
        emptyActionLabel={
          directory.search
            ? "Clear Search"
            : mode === "manage"
              ? "Add User"
              : undefined
        }
        onEmptyAction={
          directory.search
            ? () => directory.setSearch("")
            : mode === "manage"
              ? () => directory.setShowAddModal(true)
              : undefined
        }
        page={page}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        setPage={setPage}
        shouldShowPagination={shouldShowPagination}
        isChangingPage={isChangingPage}
        renderItem={({ item }) => {
          const card = (
            <UserCard
              user={item}
              onEdit={mode === "manage" ? directory.handleEditUser : undefined}
              onDelete={
                mode === "manage" ? directory.handleDeleteUser : undefined
              }
              getSupervisorName={directory.getSupervisorName}
              showRightArrow={mode !== "manage"}
            />
          );

          if (onUserPress) {
            return (
              <Pressable onPress={() => onUserPress(item)}>{card}</Pressable>
            );
          }

          return card;
        }}
      />

      {/* Admin Modals */}
      {mode === "manage" ? (
        <>
          <AddUserModal
            visible={directory.showAddModal}
            tempPassword={directory.tempPassword}
            onClose={() => {
              directory.setTempPassword(null);
              directory.setShowAddModal(false);
            }}
            onSubmit={directory.handleAddUser}
            isSubmitting={directory.isAddingUser}
            supervisors={directory.users}
            currentUserId={"self"}
          />

          <EditUserModal
            visible={directory.showEditModal}
            user={directory.editingUser}
            role={directory.editRole}
            supervisor={directory.editSupervisor}
            setRole={directory.setEditRole}
            setSupervisor={directory.setEditSupervisor}
            users={directory.users}
            onClose={() => {
              directory.setShowEditModal(false);
            }}
            onSave={() => directory.handleSubmitEdit()}
            isChanged={directory.isChanged}
            isSubmitting={directory.isEditingUser}
          />

        </>
      ) : null}
    </>
  );
}
