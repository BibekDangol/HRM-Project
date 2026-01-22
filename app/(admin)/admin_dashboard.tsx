import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../../lib/supabaseClient";

type ProfileRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  organization_name: string | null;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadPending = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,first_name,last_name,organization_name,approval_status,created_at")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setUsers((data ?? []) as ProfileRow[]);
  };

  const setStatus = async (userId: string, status: "approved" | "rejected") => {
    try {
      setBusyId(userId);

      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: status })
        .eq("id", userId);

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      // remove from list since it’s no longer pending
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text>Loading pending users...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Pending Registrations
      </Text>

      <Pressable
        onPress={loadPending}
        style={{ padding: 10, backgroundColor: "#eee", borderRadius: 10, marginBottom: 12 }}
      >
        <Text>Refresh</Text>
      </Pressable>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No pending users.</Text>}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 12, marginBottom: 10 }}>
            <Text style={{ fontWeight: "700" }}>
              {item.first_name ?? ""} {item.last_name ?? ""}
            </Text>
            <Text>{item.email}</Text>
            <Text>{item.organization_name ?? ""}</Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <Pressable
                disabled={busyId === item.id}
                onPress={() => setStatus(item.id, "approved")}
                style={{ flex: 1, padding: 10, backgroundColor: "#1F7A4D", borderRadius: 10, alignItems: "center" }}
              >
                <Text style={{ color: "white" }}>{busyId === item.id ? "..." : "Approve"}</Text>
              </Pressable>

              <Pressable
                disabled={busyId === item.id}
                onPress={() => setStatus(item.id, "rejected")}
                style={{ flex: 1, padding: 10, backgroundColor: "#B91C1C", borderRadius: 10, alignItems: "center" }}
              >
                <Text style={{ color: "white" }}>{busyId === item.id ? "..." : "Reject"}</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}
