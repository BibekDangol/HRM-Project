import { colors } from "@/theme/colors";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "@/theme/tw";

import FormField from "@/src/components/form/FormField";
import AppButton from "@/src/components/ui/AppButton";
import { useDimension } from "@/src/hooks/useDimension";
import { useAuthStore } from "@/src/store/useAuthStore";
import { TW } from "@/theme/twStyles";

const ForgotPassword = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const { isSmallPhone, isTablet } = useDimension();

  const fieldGap = isTablet ? 20 : isSmallPhone ? 14 : 16;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: { email: string }) => {
    const res = await forgotPassword(email);

    if ("error" in res) {
      Alert.alert("Error", res.error);
    } else {
      Alert.alert("Success", "Check your email for reset link");
      router.back();
    }
  };

  return (
    <View style={[tw`flex-1 ${TW.bgPrimary}`, { paddingTop: insets.top }]}>
      <View
        style={[
          tw`absolute z-10`,
          {
            top: insets.top + 6,
            left: 20,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.subtle} />
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={tw`flex-1`}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: isTablet ? 40 : isSmallPhone ? 16 : 24,
              paddingTop: isTablet ? 80 : 70,
              flexGrow: 1,
            }}
          >
            {/* CONTENT */}
            <View style={tw`w-full`}>
              {/* TITLE */}
              <View style={tw`items-center mb-8`}>
                <Text
                  style={[
                    tw`font-bold ${TW.textPrimary} text-center`,
                    { fontSize: isTablet ? 34 : 28 },
                  ]}
                >
                  Forgot Password
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
                  Enter your email to receive a reset link
                </Text>
              </View>

              {/* INPUT */}
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange } }) => (
                  <FormField
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    containerStyle={{ marginBottom: fieldGap }}
                  />
                )}
              />

              <AppButton
                title="Send Reset Link"
                loadingTitle="Sending..."
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                size={isTablet ? "lg" : isSmallPhone ? "sm" : "md"}
                textStyle={{ fontSize: isTablet ? 16 : 14 }}
                style={{ backgroundColor: TW.bgSecondary }}
              />

              {/* BOTTOM */}
              <View style={tw`flex-row justify-center mt-6`}>
                <Text
                  style={[
                    tw`${TW.textPrimary}`,
                    { fontSize: isTablet ? 15 : 14 },
                  ]}
                >
                  Remember your password?{" "}
                </Text>

                <TouchableOpacity onPress={() => router.back()}>
                  <Text
                    style={[
                      tw`${TW.textPrimary} font-semibold underline`,
                      { fontSize: isTablet ? 15 : 14 },
                    ]}
                  >
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
