import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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

import { apiClient } from "@/src/api/apiClient";
import { useDimension } from "@/src/hooks/useDimension";
import { changePasswordSchema } from "@/src/schema/auth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { FormData } from "@/src/types/changePassword";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Eye, EyeClosed } from "lucide-react-native";
import tw from "twrnc";

const ChangePasswordScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((p) => !p);
  const [showOld] = useState(false);
  const [showNew] = useState(false);
  const [showConfirm] = useState(false);
  const { isTablet } = useDimension();
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
            onPress: () => router.replace("/login"), // redirect to login screen
          },
        ],
      );
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.error || err.message || "Something went wrong",
      );
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
              const showToggle =
                field === "oldPassword"
                  ? showOld
                  : field === "newPassword"
                    ? showNew
                    : showConfirm;
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
                    <View>
                      <Text style={tw`${TW.textSecondary} font-semibold mb-2`}>
                        {label}
                      </Text>

                      <View
                        style={tw`${TW.bgButton} rounded-lg flex-row items-center`}
                      >
                        <TextInput
                          style={tw`flex-1 px-3 py-4`}
                          secureTextEntry={!showToggle}
                          value={value}
                          onChangeText={onChange}
                          placeholder="•••••••••••••"
                          placeholderTextColor="#7e7e7e"
                        />

                        <TouchableOpacity
                          onPress={toggleShowPassword}
                          hitSlop={10}
                          style={tw`pr-3`}
                        >
                          {showPassword ? (
                            <Eye size={isTablet ? 24 : 22} color="#7e7e7e" />
                          ) : (
                            <EyeClosed
                              size={isTablet ? 24 : 22}
                              color="#7e7e7e"
                            />
                          )}
                        </TouchableOpacity>
                      </View>

                      {errors[field as keyof FormData] && (
                        <Text style={tw`text-[#FF6B6B] text-[13px] mt-1`}>
                          {errors[field as keyof FormData]?.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              );
            })}
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[
              tw`rounded-xl items-center justify-center mt-6 ${TW.bgAction}`,
              isSubmitting ? tw`opacity-80` : tw`opacity-100`,
              { paddingVertical: 16 },
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={tw`text-white font-semibold text-[16px]`}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChangePasswordScreen;
