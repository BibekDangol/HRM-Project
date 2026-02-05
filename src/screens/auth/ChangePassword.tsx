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

import { changePasswordSchema } from "@/src/schema/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase/supabaseClient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import tw from "twrnc";
import { z } from "zod";

type FormData = z.infer<typeof changePasswordSchema>;

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
    try {
      if (!user || !user.email || !user.id) {
        Alert.alert("User not found");
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.oldPassword,
      });

      if (authError) {
        Alert.alert("Error", "Old password is incorrect");
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        Alert.alert("Error", updateError.message);
        return;
      }
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ status: "active" })
        .eq("id", user.id);

      if (profileError) {
        Alert.alert("Error", profileError.message);
        return;
      }
      updateStatus("active");
      Alert.alert("Success", "Password updated successfully");
      router.replace("/(users)/dashboard");
    } catch (err: any) {
      Alert.alert("Error", err.message);
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
          <Controller
            control={control}
            name="oldPassword"
            render={({ field: { value, onChange } }) => (
              <View style={tw`mb-3`}>
                <Text style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1`}>
                  Old Password
                </Text>

                <View
                  style={tw`h-[52px] bg-white rounded-xl px-4 flex-row items-center`}
                >
                  <TextInput
                    style={tw`flex-1 text-[16px]`}
                    secureTextEntry={!showOld}
                    value={value}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity onPress={() => setShowOld(!showOld)}>
                    <MaterialCommunityIcons
                      name={showOld ? "eye-off" : "eye"}
                      size={22}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>

                {errors.oldPassword && (
                  <Text style={tw`text-[#FF6B6B] text-[13px] mt-1`}>
                    {errors.oldPassword.message}
                  </Text>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { value, onChange } }) => (
              <View style={tw`mb-3`}>
                <Text style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1`}>
                  New Password
                </Text>

                <View
                  style={tw`h-[52px] bg-white rounded-xl px-4 flex-row items-center`}
                >
                  <TextInput
                    style={tw`flex-1 text-[16px]`}
                    secureTextEntry={!showNew}
                    value={value}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                    <MaterialCommunityIcons
                      name={showNew ? "eye-off" : "eye"}
                      size={22}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>

                {errors.newPassword && (
                  <Text style={tw`text-[#FF6B6B] text-[13px] mt-1`}>
                    {errors.newPassword.message}
                  </Text>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { value, onChange } }) => (
              <View style={tw`mb-4`}>
                <Text style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1`}>
                  Confirm Password
                </Text>
                <View
                  style={tw`h-[52px] bg-white rounded-xl px-4 flex-row items-center`}
                >
                  <TextInput
                    style={tw`flex-1 text-[16px]`}
                    secureTextEntry={!showConfirm}
                    value={value}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm(!showConfirm)}
                  >
                    <MaterialCommunityIcons
                      name={showConfirm ? "eye-off" : "eye"}
                      size={22}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>

                {errors.confirmPassword && (
                  <Text style={tw`text-[#FF6B6B] text-[13px] mt-1`}>
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>
            )}
          />
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
