import { BackButton } from "@/src/components/BackButton";
import { useDimension } from "@/src/hooks/useDimension";
import { signupSchema } from "@/src/schema/auth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const inputVerticalPadding = isTablet ? 18 : isSmallPhone ? 12 : 15;
  const labelFontSize = isTablet ? 16 : 14;
  const inputFontSize = isTablet ? 16 : 14;
  const horizontalPadding = isTablet ? 40 : isSmallPhone ? 16 : 24;
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
                  Create Organization
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
                  Register your organization to get started
                </Text>
              </View>

              {/* FORM FIELDS */}
              <View style={tw`w-full`}>
                {/* First Name */}
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <View style={{ marginBottom: fieldGap }}>
                      <Text
                        style={[
                          tw`${TW.textSecondary} font-semibold`,
                          { fontSize: labelFontSize, marginBottom: 6 },
                        ]}
                      >
                        First Name *
                      </Text>
                      <TextInput
                        placeholder="First Name"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholderTextColor="#b8b5b5"
                        returnKeyType="next"
                        autoCapitalize="words"
                        style={[
                          tw`${TW.bgButton} rounded-xl px-4`,
                          {
                            paddingVertical: inputVerticalPadding,
                            fontSize: inputFontSize,
                          },
                        ]}
                      />
                      {errors.firstName && (
                        <Text style={tw`text-[#FF6B6B] text-[13px] mt-1 ml-1`}>
                          {errors.firstName.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                {/* Last Name */}
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <View style={{ marginBottom: fieldGap }}>
                      <Text
                        style={[
                          tw`${TW.textSecondary} font-semibold mb-2`,
                          { fontSize: labelFontSize },
                        ]}
                      >
                        Last Name *
                      </Text>
                      <TextInput
                        placeholder="Last Name"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholderTextColor="#b8b5b5"
                        returnKeyType="next"
                        autoCapitalize="words"
                        style={[
                          tw`${TW.bgButton} rounded-xl px-4`,
                          {
                            paddingVertical: inputVerticalPadding,
                            fontSize: inputFontSize,
                          },
                        ]}
                      />
                      {errors.lastName && (
                        <Text style={tw`text-[#FF6B6B] text-[13px] mt-1 ml-1`}>
                          {errors.lastName.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                {/* Organization Name */}
                <Controller
                  control={control}
                  name="organizationName"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <View style={{ marginBottom: fieldGap }}>
                      <Text
                        style={[
                          tw`${TW.textSecondary} font-semibold mb-2`,
                          { fontSize: labelFontSize },
                        ]}
                      >
                        Organization Name *
                      </Text>
                      <TextInput
                        placeholder="Organization Name"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholderTextColor="#b8b5b5"
                        returnKeyType="next"
                        autoCapitalize="words"
                        style={[
                          tw`${TW.bgButton} rounded-xl px-4`,
                          {
                            paddingVertical: inputVerticalPadding,
                            fontSize: inputFontSize,
                          },
                        ]}
                      />
                      {errors.organizationName && (
                        <Text style={tw`text-[#FF6B6B] text-[13px] mt-1 ml-1`}>
                          {errors.organizationName.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                {/* Email */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <View style={{ marginBottom: fieldGap }}>
                      <Text
                        style={[
                          tw`${TW.textSecondary} font-semibold mb-2`,
                          { fontSize: labelFontSize },
                        ]}
                      >
                        Email *
                      </Text>
                      <TextInput
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        returnKeyType="next"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholderTextColor="#b8b5b5"
                        style={[
                          tw`${TW.bgButton} rounded-xl px-4`,
                          {
                            paddingVertical: inputVerticalPadding,
                            fontSize: inputFontSize,
                          },
                        ]}
                      />
                      {errors.email && (
                        <Text style={tw`text-[#FF6B6B] text-[13px] mt-1 ml-1`}>
                          {errors.email.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                {/* Password */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <View style={{ marginBottom: fieldGap }}>
                      <Text
                        style={[
                          tw`${TW.textSecondary} font-semibold mb-2`,
                          { fontSize: labelFontSize },
                        ]}
                      >
                        Password *
                      </Text>
                      <View
                        style={tw`${TW.bgButton} rounded-xl flex-row items-center px-1`}
                      >
                        <TextInput
                          style={[
                            tw`flex-1 px-3`,
                            {
                              paddingVertical: inputVerticalPadding,
                              fontSize: inputFontSize,
                            },
                          ]}
                          placeholder="• • • • • • • • • • • • •"
                          placeholderTextColor="#b8b5b5"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          textContentType="newPassword"
                          autoComplete="new-password"
                          returnKeyType="next"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword((prev) => !prev)}
                          hitSlop={10}
                          style={tw`px-3 py-2`}
                        >
                          {showPassword ? (
                            <EyeOff size={isTablet ? 24 : 22} color="#888" />
                          ) : (
                            <Eye size={isTablet ? 24 : 22} color="#888" />
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

                {/* Confirm Password */}
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <View style={{ marginBottom: fieldGap }}>
                      <Text
                        style={[
                          tw`${TW.textSecondary} font-semibold mb-2`,
                          { fontSize: labelFontSize },
                        ]}
                      >
                        Confirm Password *
                      </Text>
                      <View
                        style={tw`${TW.bgButton} rounded-xl flex-row items-center px-1`}
                      >
                        <TextInput
                          style={[
                            tw`flex-1 px-3`,
                            {
                              paddingVertical: inputVerticalPadding,
                              fontSize: inputFontSize,
                            },
                          ]}
                          placeholder="• • • • • • • • • • • • •"
                          placeholderTextColor="#b8b5b5"
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          textContentType="newPassword"
                          autoComplete="new-password"
                          returnKeyType="done"
                          onSubmitEditing={handleSubmit(handleSignup)}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          hitSlop={10}
                          style={tw`px-3 py-2`}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={isTablet ? 24 : 22} color="#888" />
                          ) : (
                            <Eye size={isTablet ? 24 : 22} color="#888" />
                          )}
                        </TouchableOpacity>
                      </View>
                      {errors.confirmPassword && (
                        <Text style={tw`text-[#FF6B6B] text-[13px] mt-1 ml-1`}>
                          {errors.confirmPassword.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                {/* Submit Button */}
                <TouchableOpacity
                  disabled={loading}
                  onPress={handleSubmit(handleSignup)}
                  activeOpacity={0.75}
                  style={[
                    tw`rounded-xl items-center justify-center ${TW.bgAction}`,
                    { paddingVertical: isTablet ? 18 : 15, marginTop: 4 },
                    loading && tw`opacity-70`,
                  ]}
                >
                  <Text
                    style={[
                      tw`${TW.textButton} font-semibold`,
                      { fontSize: isTablet ? 18 : 16 },
                    ]}
                  >
                    {loading ? "Creating..." : "Create Organization"}
                  </Text>
                </TouchableOpacity>

                {/* Login redirect */}
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/login")}
                  activeOpacity={0.7}
                  style={tw`mt-3`}
                >
                  <Text
                    style={[
                      tw`text-center ${TW.textPrimary}`,
                      { fontSize: isTablet ? 15 : 14 },
                    ]}
                  >
                    Already have an account?{" "}
                    <Text style={tw`font-semibold underline`}>Login</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
          <View style={{ height: insets.bottom + 10 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
