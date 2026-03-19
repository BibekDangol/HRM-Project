import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Controller, useForm } from "react-hook-form";

import React from "react";
import tw from "twrnc";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useRouter } from "expo-router";

const ForgotPassword = () => {
  const router = useRouter();
  const forgotPassword = useAuthStore((s) => s.forgotPassword);

  const { control, handleSubmit } = useForm({
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: any) => {
    const res = await forgotPassword(email); // res now has type ForgotPasswordResult
    if ("error" in res) {
      Alert.alert("Error", res.error);
    } else {
      Alert.alert("Success", "Check your email for reset link");
      router.back();
    }
  };

  return (
    <View style={tw`flex-1 justify-center px-5`}>
      <Text style={tw`text-xl font-bold mb-4`}>Forgot Password</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <TextInput
            style={tw`border rounded-lg p-3 mb-4`}
            placeholder="Enter your email"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <TouchableOpacity
        style={tw`bg-blue-500 p-4 rounded-lg`}
        onPress={handleSubmit(onSubmit)}>
        <Text style={tw`text-white text-center`}>Send Reset Link</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPassword;
