import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { signupSchema } from "@/src/schema/auth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import tw from "twrnc";
import { z } from "zod";

type FormData = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      organizationName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await signUp({
        email,
        password,
        firstName,
        lastName,
        organizationName,
      });

      Alert.alert("Success", "Organization created. Please login.");
      router.push("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
      console.log("SIGNUP ERROR", error);
    }
  };

  return (
    <View style={tw`flex-1 ${TW.bgPrimary}`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={tw`flex-1`}
        >
          <ScrollView
            contentContainerStyle={tw`flex-grow justify-center`}
            style={tw`mx-8 mt-8`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* TITLE */}
            <View style={tw`items-center mb-8`}>
              <Text style={tw`font-bold text-3xl ${TW.textPrimary}`}>
                Create Organization
              </Text>
              <Text style={tw`text-lg ${TW.textSecondary} mt-1`}>
                Register your organization to start
              </Text>
            </View>

            {/* FORM */}
            <View style={tw`flex flex-col gap-6 w-full`}>
              {/* FIRST NAME */}
              <Controller
                control={control}
                name="firstName"
                render={({ field: { value, onChange } }) => (
                  <View style={tw`mb-2`}>
                    <Text style={tw`${TW.textSecondary} font-semibold mb-1`}>
                      First Name
                    </Text>
                    <TextInput
                      placeholder="First Name"
                      value={value}
                      onChangeText={(text) => {
                        onChange(text);
                        setFirstName(text);
                      }}
                      style={tw`py-4 px-3 ${TW.bgButton} rounded-lg text-base`}
                      placeholderTextColor="#dcdada"
                    />
                    {errors.firstName && (
                      <Text style={tw`text-[#FF6B6B] text-[13px] mt-1 ml-1`}>
                        {errors.firstName.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* LAST NAME */}
              <Controller
                control={control}
                name="lastName"
                render={({ field: { value, onChange } }) => (
                  <View style={tw`mb-2`}>
                    <Text style={tw`${TW.textSecondary} font-semibold mb-1`}>
                      Last Name
                    </Text>
                    <TextInput
                      placeholder="Last Name"
                      value={value}
                      onChangeText={(text) => {
                        onChange(text);
                        setLastName(text);
                      }}
                      style={tw`py-4 px-3 ${TW.bgButton} rounded-lg text-base`}
                      placeholderTextColor="#dcdada"
                    />
                    {errors.lastName && (
                      <Text style={tw`text-[#FF6B6B] text-[13px] mt-1 ml-1`}>
                        {errors.lastName.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* ORGANIZATION NAME */}
              <Controller
                control={control}
                name="organizationName"
                render={({ field: { value, onChange } }) => (
                  <View style={tw`mb-2`}>
                    <Text style={tw`${TW.textSecondary} font-semibold mb-1`}>
                      Organization Name
                    </Text>
                    <TextInput
                      placeholder="Organization Name"
                      value={value}
                      onChangeText={(text) => {
                        onChange(text);
                        setOrganizationName(text);
                      }}
                      style={tw`py-4 px-3 ${TW.bgButton} rounded-lg text-base`}
                      placeholderTextColor="#dcdada"
                    />
                    {errors.organizationName && (
                      <Text style={tw`text-[#FF6B6B] text-[13px] mt-1 ml-1`}>
                        {errors.organizationName.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* EMAIL */}
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange } }) => (
                  <View style={tw`mb-2`}>
                    <Text style={tw`${TW.textSecondary} font-semibold mb-1`}>
                      E-mail
                    </Text>
                    <TextInput
                      placeholder="example@gmail.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={(text) => {
                        onChange(text);
                        setEmail(text);
                      }}
                      style={tw`py-4 px-3 ${TW.bgButton} rounded-lg text-base`}
                      placeholderTextColor="#dcdada"
                    />
                    {errors.email && (
                      <Text style={tw`text-[#FF6B6B] text-[13px] mt-1 ml-1`}>
                        {errors.email.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* PASSWORD */}
              <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange } }) => (
                  <View style={tw`mb-2`}>
                    <Text style={tw`${TW.textSecondary} font-semibold mb-1`}>
                      Password
                    </Text>
                    <TextInput
                      placeholder="Enter your password"
                      secureTextEntry
                      value={value}
                      onChangeText={(text) => {
                        onChange(text);
                        setPassword(text);
                      }}
                      style={tw`py-4 px-3 ${TW.bgButton} rounded-lg text-base`}
                      placeholderTextColor="#dcdada"
                    />
                    {errors.password && (
                      <Text style={tw`text-[#FF6B6B] text-[13px] mt-1 ml-1`}>
                        {errors.password.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* CONFIRM PASSWORD */}
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { value, onChange } }) => (
                  <View style={tw`mb-2`}>
                    <Text style={tw`${TW.textSecondary} font-semibold mb-1`}>
                      Confirm Password
                    </Text>
                    <TextInput
                      placeholder="Confirm Password"
                      secureTextEntry
                      value={value}
                      onChangeText={(text) => {
                        onChange(text);
                        setConfirmPassword(text);
                      }}
                      style={tw`py-4 px-3 ${TW.bgButton} rounded-lg text-base`}
                      placeholderTextColor="#dcdada"
                    />
                    {errors.confirmPassword && (
                      <Text style={tw`text-[#FF6B6B] text-[13px] mt-1 ml-1`}>
                        {errors.confirmPassword.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* SUBMIT BUTTON */}
              <TouchableOpacity
                disabled={loading}
                onPress={handleSubmit(handleSignup)}
                style={[
                  tw`py-4 px-2 rounded-xl items-center justify-center ${TW.bgAction}`,
                  loading && tw`opacity-70`,
                ]}
              >
                <Text style={tw`${TW.textPrimary} text-lg font-semibold`}>
                  {loading ? "Creating..." : "Create Organization"}
                </Text>
              </TouchableOpacity>

              {/* LOGIN LINK */}
              <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                style={tw`mt-4`}
              >
                <Text style={tw`text-center ${TW.textPrimary}`}>
                  Already have an account?{" "}
                  <Text style={tw`font-semibold underline`}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}