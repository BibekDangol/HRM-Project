import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import PasswordField from "@/src/components/form/PasswordField";
import AppButton from "@/src/components/ui/AppButton";
import { useDimension } from "@/src/hooks/useDimension";
import { supabase } from "@/src/supabase/supabaseClient";
import { TW } from "@/theme/twStyles";
import { useRouter } from "expo-router";
import tw from "@/theme/tw";

const ResetPassword = () => {
  const router = useRouter();
  const { isTablet } = useDimension();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password,
      });
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={tw`flex-grow justify-center px-6`}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={tw`items-center mb-6`}>
            <Text style={tw`text-page font-bold ${TW.textPrimary}`}>
              Reset Password
            </Text>
            <Text style={tw`${TW.textSecondary} text-center mt-1`}>
              Enter your new password below
            </Text>
          </View>

          <PasswordField
            label="New Password"
            value={password}
            onChangeText={setPassword}
            placeholder="•••••••••••••"
            containerStyle={tw`mb-4`}
            iconSize={isTablet ? 24 : 22}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <PasswordField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="•••••••••••••"
            containerStyle={tw`mb-4`}
            iconSize={isTablet ? 24 : 22}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AppButton
            title="Update Password"
            loadingTitle="Updating..."
            onPress={handleReset}
            loading={loading}
            textStyle={tw`text-body`}
            style={tw`mt-2`}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResetPassword;
