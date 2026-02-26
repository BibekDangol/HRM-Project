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
import { changePasswordSchema } from "@/src/schema/auth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { FormData } from "@/src/types/changePassword";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import tw from "twrnc";

const ChangePasswordScreen = () => {
  const router = useRouter();
  const { user, updateStatus } = useAuthStore();

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      // Call edge function via apiClient
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
        ]
      );
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || err.message || "Something went wrong");
    }
  };
  return (
    <View style={tw`flex-1 bg-[#F5F5F5]`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          style={tw`px-6`}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={tw`text-[28px] font-bold text-center text-[#1F7A4D] mb-8`}
          >
            Change Password
          </Text>

          {["oldPassword", "newPassword", "confirmPassword"].map((field) => {
            const showToggle =
              field === "oldPassword" ? showOld : field === "newPassword" ? showNew : showConfirm;
            const setShowToggle =
              field === "oldPassword" ? setShowOld : field === "newPassword" ? setShowNew : setShowConfirm;
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
                  <View style={tw`mb-3`}>
                    <Text style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1`}>
                      {label}
                    </Text>
                    <View style={tw`h-[52px] bg-white rounded-xl px-4 flex-row items-center`}>
                      <TextInput
                        style={tw`flex-1 text-[16px]`}
                        secureTextEntry={!showToggle}
                        value={value}
                        onChangeText={onChange}
                      />
                      <TouchableOpacity onPress={() => setShowToggle(!showToggle)}>
                        <MaterialCommunityIcons
                          name={showToggle ? "eye-off" : "eye"}
                          size={22}
                          color="#888"
                        />
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

          <TouchableOpacity
            style={[
              tw`h-[52px] rounded-xl items-center justify-center bg-[#1F7A4D]`,
              isSubmitting ? tw`opacity-70` : tw`opacity-100`,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={tw`text-white text-[18px] font-semibold`}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChangePasswordScreen;