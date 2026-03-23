import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
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

import { useDimension } from "@/src/hooks/useDimension";
import { useAuthStore } from "@/src/store/useAuthStore";
import { TW } from "@/theme/twStyles";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import tw from "twrnc";

const ForgotPassword = () => {
  const router = useRouter();
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const { isSmallPhone, isTablet, width } = useDimension();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: any) => {
    const res = await forgotPassword(email);

    if ("error" in res) {
      Alert.alert("Error", res.error);
    } else {
      Alert.alert("Success", "Check your email for reset link");
      router.back();
    }
  };

  return (
    <View style={tw`flex-1 ${TW.bgPrimary} justify-center`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={tw`flex-1`}
          behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: isTablet ? 40 : isSmallPhone ? 16 : 24,
              paddingTop: 20,
              paddingBottom: 20,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View
              style={[
                tw`flex-1 justify-between`,
                { maxWidth: isTablet ? 500 : width },
              ]}>
              <View style={tw`mt-8`}>
                {/* Back Button */}
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={tw`mb-4`}>
                  <ArrowLeft size={22} color="#7e7e7e" />
                </TouchableOpacity>
                {/* Header */}
                <View style={tw`mb-6 mt-8`}>
                  <Text style={tw`text-2xl font-bold ${TW.textPrimary}`}>
                    Forgot Password
                  </Text>
                  <Text
                    style={[
                      tw`${TW.textSecondary} mt-2`,
                      { fontSize: isTablet ? 18 : isSmallPhone ? 14 : 16 },
                    ]}>
                    Enter your email to receive a reset link
                  </Text>
                </View>

                {/* Email Field */}
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
                        autoCapitalize="none"
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                  )}
                />

                {/* Button */}
                <TouchableOpacity
                  style={[
                    tw`rounded-xl items-center justify-center ${TW.bgAction} mt-6`,
                    isSubmitting ? tw`opacity-90` : tw`opacity-100`,
                    {
                      paddingVertical: isTablet ? 18 : isSmallPhone ? 12 : 16,
                    },
                  ]}
                  onPress={handleSubmit(onSubmit)}
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
                      {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* 🔽 BOTTOM FIXED */}
              <View style={tw`flex-row justify-center mb-2`}>
                <Text
                  style={[
                    tw`${TW.textSecondary}`,
                    { fontSize: isTablet ? 15 : 14 },
                  ]}>
                  Remember your password?{" "}
                </Text>

                <TouchableOpacity onPress={() => router.back()}>
                  <Text
                    style={[
                      tw`${TW.textPrimary} font-semibold`,
                      { fontSize: isTablet ? 15 : 14 },
                    ]}>
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default ForgotPassword;
