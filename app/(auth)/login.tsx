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

import { useAuthStore } from "@/store/useAuthStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import tw from "twrnc";
import { z } from "zod";

const schema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

const LoginScreen = () => {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);

  // keep your existing state + logic
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI feature
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((p) => !p);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async () => {
    const result = await signIn(email, password);
    if ("error" in result) {
      Alert.alert("Login Failed", result.error);
      return; // stop execution if login fails-> dont redirect
    }
    Alert.alert("Logged in sucessfully");
    if (result.status === "pending") {
      router.replace("/changePassword");
      return;
    }
    if (result.role === "admin") {
      router.replace("/(admin)/dashboard");
    } else {
      router.replace("/(users)/dashboard");
    }
  };
  const onValidSubmit = () => handleLogin();

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
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={tw`text-[32px] font-bold text-center text-[#1F7A4D] mb-8`}
          >
            Welcome
          </Text>

          {/* EMAIL */}
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <View style={tw`mb-3`}>
                <Text
                  style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}
                >
                  E-mail
                </Text>

                <TextInput
                  style={tw`h-[52px] bg-white rounded-xl px-4 text-[16px]`}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#dcdada"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    setEmail(text);
                  }}
                />

                {errors.email && (
                  <Text style={tw`text-[#FF6B6B] text-[13px] mt-2 ml-1`}>
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
                <Text
                  style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}
                >
                  Password
                </Text>

                <View
                  style={tw`h-[52px] bg-white rounded-xl px-4 flex-row items-center`}
                >
                  <TextInput
                    style={tw`flex-1 text-[16px]`}
                    placeholder="Enter your password"
                    placeholderTextColor="#dcdada"
                    secureTextEntry={!showPassword}
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      setPassword(text);
                    }}
                  />

                  <TouchableOpacity onPress={toggleShowPassword} hitSlop={10}>
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-off" : "eye"}
                      size={22}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>

                {errors.password && (
                  <Text style={tw`text-[#FF6B6B] text-[13px] mt-2 ml-1`}>
                    {errors.password.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Forgot Password */}
          <TouchableOpacity style={tw`mt-2`}>
            <Text style={tw`text-right text-[#1F7A4D] font-semibold`}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              tw`h-[52px] rounded-xl items-center justify-center mt-4 bg-[#1F7A4D]`,
              isSubmitting ? tw`opacity-70` : tw`opacity-100`,
              { elevation: 4 },
            ]}
            onPress={handleSubmit(onValidSubmit)}
            disabled={isSubmitting}
          >
            <Text style={tw`text-white text-[18px] font-semibold`}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          {/* Signup Row */}
          <View style={tw`flex-row justify-center mt-6`}>
            <Text style={tw`text-[14px] text-[#1D1D1D]`}>
              Dont have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={tw`text-[#1F7A4D] font-semibold`}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
