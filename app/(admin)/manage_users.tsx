import * as Clipboard from "expo-clipboard";

import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
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
const ManageUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [adminOrgName, setAdminOrgName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const { user } = useAuthStore();
  const { session } = useAuthStore.getState();
  const token = session?.access_token;

  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    //I don't have to set role here
  });

  useEffect(() => {
    fetchAdminProfile();
    fetchUsers();
  }, []);

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

  const fetchUsers = async () => {
    if (!user) return;
    setLoading(true);
    // 1️⃣ get admin's org id
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.log(profileError);
      setLoading(false);
      return;
    }
    const orgId = profileData.organization_id;

    // 2️⃣ get all users in the same org
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
  };
  const handleAddUser = async () => {
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
      const response = await fetch(
        "https://dibcpzqlaypincnthhnm.supabase.co/functions/v1/hyper-service",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: newUser.email,
            firstName: newUser.first_name,
            lastName: newUser.last_name,
            orgId: adminProfile.organization_id,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        Alert.alert("Error", result.error);
        return;
      }
      if (response.ok && result.tempPassword) {
        //aayepachi matra set garne
        setTempPassword(result.tempPassword);
      }
      fetchUsers();
      setNewUser({ first_name: "", last_name: "", email: "" });
      //after you add a user, this makes "add user form back to empty"
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleEditUser = (id: string) => {
    Alert.alert("Edit User", `Edit user: ${id}`);
  };

  const handleDeleteUser = async (id?: string) => {
    if (!id) return;
    if (!token) {
      Alert.alert("Error", "User is not logged in");
      return;
    }
    try {
      const response = await fetch(
        "https://dibcpzqlaypincnthhnm.supabase.co/functions/v1/hyper-api",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: id,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }
      Alert.alert("Deleted", "User deleted successfully");

      // Refresh users list from Supabase
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error.message);
      return false;
    }
  };
  const renderItem = ({ item }: { item: UserProfile }) => (
    <View style={styles.userRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.userName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text>{item.email}</Text>
        {/* <Text style={styles.userRole}>{item.role}</Text> */}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
          onPress={() => handleEditUser(item.id)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#ef4444" }]}
          onPress={() =>
            Alert.alert(
              "Delete User",
              `Do you want to delete the ${item.first_name}?`,
              [
                { text: "cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => handleDeleteUser(item.id),
                },
              ],
            )
          }
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <KeyboardAvoidingView
        style={tw`flex-1 bg-[#F2F6FC] pt-8`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={tw`p-4`}>
          {/* Header */}
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <Text style={tw`text-2xl font-bold text-gray-900`}>
              Manage Users
            </Text>
            <TouchableOpacity
              style={tw`bg-[#1F7A4D] w-12 h-12 rounded-full items-center justify-center`}
              onPress={() => setShowForm(true)}
            >
              <Ionicons name="add" size={26} color="white" />
            </TouchableOpacity>
          </View>
          {/* Search */}
          <View
            style={tw`flex-row bg-white rounded-xl px-3 py-2 items-center mb-4 shadow`}
          >
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              placeholder="Search users..."
              style={tw`flex-1 ml-2 text-base`}
            />
            <Ionicons name="filter" size={20} color="#2563EB" />
          </View>
          {/* User count and pending and active list */}
          <View style={tw`mb-3`}>
            <View>
              <Text style={tw`text-gray-600`}>5 Users</Text>
            </View>

            <View style={tw`flex-row bg-gray-100 rounded-lg p-2 `}>
              {/* pending button */}
              <TouchableOpacity
                onPress={() => {
                  setActiveTab("pending");
                }}
                style={tw`flex-1 py-2 rounded-md ${
                  activeTab === "pending" ? "bg-white shadow" : ""
                }`}
              >
                <Text
                  style={tw`text-center font-medium ${
                    activeTab === "pending" ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Pending
                </Text>
              </TouchableOpacity>
              {/* Active button */}
              <TouchableOpacity
                onPress={() => setActiveTab("active")}
                style={tw`flex-1 py-2 rounded-md ${
                  activeTab === "active" ? "bg-white shadow" : ""
                }`}
              >
                <Text
                  style={tw`text-center font-medium ${
                    activeTab === "active" ? "text-blue-600" : "text-gray-500"
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
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={tw`flex-1 bg-black/40 justify-end`}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={tw`bg-white rounded-t-3xl p-5`}>
              <Text style={tw`text-xl font-bold text-gray-900 mb-4`}>
                Add New User
              </Text>

              <TextInput
                placeholder="First Name"
                style={tw`border border-gray-200 rounded-xl px-3 py-3 mb-3`}
                value={newUser.first_name}
                onChangeText={(text) =>
                  setNewUser({ ...newUser, first_name: text })
                }
              />

              <TextInput
                placeholder="Last Name"
                style={tw`border border-gray-200 rounded-xl px-3 py-3 mb-3`}
                value={newUser.last_name}
                onChangeText={(text) =>
                  setNewUser({ ...newUser, last_name: text })
                }
              />

              <TextInput
                placeholder="Email"
                style={tw`border border-gray-200 rounded-xl px-3 py-3 mb-3`}
                value={newUser.email}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
              />
              {/* <TextInput
                placeholder="Role (user/admin)"
                style={tw`border border-gray-200 rounded-xl px-3 py-3 mb-5`}
                value={newUser.role}
                onChangeText={(text) => setNewUser({ ...newUser, role: text })}
              /> */}

              {/* Buttons */}
              <View style={tw`flex-row justify-between`}>
                <TouchableOpacity
                  onPress={() => setShowForm(false)}
                  style={tw`px-4 py-3`}
                >
                  <Text style={tw`text-gray-500 font-semibold`}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    handleAddUser();
                    setShowForm(false);
                  }}
                  style={tw`bg-[#1F7A4D] px-8 py-3 rounded-xl`}
                >
                  <Text style={tw`text-white font-bold`}>Add User</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      {tempPassword && (
        <View
          style={tw`absolute inset-0 bg-black/50 items-center justify-center`}
        >
          <View style={tw`bg-white p-6 rounded-xl w-4/5`}>
            <Text style={tw`text-lg font-bold mb-2`}>User Created</Text>

            <Text style={tw`text-gray-600 mb-2`}>
              Temporary password (shown once)
            </Text>

            <View style={tw`bg-gray-100 p-3 rounded-lg mb-4`}>
              <Text selectable style={tw`font-mono text-center`}>
                {tempPassword}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Clipboard.setStringAsync(tempPassword); //copy to clipboard
                Alert.alert("copied", "Temporary password copied to clipboard");
              }}
              style={tw`bg-blue-500 py-3 rounded-lg mb-2`}
            >
              <Text style={tw`text-white text-center font-bold`}>
                Copy password
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTempPassword(null)}
              style={tw`bg-emerald-500 py-3 rounded-lg`}
            >
              <Text style={tw`text-white text-center font-bold`}>
                I have copied it
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F2F6FC", // soft blue background
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0C0C0C",
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#0C0C0C",
  },

  /* ---------- FORM ---------- */

  form: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },

  addButton: {
    backgroundColor: "#1F7A4D", // primary green
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  /* ---------- USER LIST ---------- */

  listContainer: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },

  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0C0C0C",
  },

  userEmail: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F2F6FC",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 6,
  },

  userRole: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textTransform: "capitalize",
  },

  /* ---------- ACTIONS ---------- */

  actions: {
    flexDirection: "row",
    marginLeft: 10,
  },

  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 20,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  actionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
// if active button click garyo vane fetch users: from profiles whose status is active
//if pending button thichyo vane show users from profiles whose status is pending
//fetch users ma status pani fetch garnu paryo
// if status=Pending then show pending users when pending button is clicked
export default ManageUsers;
