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
} from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import tw from "twrnc";
import { z } from "zod";
import { useAuthStore } from "../../store/useAuthStore";

/* ---------------- ZOD SCHEMA ---------------- */
const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    organizationName: z.string().min(1, "Organization name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuthStore();

  // ✅ keep your existing state (logic unchanged)
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
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      organizationName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // ❗ DO NOT change logic
  const handleSignup = async () => {
    if (
      !firstName ||
      !lastName ||
      !organizationName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "All fields are required");
      return;
    }

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
      console.log("SIGNUP ERROR 👉", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={tw`flex-1 bg-[#F5F5F5]`}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          tw`px-6`,
          { flexGrow: 1, justifyContent: "center" },
        ]}
      >
        <Text style={tw`text-[32px] font-bold text-center text-[#1F7A4D] mb-8`}>
          Create Organization
        </Text>

        {/* FIRST NAME */}
        <Controller
          control={control}
          name="firstName"
          render={({ field: { value, onChange } }) => (
            <React.Fragment>
              <Text style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}>
                First Name
              </Text>

              <TextInput
                placeholder="First Name"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  setFirstName(text);
                }}
                style={tw`h-[52px] bg-white rounded-xl px-4 text-[16px] mb-2`}
                placeholderTextColor="#dcdada"
              />

              {errors.firstName && (
                <Text style={tw`text-[#FF6B6B] text-[13px] mb-3 ml-1`}>
                  {errors.firstName.message}
                </Text>
              )}
            </React.Fragment>
          )}
        />

        {/* LAST NAME */}
        <Controller
          control={control}
          name="lastName"
          render={({ field: { value, onChange } }) => (
            <React.Fragment>
              <Text style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}>
                Last Name
              </Text>

              <TextInput
                placeholder="Last Name"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  setLastName(text);
                }}
                style={tw`h-[52px] bg-white rounded-xl px-4 text-[16px] mb-2`}
                placeholderTextColor="#dcdada"
              />

              {errors.lastName && (
                <Text style={tw`text-[#FF6B6B] text-[13px] mb-3 ml-1`}>
                  {errors.lastName.message}
                </Text>
              )}
            </React.Fragment>
          )}
        />

        {/* ORGANIZATION */}
        <Controller
          control={control}
          name="organizationName"
          render={({ field: { value, onChange } }) => (
            <React.Fragment>
              <Text style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}>
                Organization Name
              </Text>

              <TextInput
                placeholder="Organization Name"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  setOrganizationName(text);
                }}
                style={tw`h-[52px] bg-white rounded-xl px-4 text-[16px] mb-2`}
                placeholderTextColor="#dcdada"
              />

              {errors.organizationName && (
                <Text style={tw`text-[#FF6B6B] text-[13px] mb-3 ml-1`}>
                  {errors.organizationName.message}
                </Text>
              )}
            </React.Fragment>
          )}
        />

        {/* EMAIL */}
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <React.Fragment>
              <Text style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}>
                E-mail
              </Text>

              <TextInput
                placeholder="example@gmail.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  setEmail(text);
                }}
                style={tw`h-[52px] bg-white rounded-xl px-4 text-[16px] mb-2`}
                placeholderTextColor="#dcdada"
              />

              {errors.email && (
                <Text style={tw`text-[#FF6B6B] text-[13px] mb-3 ml-1`}>
                  {errors.email.message}
                </Text>
              )}
            </React.Fragment>
          )}
        />

        {/* PASSWORD */}
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => (
            <React.Fragment>
              <Text style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}>
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
                style={tw`h-[52px] bg-white rounded-xl px-4 text-[16px] mb-2`}
                placeholderTextColor="#dcdada"
              />

              {errors.password && (
                <Text style={tw`text-[#FF6B6B] text-[13px] mb-3 ml-1`}>
                  {errors.password.message}
                </Text>
              )}
            </React.Fragment>
          )}
        />

        {/* CONFIRM PASSWORD */}
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { value, onChange } }) => (
            <React.Fragment>
              <Text style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}>
                Confirm Password
              </Text>

              <TextInput
                placeholder="Confirm password"
                secureTextEntry
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  setConfirmPassword(text);
                }}
                style={tw`h-[52px] bg-white rounded-xl px-4 text-[16px] mb-2`}
                placeholderTextColor="#dcdada"
              />

              {errors.confirmPassword && (
                <Text style={tw`text-[#FF6B6B] text-[13px] mb-3 ml-1`}>
                  {errors.confirmPassword.message}
                </Text>
              )}
            </React.Fragment>
          )}
        />

        {/* SUBMIT */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleSubmit(handleSignup)}
          style={[
            tw`h-[52px] rounded-xl items-center justify-center mt-3 bg-[#1F7A4D]`,
            loading && tw`opacity-70`,
          ]}
        >
          <Text style={tw`text-white text-[18px] font-semibold`}>
            {loading ? "Creating..." : "Create Organization"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={tw`mt-6`}
        >
          <Text style={tw`text-center text-[#1D1D1D]`}>
            Already have an account?{" "}
            <Text style={tw`text-[#1F7A4D] font-semibold underline`}>
              Login
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
