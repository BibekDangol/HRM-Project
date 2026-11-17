import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";

import AuthScreen, { authStyles } from "@/src/components/auth/AuthScreen";
import { apiClient } from "@/src/api/apiClient";
import PasswordField from "@/src/components/form/PasswordField";
import AppButton from "@/src/components/ui/AppButton";
import { changePasswordSchema } from "@/src/schema/auth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { FormData } from "@/src/types/changePassword";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";

const ChangePasswordScreen = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
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
      await useAuthStore.getState().signOut();
      Alert.alert(
        "Success",
        "Password updated successfully. Please login again.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
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
    <AuthScreen
      title="Change password"
      subtitle="Choose a new password to secure your account."
    >
      {(["oldPassword", "newPassword", "confirmPassword"] as const).map((field) => (
        <Controller
          key={field}
          control={control}
          name={field}
          render={({ field: { value, onChange, onBlur } }) => (
            <PasswordField
              label={field === "oldPassword" ? "Current password" : field === "newPassword" ? "New password" : "Confirm new password"}
              variant="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={field === "oldPassword" ? "Enter your current password" : field === "newPassword" ? "Enter a new password" : "Re-enter your new password"}
              textContentType={field === "oldPassword" ? "password" : "newPassword"}
              autoComplete={field === "oldPassword" ? "current-password" : "new-password"}
              returnKeyType={field === "confirmPassword" ? "done" : "next"}
              onSubmitEditing={field === "confirmPassword" ? handleSubmit(onSubmit) : undefined}
              editable={!isSubmitting}
              error={errors[field]?.message}
              inputStyle={authStyles.input}
              labelStyle={authStyles.label}
            />
          )}
        />
      ))}
      <AppButton
        title="Update password"
        loadingTitle="Updating…"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        size="md"
        fullWidth
        textStyle={authStyles.buttonText}
      />
    </AuthScreen>
  );
};

export default ChangePasswordScreen;
