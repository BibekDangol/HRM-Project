import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "../../supabase/supabaseClient";

type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  organization_id: string;
};

const ManageUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [adminOrgName, setAdminOrgName] = useState<string>("");
  const user = useAuthStore.getState().user;
  if (!user) throw new Error("No logged in user");

  const signUp = useAuthStore((state) => state.signUp);
  const [loading, setLoading] = useState<boolean>(true);
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "user",
  });

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
      .eq("organization_id", orgId);

    if (error) console.log("Fetch users error:", error);
    else setUsers(data || []);
    setLoading(false);
    if (data && data.length > 0) {
      setAdminOrgName(data[0].organization.name);
    }
  };
  const handleAddUser = async () => {
    if (!adminOrgName) {
      Alert.alert("Error", "Admin organization not loaded yet.");
      return;
    }

    try {
      await signUp({
        email: newUser.email,
        password: "TEMP@1234",
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        organizationName: adminOrgName, // dynamically use admin org
      });
      Alert.alert("Success", "User created");
      fetchUsers(); // refresh list
      setNewUser({ first_name: "", last_name: "", email: "", role: "user" });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };
  const handleEditUser = (id: string) => {
    Alert.alert("Edit User", `Edit user: ${id}`);
  };

  const handleDeleteUser = (id: string) => {
    Alert.alert("Delete User", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => Alert.alert(`Deleted ${id}`) },
    ]);
  };

  const renderItem = ({ item }: { item: UserProfile }) => (
    <View style={styles.userRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.userName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text>{item.email}</Text>
        <Text style={styles.userRole}>{item.role}</Text>
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
          onPress={() => handleDeleteUser(item.id)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Users</Text>

      {/* Add User Form */}
      <View style={styles.form}>
        <Text style={styles.subtitle}>Add New User</Text>
        <TextInput
          placeholder="First Name"
          style={styles.input}
          value={newUser.first_name}
          onChangeText={(text) => setNewUser({ ...newUser, first_name: text })}
        />
        <TextInput
          placeholder="Last Name"
          style={styles.input}
          value={newUser.last_name}
          onChangeText={(text) => setNewUser({ ...newUser, last_name: text })}
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={newUser.email}
          onChangeText={(text) => setNewUser({ ...newUser, email: text })}
        />
        <TextInput
          placeholder="Role (user/admin)"
          style={styles.input}
          value={newUser.role}
          onChangeText={(text) => setNewUser({ ...newUser, role: text })}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <View style={styles.listContainer}>
        <Text style={styles.subtitle}>All Users</Text>
        {loading ? (
          <Text>Loading users...</Text>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 50 }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f3f4f6" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  form: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#10b981",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  listContainer: { backgroundColor: "#fff", padding: 12, borderRadius: 10 },
  userRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  userName: { fontWeight: "bold", fontSize: 16 },
  userRole: { color: "#6b7280" },
  actions: { flexDirection: "row", gap: 8 },
  actionButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  actionText: { color: "#fff", fontWeight: "bold" },
});

export default ManageUsers;
