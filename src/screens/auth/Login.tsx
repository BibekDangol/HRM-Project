import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import Logo from "@/src/components/Logo";
import PasswordField from "@/src/components/form/PasswordField";
import FormField from "@/src/components/form/FormField";
import AppButton from "@/src/components/ui/AppButton";
import { useDimension } from "@/src/hooks/useDimension";
import { loginSchema } from "@/src/schema/auth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import tw from "twrnc";
import { z } from "zod";

type FormData = z.infer<typeof loginSchema>;

const LoginScreen = () => {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);

  const { isSmallPhone, isTablet, width } = useDimension();

  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async (data: FormData) => {
    setLoginError(null);

    const result = await signIn(data.email, data.password);
    if ("error" in result) {
      Toast.show({ type: "error", text1: "Incorrect Email or Password" });
      setLoginError(result.error);
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

  return (
    <View style={tw`flex-1 ${TW.bgPrimary} justify-center`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={tw`flex-1`}
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
        >
          <ScrollView
            contentContainerStyle={[
              tw`flex-grow justify-center`,
              {
                paddingHorizontal: isTablet ? 40 : isSmallPhone ? 16 : 24,
                paddingVertical: isTablet ? 32 : 20,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                tw`self-center w-full`,
                {
                  maxWidth: isTablet ? 500 : width,
                },
              ]}
            >
              <Logo />
              <View style={tw`items-center flex flex-col`}>
                <Text
                  style={[
                    tw`font-bold ${TW.textPrimary} -mt-6`,
                    { fontSize: 24 },
                  ]}
                >
                  Oddooo  
                </Text>

                <Text
                  style={[
                    tw`${TW.textSecondary} text-center`,
                    { fontSize: isTablet ? 18 : isSmallPhone ? 14 : 16 },
                  ]}
                >
                  Streamlining your workforce management
                </Text>
              </View>

              <View
                style={[tw`flex flex-col w-full`, { gap: 16, marginTop: 16 }]}
              >
                {/* EMAIL */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange } }) => (
                    <FormField
                      // label="Email"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Email"
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      autoCapitalize="none"
                      error={errors.email?.message}
                      forceErrorBorder={!!loginError}
                      labelStyle={{ fontSize: isTablet ? 16 : 14 }}
                      inputStyle={{ fontSize: isTablet ? 16 : 14 }}
                    />
                  )}
                />

                {/* PASSWORD */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { value, onChange } }) => (
                    <PasswordField
                      // label="Password"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Password"
                      error={errors.password?.message}
                      forceErrorBorder={!!loginError}
                      labelStyle={{ fontSize: isTablet ? 16 : 14 }}
                      inputStyle={{ fontSize: isTablet ? 16 : 14 }}
                      iconSize={isTablet ? 24 : 22}
                    />
                  )}
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                style={tw`mt-3`}
                onPress={() => router.push("/(auth)/forgotPassword")}
              >
                <Text
                  style={[
                    tw`text-right ${TW.textPrimary} font-semibold`,
                    { fontSize: isTablet ? 15 : 14 },
                  ]}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <View style={[tw`flex-col w-full`, { gap: 16, marginTop: 16 }]}>
                <AppButton
                  title="Login"
                  loadingTitle="Logging in..."
                  onPress={handleSubmit(handleLogin)}
                  loading={isSubmitting}
                  size={isTablet ? "lg" : isSmallPhone ? "sm" : "md"}
                  textStyle={{ fontSize: isTablet ? 18 : 14 }}
                />

                <View style={tw`flex-row justify-center`}>
                  <Text
                    style={[
                      tw`${TW.textPrimary}`,
                      { fontSize: isTablet ? 15 : 14 },
                    ]}
                  >
                    Don&apos;t have an account?{" "}
                  </Text>

                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/signup")}
                  >
                    <Text
                      style={[
                        tw`${TW.textPrimary} font-semibold underline`,
                        { fontSize: isTablet ? 15 : 14 },
                      ]}
                    >
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
