import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { apiClient } from "@/src/api/apiClient";
import PasswordField from "@/src/components/form/PasswordField";
import AppButton from "@/src/components/ui/AppButton";
import { changePasswordSchema } from "@/src/schema/auth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { FormData } from "@/src/types/changePassword";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import tw from "@/theme/tw";

const ChangePasswordScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user?.id || !user.email) {
      Alert.alert("User not found");
      return;
    }

    try {
      const { data: result } = await apiClient.post("/change-password", {
        userId: user.id,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      if (!result.success) {
        Alert.alert("Error", result.error || "Failed to change password");
        return;
      }
      // Clear local session/auth
      useAuthStore.getState().signOut(); // Make sure you have a logout action that clears session
      Alert.alert(
        "Success",
        "Password updated successfully. Please login again.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"), // redirect to login screen
          },
        ],
      );
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.error || err.message || "Something went wrong",
      );
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
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={tw`items-center mb-6`}>
            <Text style={tw`text-2xl font-bold ${TW.textPrimary}`}>
              Change Password
            </Text>
            <Text style={tw`${TW.textSecondary} text-center mt-1`}>
              Update your password securely
            </Text>
          </View>

          {/* Fields */}
          <View style={tw`gap-4`}>
            {["oldPassword", "newPassword", "confirmPassword"].map((field) => {
              const label =
                field === "oldPassword"
                  ? "Old Password"
                  : field === "newPassword"
                    ? "New Password"
                    : "Confirm Password";

              return (
                <Controller
                  key={field}
                  control={control}
                  name={field as keyof FormData}
                  render={({ field: { value, onChange } }) => (
                    <PasswordField
                      label={label}
                      value={value}
                      onChangeText={onChange}
                      placeholder="•••••••••••••"
                      error={errors[field as keyof FormData]?.message}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />
              );
            })}
          </View>

          {/* Button */}
          <AppButton
            title="Update Password"
            loadingTitle="Updating..."
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            textStyle={tw`text-[16px]`}
            style={tw`mt-6`}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChangePasswordScreen;
