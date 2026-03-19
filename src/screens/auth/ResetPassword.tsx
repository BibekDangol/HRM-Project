import React, { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

import { supabase } from "@/src/supabase/supabaseClient";
import { useRouter } from "expo-router";
import tw from "twrnc";

const ResetPassword = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [recoverySession, setRecoverySession] = useState<any>(null);

  // Listen for password recovery session
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          console.log("Recovery session established!");
          setRecoverySession(session);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (!password) {
      Alert.alert("Error", "Password is required");
      return;
    }
    if (!recoverySession) {
      Alert.alert(
        "Error",
        "Recovery session not found. Please open the reset link from your email again.",
      );
      return;
    }
    const { error } = await supabase.auth.updateUser(
      { password },
      recoverySession,
    );

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Password updated");
      // logout recovery session
      await supabase.auth.signOut();
      router.replace("/(auth)/login");
    }
  };

  return (
    <View style={tw`flex-1 justify-center px-5`}>
      <Text style={tw`text-xl font-bold mb-4`}>Reset Password</Text>

      <TextInput
        style={tw`border rounded-lg p-3 mb-4`}
        placeholder="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={tw`bg-green-500 p-4 rounded-lg`}
        onPress={handleReset}>
        <Text style={tw`text-white text-center`}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPassword;
