import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase/supabaseClient";
import { useRouter } from "expo-router";

const ChangePassword = () => {
  const router = useRouter();
  const { user, updateStatus } = useAuthStore();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert("Fill fields later with zod do this");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    try {
      //Reauthenticate garne user lai old temp password sita
      setLoading(true); // we need to start loading in async function
      if (!user || !user.email) {
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });
      if (error) {
        Alert.alert("old pass incorrect");
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        Alert.alert("Error", updateError.message);
        return;
      }
      if (!user || !user.id) return; // to tell typescript-> I know user is not null
      //update status in profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ status: "active" })
        .eq("id", user.id);
      if (profileError) {
        Alert.alert("Error", profileError.message);
        return;
      }
      updateStatus("active");
      Alert.alert("Success", "password updated successfully");
      router.push("/(users)/HomeScreen");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false); //at last set loading to false
    }
  };
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Change Password</Text>
      <TextInput
        placeholder="Old password"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
      />
      <TextInput
        placeholder="New password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        placeholder="Confirm new password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity onPress={handleChangePassword} disabled={loading}>
        <Text>{loading ? "Updating" : "update password"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePassword;
