import AuthScreen, { authStyles } from "@/src/components/auth/AuthScreen";
import AppButton from "@/src/components/ui/AppButton";
import FormField from "@/src/components/form/FormField";
import PasswordField from "@/src/components/form/PasswordField";
import { loginSchema } from "@/src/schema/auth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

type FormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
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
      router.replace("/(admin)/(main-tabs)/dashboard");
    } else {
      router.replace("/(users)/(main-tabs)/dashboard");
    }
  };

  return (
    <AuthScreen
      showBrand
      title="Welcome back."
      subtitle="Sign in to manage your workday."
      footer={
        <>
          <Text style={authStyles.footerText}>Don&apos;t have an account?</Text>
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={() => router.push("/(auth)/signup")}
            style={({ pressed }) => [
              authStyles.footerLink,
              pressed && authStyles.pressed,
            ]}
          >
            <Text style={authStyles.link}>Sign up</Text>
          </Pressable>
        </>
      }
    >
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <FormField
            label="Email address"
            variant="outlined"
            value={value}
            onChangeText={(next) => {
              onChange(next);
              setLoginError(null);
            }}
            onBlur={onBlur}
            placeholder="you@company.com"
            keyboardType="email-address"
            textContentType="username"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
            error={errors.email?.message}
            forceErrorBorder={!!loginError}
            inputStyle={authStyles.input}
            labelStyle={authStyles.label}
          />
        )}
      />
      <View>
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <PasswordField
              label="Password"
              variant="outlined"
              value={value}
              onChangeText={(next) => {
                onChange(next);
                setLoginError(null);
              }}
              onBlur={onBlur}
              placeholder="Enter your password"
              textContentType="password"
              autoComplete="current-password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit(handleLogin)}
              editable={!isSubmitting}
              error={errors.password?.message}
              forceErrorBorder={!!loginError}
              inputStyle={authStyles.input}
              labelStyle={authStyles.label}
            />
          )}
        />
        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => router.push("/(auth)/forgotPassword")}
          style={({ pressed }) => [
            authStyles.forgotPassword,
            pressed && authStyles.pressed,
          ]}
        >
          <Text style={authStyles.link}>Forgot password?</Text>
        </Pressable>
      </View>
      <AppButton
        title="Sign in"
        loadingTitle="Signing in…"
        onPress={handleSubmit(handleLogin)}
        loading={isSubmitting}
        size="md"
        fullWidth
        textStyle={authStyles.buttonText}
      />
    </AuthScreen>
  );
}
