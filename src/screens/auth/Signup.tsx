import AuthScreen, { authStyles } from "@/src/components/auth/AuthScreen";
import FormField from "@/src/components/form/FormField";
import PasswordField from "@/src/components/form/PasswordField";
import AppButton from "@/src/components/ui/AppButton";
import { signupSchema } from "@/src/schema/auth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Keyboard, Pressable, Text, View } from "react-native";
import { z } from "zod";

type FormData = z.infer<typeof signupSchema>;

const steps: { title: string; subtitle: string; fields: (keyof FormData)[] }[] = [
  { title: "Admin full name", subtitle: "Enter the administrator’s first and last name.", fields: ["firstName", "lastName"] },
  { title: "Your organization", subtitle: "Add your organization and account email.", fields: ["organizationName", "email"] },
  { title: "Set your password", subtitle: "Choose a password to protect your account.", fields: ["password", "confirmPassword"] },
];

export default function SignupScreen() {
  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);
  const [step, setStep] = useState(0);
  const {
    control,
    handleSubmit,
    trigger,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
    shouldUnregister: false,
    defaultValues: { firstName: "", lastName: "", organizationName: "", email: "", password: "", confirmPassword: "" },
  });
  const currentStep = steps[step];
  const returnToSignIn = () => router.dismissTo("/(auth)/login");
  const goBack = () => {
    Keyboard.dismiss();
    if (step > 0) setStep(step - 1);
    else returnToSignIn();
  };
  const nextStep = async () => {
    Keyboard.dismiss();
    if (await trigger(currentStep.fields)) setStep(step + 1);
  };
  const handleSignup = async (data: FormData) => {
    try {
      await signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        organizationName: data.organizationName,
      });
      Alert.alert("Success", "Organization created. Please login.");
      returnToSignIn();
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
    }
  };
  const submit = handleSubmit(handleSignup, (fieldErrors) => {
    Keyboard.dismiss();
    const invalidStep = steps.findIndex((item) => item.fields.some((field) => fieldErrors[field]));
    if (invalidStep >= 0) setStep(invalidStep);
  });

  return (
    <AuthScreen
      title={currentStep.title}
      subtitle={currentStep.subtitle}
      onBack={goBack}
      footer={
        <>
          <Text style={authStyles.footerText}>Already have an account?</Text>
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={returnToSignIn}
            style={({ pressed }) => [authStyles.footerLink, pressed && authStyles.pressed]}
          >
            <Text style={authStyles.link}>Sign in</Text>
          </Pressable>
        </>
      }
    >
      <Text accessibilityLiveRegion="polite" style={authStyles.footerText}>Step {step + 1} of {steps.length}</Text>
      {step === 0 ? (
        <>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <FormField
                inputRef={ref}
                variant="outlined"
                label="First name"
                placeholder="First name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => setFocus("lastName")}
                editable={!isSubmitting}
                error={errors.firstName?.message}
                labelStyle={authStyles.label}
                inputStyle={authStyles.input}
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <FormField
                inputRef={ref}
                variant="outlined"
                label="Last name"
                placeholder="Last name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={nextStep}
                editable={!isSubmitting}
                error={errors.lastName?.message}
                labelStyle={authStyles.label}
                inputStyle={authStyles.input}
              />
            )}
          />
        </>
      ) : step === 1 ? (
        <>
          <Controller
            control={control}
            name="organizationName"
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <FormField
                inputRef={ref}
                variant="outlined"
                label="Organization name"
                placeholder="Your organization"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => setFocus("email")}
                editable={!isSubmitting}
                error={errors.organizationName?.message}
                labelStyle={authStyles.label}
                inputStyle={authStyles.input}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <FormField
                inputRef={ref}
                variant="outlined"
                label="Email address"
                placeholder="you@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                returnKeyType="next"
                onSubmitEditing={nextStep}
                editable={!isSubmitting}
                error={errors.email?.message}
                labelStyle={authStyles.label}
                inputStyle={authStyles.input}
              />
            )}
          />
        </>
      ) : (
        <>
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <PasswordField
                inputRef={ref}
                variant="outlined"
                label="Password"
                placeholder="Create a password"
                textContentType="newPassword"
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => setFocus("confirmPassword")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isSubmitting}
                error={errors.password?.message}
                labelStyle={authStyles.label}
                inputStyle={authStyles.input}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <PasswordField
                inputRef={ref}
                variant="outlined"
                label="Confirm password"
                placeholder="Re-enter your password"
                textContentType="newPassword"
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={submit}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isSubmitting}
                error={errors.confirmPassword?.message}
                labelStyle={authStyles.label}
                inputStyle={authStyles.input}
              />
            )}
          />
        </>
      )}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <AppButton
          title="Back"
          variant="secondary"
          disabled={isSubmitting}
          onPress={goBack}
          style={{ width: 88, paddingHorizontal: 12 }}
        />
        <AppButton
          title={step === steps.length - 1 ? "Create account" : "Continue"}
          loadingTitle="Creating…"
          loading={isSubmitting}
          onPress={step === steps.length - 1 ? submit : nextStep}
          style={{ flex: 1 }}
        />
      </View>
    </AuthScreen>
  );
}
