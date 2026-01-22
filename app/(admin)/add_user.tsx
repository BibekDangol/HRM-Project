import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

export default function AddUser() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!firstName.trim() || !lastName.trim() || !organizationName.trim()) {
      Alert.alert("Error", "Please fill name + organization.");
      return;
    }
    if (!cleanEmail) {
      Alert.alert("Error", "Email is required.");
      return;
    }
    if (tempPassword.trim().length < 8) {
      Alert.alert("Error", "Temporary password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      Alert.alert("UI Ready", "Next: connect to Edge Function.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Employee</Text>

      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First name"
        placeholderTextColor="#dcdada"
        style={styles.input}
      />

      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last name"
        placeholderTextColor="#dcdada"
        style={styles.input}
      />

      <TextInput
        value={organizationName}
        onChangeText={setOrganizationName}
        placeholder="Organization name"
        placeholderTextColor="#dcdada"
        style={styles.input}
      />

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Employee email"
        placeholderTextColor="#dcdada"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        value={tempPassword}
        onChangeText={setTempPassword}
        placeholder="Temporary password"
        placeholderTextColor="#dcdada"
        secureTextEntry
        style={styles.input}
      />

      <Pressable
        onPress={onCreate}
        disabled={loading}
        style={({ pressed }) => [
          styles.button,
          loading && styles.buttonDisabled,
          pressed && !loading && styles.buttonPressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.buttonText}>Create User</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  button: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#1F7A4D",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
