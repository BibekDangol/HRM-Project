import { Eye, EyeOff } from "lucide-react-native";
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

import Logo from "@/src/components/Logo";
import { loginSchema } from "@/src/schema/auth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import tw from "twrnc";
import { z } from "zod";

type FormData = z.infer<typeof loginSchema>;

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
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async () => {
    const result = await signIn(email, password);
    if ("error" in result) {
      Alert.alert("Login Failed", result.error);
      return; // stop execution if login fails-> dont redirect
    }

    Alert.alert("Logged in successfully");
    if (result.status === "pending") {
      router.replace("/(auth)/changePassword");
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
    <View style={tw`flex-1 ${TW.bgPrimary} justify-center`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={tw``}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={tw`flex-grow justify-center`}
            style={tw`mx-8`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Logo />

            <View style={tw`text-center items-center flex flex-col gap-1 mt-4`}>
              <Text style={tw`font-bold text-3xl ${TW.textPrimary}`}>
                TechHaus HRM
              </Text>
              <Text style={tw`text-lg ${TW.textSecondary}`}>
                Streamlining your workforce management
              </Text>
            </View>

            <View style={tw`flex flex-col gap-8 mt-8 w-full`}>
              {/* EMAIL */}
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange } }) => (
                  <View style={tw`mb-3`}>
                    <Text
                      style={tw`${TW.textSecondary} font-semibold mb-2`}
                    >
                      E-mail
                    </Text>

                    <TextInput
                      style={tw`py-5 px-2 ${TW.bgButton} rounded-lg`}
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
                  <View style={tw``}>
                    <Text
                      style={tw`${TW.textSecondary} font-semibold mb-2`}
                    >
                      Password
                    </Text>

                    <View
                      style={tw`${TW.bgButton} rounded-lg flex-row items-center`}
                    >
                      <TextInput
                        style={tw`flex-1 py-5 px-2`}
                        placeholder="Enter your password"
                        placeholderTextColor="#dcdada"
                        secureTextEntry={!showPassword}
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          setPassword(text);
                        }}
                      />

                      <TouchableOpacity onPress={toggleShowPassword} hitSlop={10} style={tw`pr-2`}>
                        {showPassword ? (
                          <EyeOff size={22} color="#888" />
                        ) : (
                          <Eye size={22} color="#888" />
                        )}
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
            </View>
            {/* Forgot Password */}
            <TouchableOpacity style={tw`mt-2`}>
              <Text style={tw`text-right ${TW.textPrimary} font-semibold`}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
            <View style={tw`flex-col justify-between gap-8 mt-8 w-full`}>
              {/* Login Button */}
              <TouchableOpacity
                style={[
                  tw`py-4 px-2 rounded-xl items-center justify-center ${TW.bgAction}`,
                  isSubmitting ? tw`opacity-90` : tw`opacity-100`,
                  { elevation: 1 },
                ]}
                onPress={handleSubmit(onValidSubmit)}
                disabled={isSubmitting}
              >
                <Text style={tw`text-lg font-semibold ${TW.textPrimary}`}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>

              {/* Signup Row */}
              <View style={tw`flex-row gap-2 justify-center`}>
                <Text style={tw`text-sm ${TW.textPrimary}`}>
                  Dont have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                  <Text style={tw`${TW.textPrimary} font-semibold`}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default LoginScreen;
