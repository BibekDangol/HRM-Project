import * as Clipboard from "expo-clipboard";

import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

import { apiClient } from "@/src/api/apiClient";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Picker } from '@react-native-picker/picker';
import tw from "twrnc";
import { z } from "zod";
import { supabase } from "../../supabase/supabaseClient";

type UserProfile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  organization_id: number;
  status?: string | null;
  organization?: { name: string | null };
};
type AdminProfile = {
  id: string;
  organization_id: number;
};

const addUserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
});
type AddUserFormData = z.infer<typeof addUserSchema>;
const ManageUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [adminOrgName, setAdminOrgName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>([]);
  const [menuOpenUserId, setMenuOpenUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRole, setEditRole] = useState<string>("user");
  const [editStatus, setEditStatus] = useState<string>("pending");
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const pendingCount = pendingUsers.length;
  const activeCount = activeUsers.length;
  const { user } = useAuthStore();
  const { session } = useAuthStore.getState();
  const token = session?.access_token;
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
    },
  });
  const onSubmit = async (newUser: AddUserFormData) => {
    await handleAddUser(newUser); // send to edge function / supabase
    reset(); // clear form
    setShowForm(false); // close modal
  };


  const fetchAdminProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, organization_id")
      .eq("id", user.id)
      .single();
    if (error) {
      console.log("Admin profile  fetching error", error);
      return;
    }
    setAdminProfile(data);
  };

  const fetchUsers = useCallback(async () => {
    if (!user?.id) return;
    //  get admin's org id
    if (!adminProfile?.organization_id) return;
    //trust me i am not undefined now to ts->supabase

    const orgId = adminProfile.organization_id;
    // get all users in the same org
    const { data, error } = await supabase
      .from("profiles")
      .select(`*, organization(name)`)
      .eq("organization_id", orgId) //fetch users with same org as admin
      .neq("id", user.id); //wanted to exclude admin himself
    if (error) console.log("Fetch users error:", error);
    if (!data) {
      setUsers([]);
      console.log("No data returned");
      return;
    }
    //filter users by their status
    const pendingUsers = data.filter(
      (u: UserProfile) => u.status === "pending",
    );
    const activeUsers = data.filter((u: UserProfile) => u.status === "active");
    //store separately for tabs
    setPendingUsers(pendingUsers);
    setActiveUsers(activeUsers);
    //or store all users

    setUsers(data || []);
    if (data && data.length > 0) {
      setAdminOrgName(data[0].organization.name ?? "");
    }
  }, [adminProfile?.organization_id, user?.id]);

  const handleAddUser = async (newUser: AddUserFormData) => {
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
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        orgId: adminProfile.organization_id,
      });


      if (!response.data.success) {
        Alert.alert("Error", response.data.error);
        return;
      }
      if (response.data.success && response.data.tempPassword) {
        setTempPassword(response.data.tempPassword);
      }
      fetchUsers();
    } catch (err: any) {
      Alert.alert("Errors", err.message);
    }
  };
  const handleEditUser = (user: UserProfile) => {
    setShowEditModal(true);
    setEditingUser(user);
    setEditRole(user.role);
    setEditStatus(user.status || "pending");
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
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error.message);
      return false;
    }
  };
  const handleSubmitEdit = async (userId: string) => {
    if (!user) return;
    try {
      const response = await apiClient.post("/hyper-edit", {
        userId,
        role: editRole,
        status: editStatus,
      });
      if (!response.data.success) {
        Alert.alert("Error", response.data.error);
        return;
      }
      Alert.alert("success", "user updated successfully");
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers(); //to refresh list
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  }
  useEffect(() => {
    fetchAdminProfile();
  }, []);
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers])
  const renderItem = ({ item }: { item: UserProfile }) => (
    <View style={tw`bg-white rounded-xl shadow p-4 mb-4 flex-row items-center`}>
      <View style={tw`flex-1`}>
        <Text style={tw`text-gray-900 font-semibold text-lg`}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={tw`text-gray-500 text-sm`}>{item.email}</Text>
      </View>
      <View style={tw`flex-row gap-2 `}>
        <TouchableOpacity
          onPress={() => handleEditUser(item)}
          style={tw`p-2 bg-green-700 rounded-lg`}
        >
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Delete User",
              `Do you want to delete ${item.first_name}?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => handleDeleteUser(item.id),
                },
              ]
            )
          }
          style={tw`p-2 bg-red-500 rounded-lg`}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <>
      <View style={tw`flex-1 bg-white`}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}
        >
          <KeyboardAvoidingView
            style={tw``}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView contentContainerStyle={tw`p-4`} keyboardShouldPersistTaps="always">
              {/* Header */}
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <Text style={tw`text-2xl font-bold text-gray-900`}>
                  {adminOrgName}
                </Text>
                <TouchableOpacity
                  style={tw`bg-[#1F7A4D] w-12 h-12 rounded-full items-center justify-center`}
                  onPress={() => setShowForm(true)}
                >
                  <Ionicons name="add" size={26} color="white" />
                </TouchableOpacity>
              </View>
              {/* Search */}
              <View pointerEvents="box-none"
                style={tw`flex-row bg-white rounded-xl px-3 py-2 items-center mb-4 shadow`}
              >
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                  autoFocus
                  placeholder="Search users..."
                  value={search}
                  onChangeText={setSearch}
                  style={tw`flex-1 ml-2 text-base pr-4`}
                />
                {search.length > 0 &&
                  <TouchableOpacity onPressIn={() => setSearch('')} style={tw`p-1`}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close-outline" size={24} color="#94A3B8" />
                  </TouchableOpacity>}
              </View>
              {/* User count and pending and active list */}
              <View style={tw`mb-3`}>
                <View>
                  <Text style={tw`text-gray-600`}>{activeTab === "pending" ? pendingCount : activeCount} Users</Text>
                </View>
                <View style={tw`flex-row bg-gray-100 rounded-lg p-2 `}>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveTab("pending");
                    }}
                    style={tw`flex-1 py-2 rounded-md ${activeTab === "pending" ? "bg-white shadow" : ""
                      }`}
                  >
                    <Text
                      style={tw`text-center font-medium ${activeTab === "pending" ? "text-blue-600" : "text-gray-500"
                        }`}
                    >
                      Pending
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab("active")}
                    style={tw`flex-1 py-2 rounded-md ${activeTab === "active" ? "bg-white shadow" : ""
                      }`}
                  >
                    <Text
                      style={tw`text-center font-medium ${activeTab === "active" ? "text-blue-600" : "text-gray-500"
                        }`}
                    >
                      Active
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Users list */}
              <FlatList
                data={activeTab === "pending" ? pendingUsers : activeUsers}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={tw`flex-1 bg-black/40`}>
          <KeyboardAvoidingView
            style={tw`flex-1`}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "flex-end",
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={tw`bg-white rounded-t-3xl px-6 py-8`}>
                {/* Title */}
                <Text
                  style={tw`text-[28px] font-bold text-center text-[#1F7A4D] mb-6`}
                >
                  Add New User
                </Text>

                {/* FIRST NAME */}
                <Controller
                  control={control}
                  name="first_name"
                  render={({ field: { value, onChange } }) => (
                    <View style={tw`mb-3`}>
                      <Text
                        style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}
                      >
                        First Name
                      </Text>

                      <TextInput
                        style={tw`h-[52px] bg-[#F5F5F5] rounded-xl px-4 text-[16px]`}
                        placeholder="John"
                        placeholderTextColor="#dcdada"
                        value={value}
                        onChangeText={onChange}
                      />

                      {errors.first_name && (
                        <Text style={tw`text-[#FF6B6B] text-[13px] mt-2 ml-1`}>
                          {errors.first_name.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                {/* LAST NAME */}
                <Controller
                  control={control}
                  name="last_name"
                  render={({ field: { value, onChange } }) => (
                    <View style={tw`mb-3`}>
                      <Text
                        style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}
                      >
                        Last Name
                      </Text>

                      <TextInput
                        style={tw`h-[52px] bg-[#F5F5F5] rounded-xl px-4 text-[16px]`}
                        placeholder="Doe"
                        placeholderTextColor="#dcdada"
                        value={value}
                        onChangeText={onChange}
                      />

                      {errors.last_name && (
                        <Text style={tw`text-[#FF6B6B] text-[13px] mt-2 ml-1`}>
                          {errors.last_name.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                {/* EMAIL */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange } }) => (
                    <View style={tw`mb-4`}>
                      <Text
                        style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}
                      >
                        E-mail
                      </Text>

                      <TextInput
                        style={tw`h-[52px] bg-[#F5F5F5] rounded-xl px-4 text-[16px]`}
                        placeholder="example@gmail.com"
                        placeholderTextColor="#dcdada"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={value}
                        onChangeText={onChange}
                      />

                      {errors.email && (
                        <Text style={tw`text-[#FF6B6B] text-[13px] mt-2 ml-1`}>
                          {errors.email.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                {/* ACTION BUTTONS */}
                <View style={tw`flex-row justify-between mt-6`}>
                  {/* Cancel */}
                  <TouchableOpacity
                    onPress={() => setShowForm(false)}
                    style={tw`h-[52px] px-6 rounded-xl justify-center`}
                  >
                    <Text style={tw`text-[#6E6F71] font-semibold text-[16px]`}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  {/* Submit */}
                  <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    style={[
                      tw`h-[52px] px-8 rounded-xl items-center justify-center bg-[#1F7A4D]`,
                      isSubmitting ? tw`opacity-70` : tw`opacity-100`,
                    ]}
                  >
                    <Text style={tw`text-white text-[16px] font-semibold`}>
                      {isSubmitting ? "Adding..." : "Add User"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={tw`flex-1 bg-black/40 items-center justify-center`}>
          <View style={tw`bg-white p-6 rounded-xl w-4/5`}>
            <Text style={tw`text-xl font-bold mb-4 text-gray-900`}>Edit User</Text>

            {/* Role Dropdown */}
            <Text style={tw`text-gray-700 mb-2`}>Role</Text>
            <View style={tw`border rounded-lg mb-4`}>
              <Picker
                selectedValue={editRole}
                onValueChange={(value) => setEditRole(value)}
              >
                <Picker.Item label="User" value="user" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
            </View>

            {/* Status Dropdown */}
            <Text style={tw`text-gray-700 mb-2`}>Status</Text>
            <View style={tw`border rounded-lg mb-4`}>
              <Picker
                selectedValue={editStatus}
                onValueChange={(value) => setEditStatus(value)}
              >
                <Picker.Item label="Pending" value="pending" />
                <Picker.Item label="Active" value="active" />
              </Picker>
            </View>

            {/* Buttons */}
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={tw`py-2 px-4 rounded-lg bg-gray-200`}
              >
                <Text style={tw`text-gray-700`}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  if (editingUser) {
                    await handleSubmitEdit(editingUser.id);
                  }
                }}
                style={tw`py-2 px-4 rounded-lg bg-green-500`}
              >
                <Text style={tw`text-white`}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {tempPassword && (
        <View style={tw`absolute inset-0 bg-black/40 items-center justify-center`}>
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
