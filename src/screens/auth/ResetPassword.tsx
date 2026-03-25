import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TW } from "@/theme/twStyles";
import { supabase } from "@/src/supabase/supabaseClient";
import tw from "twrnc";
import { useRouter } from "expo-router";

const ResetPassword = () => {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoverySession, setRecoverySession] = useState<any>(null);
  console.log("recoverySession", recoverySession);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Listen for recovery session
  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setRecoverySession(session?.access_token);
    };
    loadSession();
  }, []);
  const handleReset = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (!recoverySession) {
      Alert.alert(
        "Error",
        "Recovery session not found. Please open the reset link again.",
      );
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser(
        { password },
        recoverySession,
      );

      if (error) throw error;

      Alert.alert("Success", "Password updated successfully");

      await supabase.auth.signOut();
      router.replace("/(auth)/login");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 ${TW.bgPrimary} justify-center`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={tw`flex-grow justify-center px-6`}
          keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={tw`items-center mb-6`}>
            <Text style={tw`text-2xl font-bold ${TW.textPrimary}`}>
              Reset Password
            </Text>
            <Text style={tw`${TW.textSecondary} text-center mt-1`}>
              Enter your new password below
            </Text>
          </View>

          {/* Password */}
          <View style={tw`mb-4`}>
            <Text style={tw`${TW.textSecondary} font-semibold mb-2`}>
              New Password
            </Text>

            <View style={tw`${TW.bgButton} rounded-lg flex-row items-center`}>
              <TextInput
                style={tw`flex-1 px-3 py-4`}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#7e7e7e"
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={tw`pr-3`}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye-closed" : "eye"}
                  size={22}
                  color="#7e7e7e"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={tw`mb-4`}>
            <Text style={tw`${TW.textSecondary} font-semibold mb-2`}>
              Confirm Password
            </Text>

            <View style={tw`${TW.bgButton} rounded-lg flex-row items-center`}>
              <TextInput
                style={tw`flex-1 px-3 py-4`}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#7e7e7e"
              />

              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                style={tw`pr-3`}>
                <MaterialCommunityIcons
                  name={showConfirm ? "eye-closed" : "eye"}
                  size={22}
                  color="#7e7e7e"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[
              tw`rounded-xl items-center justify-center ${TW.bgAction}`,
              loading ? tw`opacity-80` : tw`opacity-100`,
              { paddingVertical: 16 },
            ]}
            onPress={handleReset}
            disabled={loading}>
            <Text style={tw`text-white font-semibold text-[16px]`}>
              {loading ? "Updating..." : "Update Password"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResetPassword;
