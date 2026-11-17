import AuthScreen, { authStyles } from "@/src/components/auth/AuthScreen";
import FormField from "@/src/components/form/FormField";
import AppButton from "@/src/components/ui/AppButton";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, Text } from "react-native";

export default function ForgotPassword() {
  const router = useRouter();
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { email: "" } });

  const returnToSignIn = () => router.dismissTo("/(auth)/login");
  const onSubmit = async ({ email }: { email: string }) => {
    const result = await forgotPassword(email);
    if ("error" in result) {
      Alert.alert("Error", result.error);
    } else {
      Alert.alert("Success", "Check your email for reset link");
      returnToSignIn();
    }
  };

  return (
    <AuthScreen
      title="Forgot password?"
      subtitle="Enter your account email to receive a reset link."
      onBack={returnToSignIn}
      footer={
        <>
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={returnToSignIn}
            style={({ pressed }) => [authStyles.footerLink, pressed && authStyles.pressed]}
          >
            <Text style={authStyles.link}>Back to sign in</Text>
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
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="you@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={handleSubmit(onSubmit)}
            editable={!isSubmitting}
            inputStyle={authStyles.input}
            labelStyle={authStyles.label}
          />
        )}
      />
      <AppButton
        title="Send reset link"
        loadingTitle="Sending…"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        size="md"
        fullWidth
        textStyle={authStyles.buttonText}
      />
    </AuthScreen>
  );
}
