import { BackButton } from "@/src/components/BackButton";
import FormField from "@/src/components/form/FormField";
import PasswordField from "@/src/components/form/PasswordField";
import AppButton from "@/src/components/ui/AppButton";
import { useDimension } from "@/src/hooks/useDimension";
import { signupSchema } from "@/src/schema/auth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "twrnc";
import { z } from "zod";

type FormData = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, loading } = useAuthStore();
  const { isSmallPhone, isTablet } = useDimension();

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

  const horizontalPadding = isTablet ? 40 : isSmallPhone ? 16 : 24;
  const labelFontSize = isTablet ? 16 : 14;
  const inputFontSize = isTablet ? 16 : 14;
  const fieldGap = isTablet ? 20 : isSmallPhone ? 14 : 16;
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
      router.push("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
      console.log("SIGNUP ERROR", error);
    }
  };

  return (
    <View style={[tw`flex-1 ${TW.bgPrimary}`, { paddingTop: insets.top }]}>
      {/* Back button */}
      <View
        style={[
          tw`absolute z-10`,
          {
            top: insets.top + (isTablet ? 10 : 6),
            left: horizontalPadding,
          },
        ]}
      >
        <BackButton />
      </View>

      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingTop: isTablet ? 68 : 56,
            flexGrow: 1,
          }}
        >
          <Pressable onPress={Keyboard.dismiss} accessible={false}>
            <View
              style={[
                tw`w-full self-center`,
                { maxWidth: isTablet ? 620 : 480 },
              ]}
            >
              {/* TITLE */}
              <View style={tw`items-center mb-8`}>
                <Text
                  style={[
                    tw`font-bold ${TW.textPrimary} text-center`,
                    { fontSize: isTablet ? 34 : 28 },
                  ]}
                >
                  Get Started
                </Text>
                <Text
                  style={[
                    tw`${TW.textSecondary} text-center mt-2`,
                    {
                      fontSize: isTablet ? 17 : 15,
                      lineHeight: isTablet ? 24 : 21,
                    },
                  ]}
                >
                  Set up your organization in a few simple steps
                </Text>
              </View>

              {/* FORM FIELDS */}
              <View style={tw`w-full`}>
                {/* First Name */}
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <FormField
                      label="First Name *"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="First Name"
                      returnKeyType="next"
                      autoCapitalize="words"
                      error={errors.firstName?.message}
                      labelStyle={{ fontSize: labelFontSize }}
                      inputStyle={{ fontSize: inputFontSize }}
                      containerStyle={{ marginBottom: fieldGap }}
                    />
                  )}
                />

                {/* Last Name */}
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <FormField
                      label="Last Name *"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Last Name"
                      returnKeyType="next"
                      autoCapitalize="words"
                      error={errors.lastName?.message}
                      labelStyle={{ fontSize: labelFontSize }}
                      inputStyle={{ fontSize: inputFontSize }}
                      containerStyle={{ marginBottom: fieldGap }}
                    />
                  )}
                />

                {/* Organization Name */}
                <Controller
                  control={control}
                  name="organizationName"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <FormField
                      label="Organization Name *"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Organization Name"
                      returnKeyType="next"
                      autoCapitalize="words"
                      error={errors.organizationName?.message}
                      labelStyle={{ fontSize: labelFontSize }}
                      inputStyle={{ fontSize: inputFontSize }}
                      containerStyle={{ marginBottom: fieldGap }}
                    />
                  )}
                />

                {/* Email */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <FormField
                      label="Email *"
                      placeholder="info@company.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      returnKeyType="next"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                      labelStyle={{ fontSize: labelFontSize }}
                      inputStyle={{ fontSize: inputFontSize }}
                      containerStyle={{ marginBottom: fieldGap }}
                    />
                  )}
                />

                {/* Password */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <PasswordField
                      label="Password *"
                      placeholder="•••••••••••••"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="newPassword"
                      autoComplete="new-password"
                      returnKeyType="next"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                      labelStyle={{ fontSize: labelFontSize }}
                      inputStyle={{ fontSize: inputFontSize }}
                      containerStyle={{ marginBottom: fieldGap }}
                      iconSize={isTablet ? 24 : 22}
                    />
                  )}
                />

                {/* Confirm Password */}
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <PasswordField
                      label="Confirm Password *"
                      placeholder="•••••••••••••"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="newPassword"
                      autoComplete="new-password"
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(handleSignup)}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.confirmPassword?.message}
                      labelStyle={{ fontSize: labelFontSize }}
                      inputStyle={{ fontSize: inputFontSize }}
                      containerStyle={{ marginBottom: fieldGap }}
                      iconSize={isTablet ? 24 : 22}
                    />
                  )}
                />
                <View style={[tw`flex-col w-full`, { gap: 16, marginTop: 16 }]}>
                  {/* Submit Button */}
                  <AppButton
                    title="Register"
                    loadingTitle="Creating..."
                    onPress={handleSubmit(handleSignup)}
                    loading={loading}
                    size={isTablet ? "lg" : isSmallPhone ? "sm" : "md"}
                    textStyle={{ fontSize: isTablet ? 18 : 14 }}
                    style={tw`mt-1`}
                  />

                  {/* Login redirect */}

                  <View style={tw`flex-row justify-center`}>
                    <Text
                      style={[
                        tw`${TW.textPrimary}`,
                        { fontSize: isTablet ? 15 : 14 },
                      ]}
                    >
                      Already have an account?{" "}
                    </Text>

                    <TouchableOpacity
                      onPress={() => router.push("/(auth)/login")}
                    >
                      <Text
                        style={[
                          tw`${TW.textPrimary} font-semibold underline`,
                          { fontSize: isTablet ? 15 : 14 },
                        ]}
                      >
                        Log in
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
          <View style={{ height: insets.bottom + 10 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
