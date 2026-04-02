import { Plus, Search } from "lucide-react-native";
import { default as React, useCallback, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import HeaderWithSearch from "@/src/components/HeaderWithSearch";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { useManageUsers } from "@/src/hooks/admin/useManageUsers";
import { usePagination } from "@/src/hooks/usePagination";
import { useAuthStore } from "@/src/store/useAuthStore";
import { TW } from "@/theme/twStyles";
import { useFocusEffect } from "expo-router";
import tw from "twrnc";
import { UserCard } from "../components/UserCard";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import TempPasswordModal from "./TempPasswordModal";

const ManageUsers = () => {
  const { session } = useAuthStore();
  console.log("Index to send props session", session);
  const {
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
  } = useManageUsers();

  const {
    page,
    setPage,
    totalPages,
    shouldShowPagination,
    pagedData,
    pageNumbers,
  } = usePagination(filteredUsers);
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      setActiveTab("pending");
      setPage(1);

      flatListRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }, [setActiveTab, setPage]),
  );

  return (
    <View style={tw`flex-1 bg-white`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <HeaderWithSearch search={search} onSearchChange={setSearch} />

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
                  ]}>
                  <Text
                    style={[
                      tw`text-sm font-bold`,
                      isActive ? tw`${TW.textButton}` : tw`${TW.textPrimary}`,
                    ]}>
                    {tab.label.toUpperCase()}{" "}
                    {tab.count > 0 && (
                      <Text
                        style={[
                          tw``,
                          isActive
                            ? tw`${TW.textButton}`
                            : tw`${TW.textPrimary}`,
                        ]}>
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
            ]}>
            <Plus size={22} color="white" strokeWidth={2.5} />
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={pagedData}
          keyExtractor={(item) => item.id}
          style={tw`px-4`}
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
              <View style={tw`pt-4 pb-2`}>
                {/* Pagination Row */}
                <View style={tw`flex-row items-center gap-2 mb-2`}>
                  {/* Prev Button */}
                  <Pressable
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={[
                      tw`flex-1 h-10 rounded-xl items-center justify-center border ${TW.BORDER}`,
                      page === 1 && tw`opacity-30`,
                    ]}>
                    <Text style={tw`${TW.textPrimary} font-bold text-base`}>
                      ‹ Prev
                    </Text>
                  </Pressable>

                  {/* Page Numbers */}
                  {pageNumbers.map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setPage(p)}
                      style={[
                        tw`h-10 w-10 rounded-xl items-center justify-center`,
                        p === page
                          ? tw`${TW.bgAction}`
                          : tw`border ${TW.BORDER}`,
                      ]}>
                      <Text
                        style={[
                          tw`text-sm font-semibold`,
                          p === page
                            ? tw`${TW.textButton}`
                            : tw`${TW.textPrimary}`,
                        ]}>
                        {p}
                      </Text>
                    </Pressable>
                  ))}
                  {/* Next Button */}
                  <Pressable
                    onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={[
                      tw`flex-1 h-10 rounded-xl items-center justify-center border ${TW.BORDER}`,
                      page === totalPages && tw`opacity-30`,
                    ]}>
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

      <AddUserModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        isSubmitting={false}
        supervisors={users}
        currentUserId={user?.id ?? ""}
      />
      {/* EDIT MODAL */}
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
      />
      {tempPassword && (
        <TempPasswordModal
          tempPassword={tempPassword}
          setTempPassword={setTempPassword}
        />
      )}
      {/* {tempPassword && (
        <View style={tw`absolute inset-0 bg-black/50 items-center justify-end`}>
          <View
            style={[
              tw`bg-white w-full rounded-t-3xl px-6 pt-4`,
              { paddingBottom: insets.bottom + 16 },
            ]}>
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
              style={tw`bg-slate-50 border ${TW.BORDER} rounded-2xl px-4 py-4 mb-5`}>
              <Text style={tw`text-xs ${TW.textSecondary} mb-1`}>
                Temporary Password
              </Text>
              <Text
                selectable
                style={tw`text-lg font-bold ${TW.textPrimary} tracking-widest`}>
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
              ]}>
              <Copy size={18} color="white" />
              <Text style={tw`text-white font-bold ml-2`}>Copy Password</Text>
            </Pressable>
            <Pressable
              onPress={() => setTempPassword(null)}
              style={({ pressed }) => [
                tw`py-4 rounded-2xl border ${TW.BORDER} items-center`,
                pressed && tw`opacity-80`,
              ]}>
              <Text style={tw`font-semibold ${TW.textPrimary}`}>Done</Text>
            </Pressable>
          </View>
        </View>
      )} */}
    </View>
  );
};

export default ManageUsers;
