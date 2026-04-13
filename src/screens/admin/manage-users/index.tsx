import { Plus, Search } from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import HeaderWithSearch from "@/src/components/SearchBar";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { Pagination } from "@/src/components/PaginationModal";
import { useManageUsers } from "@/src/hooks/admin/useManageUsers";
import { usePagination } from "@/src/hooks/usePagination";
import { TW } from "@/theme/twStyles";
import { useFocusEffect } from "expo-router";
import tw from "twrnc";
import { UserCard } from "../components/UserCard";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import TempPasswordModal from "./TempPasswordModal";

const ManageUsers = () => {
  const {
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
    users,
    editingUser,
    editRole,
    setEditRole,
    editSupervisor,
    setEditSupervisor,
    getSupervisorName,
    filteredUsers,
    tabs,
    onRefresh,
    handleAddUser,
    handleEditUser,
    handleSubmitEdit,
    handleDeleteUser,
    tempPassword,
    setTempPassword,
    isAddingUser,
    isEditingUser,
  } = useManageUsers();

  const flatListRef = useRef<FlatList>(null);

  const {
    page,
    setPage,
    totalPages,
    shouldShowPagination,
    pagedData,
    pageNumbers,
    isChangingPage,
  } = usePagination(filteredUsers, undefined, () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  });

  useFocusEffect(
    useCallback(() => {
      setActiveTab("pending");
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, [setActiveTab])
  );

  // ✅ Sort ascending by first_name
  const sortedPagedData = [...pagedData].sort((a, b) =>
    (a.first_name ?? "").localeCompare(b.first_name ?? "")
  );

  return (
    <View style={tw`flex-1 bg-white`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <HeaderWithSearch search={search} onSearchChange={setSearch} />

        <View style={tw`flex-row items-center gap-2 px-4 pt-3 pb-2`}>
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
                      <Text
                        style={[
                          isActive
                            ? tw`${TW.textButton}`
                            : tw`${TW.textPrimary}`,
                        ]}
                      >
                        ({tab.count})
                      </Text>
                    )}
                  </Text>
                </Pressable>
              );
            })}
          </View>

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

        {/* ✅ removed wrapper View, removed overlay — opacity fade only */}
        <FlatList
          ref={flatListRef}
          data={sortedPagedData}
          keyExtractor={(item) => item.id}
          style={[
            tw`px-4`,
            { opacity: isChangingPage ? 0.4 : 1 }, // ✅ real world fade
          ]}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              getSupervisorName={getSupervisorName}
            />
          )}
          ItemSeparatorComponent={() => <View style={tw`h-3`} />}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            loading ? (
              <LoadingIndicator message="Loading..." />
            ) : (
              <View style={tw`items-center mt-20`}>
                <Search size={30} color="gray" />
                <Text>No users found</Text>
              </View>
            )
          }
          ListFooterComponent={
            shouldShowPagination ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                pageNumbers={pageNumbers}
                setPage={setPage}
                TW={TW}
                tw={tw}
              />
            ) : null
          }
        />
      </KeyboardAvoidingView>

      <AddUserModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        isSubmitting={isAddingUser}
        supervisors={users}
        currentUserId={"self"}
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
        onSave={() => handleSubmitEdit(editingUser?.id)}
        isChanged={
          editRole !== editingUser?.role ||
          editSupervisor !== editingUser?.supervisor_id
        }
        isSubmitting={isEditingUser}
      />

      {tempPassword && (
        <TempPasswordModal
          tempPassword={tempPassword}
          setTempPassword={setTempPassword}
        />
      )}
    </View>
  );
};

export default ManageUsers;