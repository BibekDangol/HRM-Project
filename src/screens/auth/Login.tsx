import { Eye, EyeClosed } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
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
import { useDimension } from "@/src/hooks/useDimension";
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

  const { isSmallPhone, isTablet, width } = useDimension();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
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
    setLoginError(null); // clear old error

    const result = await signIn(email, password);

    if ("error" in result) {
      setLoginError(result.error); // 👈 show in UI instead of Alert
      return;
    }

    if (result.role === "user" && result.status === "pending") {
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
          style={tw`flex-1`}
          behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={[
              tw`flex-grow justify-center`,
              {
                paddingHorizontal: isTablet ? 40 : isSmallPhone ? 16 : 24,
                paddingVertical: isTablet ? 32 : 20,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View
              style={[
                tw`self-center w-full`,
                {
                  maxWidth: isTablet ? 500 : width,
                },
              ]}>
              <Logo />
              <View style={tw`items-center flex flex-col`}>
                <Text
                  style={[
                    tw`font-bold ${TW.textPrimary} -mt-6`,
                    { fontSize: 24 },
                  ]}>
                  TechHaus
                </Text>

                <Text
                  style={[
                    tw`${TW.textSecondary} text-center`,
                    { fontSize: isTablet ? 18 : isSmallPhone ? 14 : 16 },
                  ]}>
                  Streamlining your workforce management
                </Text>
              </View>

              {/* Form Fields */}
              <View
                style={[tw`flex flex-col w-full`, { gap: 16, marginTop: 16 }]}>
                {/* EMAIL */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange } }) => (
                    <View>
                      <Text
                        style={[
                          tw`${TW.textSecondary} font-semibold mb-2`,
                          { fontSize: isTablet ? 16 : 14 },
                        ]}>
                        Email
                      </Text>

                      <TextInput
                        style={[
                          tw`${TW.bgButton} rounded-lg px-3`,
                          {
                            paddingVertical: isTablet
                              ? 18
                              : isSmallPhone
                                ? 12
                                : 16,
                            fontSize: isTablet ? 16 : 14,
                          },
                        ]}
                        placeholder="Enter your email"
                        placeholderTextColor="#7e7e7e"
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        autoCapitalize="none"
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          setEmail(text);
                        }}
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
                    <View>
                      <Text
                        style={[
                          tw`${TW.textSecondary} font-semibold mb-2`,
                          { fontSize: isTablet ? 16 : 14 },
                        ]}>
                        Password
                      </Text>

                      <View
                        style={tw`${TW.bgButton} rounded-lg flex-row items-center`}>
                        <TextInput
                          style={[
                            tw`flex-1 px-3`,
                            {
                              paddingVertical: isTablet
                                ? 18
                                : isSmallPhone
                                  ? 12
                                  : 16,
                              fontSize: isTablet ? 16 : 14,
                            },
                          ]}
                          placeholder="•••••••••••••"
                          placeholderTextColor="#7e7e7e"
                          secureTextEntry={!showPassword}
                          autoCorrect={false}
                          value={value}
                          onChangeText={(text) => {
                            onChange(text);
                            setPassword(text);
                          }}
                        />

                        <TouchableOpacity
                          onPress={toggleShowPassword}
                          hitSlop={10}
                          style={tw`pr-3`}>
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

                      {errors.password && (
                        <Text style={tw`text-[#FF6B6B] text-[13px] mt-1 ml-1`}>
                          {errors.password.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                style={tw`mt-3`}
                onPress={() => router.push("/(auth)/forgotPassword")}>
                <Text
                  style={[
                    tw`text-right ${TW.textPrimary} font-semibold`,
                    { fontSize: isTablet ? 15 : 14 },
                  ]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Bottom Actions */}
              <View style={[tw`flex-col w-full`, { gap: 16, marginTop: 16 }]}>
                {/* Login Button */}
                {loginError && (
                  <Text style={tw`text-[#FF6B6B] text-[13px] text-center mb-2`}>
                    {loginError}
                  </Text>
                )}
                <TouchableOpacity
                  style={[
                    tw`rounded-xl items-center justify-center ${TW.bgAction}`,
                    isSubmitting ? tw`opacity-90` : tw`opacity-100`,
                    {
                      paddingVertical: isTablet ? 18 : isSmallPhone ? 12 : 16,
                    },
                  ]}
                  onPress={handleSubmit(onValidSubmit)}
                  disabled={isSubmitting}>
                  <View style={tw`flex-row items-center gap-2`}>
                    {isSubmitting && (
                      <ActivityIndicator size="small" color="#ffffff" />
                    )}
                    <Text
                      style={[
                        tw`font-semibold ${TW.textButton}`,
                        { fontSize: isTablet ? 18 : 14 },
                      ]}>
                      {isSubmitting ? "Logging in..." : "Login"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Signup Row */}
                <View style={tw`flex-row justify-center`}>
                  <Text
                    style={[
                      tw`${TW.textPrimary}`,
                      { fontSize: isTablet ? 15 : 14 },
                    ]}>
                    Don&apos;t have an account?
                  </Text>

                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/signup")}>
                    <Text
                      style={[
                        tw`${TW.textPrimary} font-semibold underline`,
                        { fontSize: isTablet ? 15 : 14 },
                      ]}>
                      Sign up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default LoginScreen;
