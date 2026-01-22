import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { supabase } from "../../lib/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";

//ZOD schema
const schema = z
  .object({
    first_name: z
      .string()
      .min(1, "First name is required.")
      .max(50, "First name too long.")
      .regex(/^[A-Za-z]+$/, "First name must only contain letters"),

    last_name: z
      .string()
      .min(1, "Last name is required.")
      .max(50, "Last name too long")
      .regex(/^[A-Za-z]+$/, "Last name must only contain letters"),

    organization_name: z
      .string()
      .min(1, "Last name is required.")
      .max(50, "Last name too long"),

    email: z.email("Invalid email address").min(1, "Email is required.").trim(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character.",
      ),

    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

//zod inferred
type FormData = z.infer<typeof schema>;

//react hook form
const Register: React.FC = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  //supabase
  const onSubmit = async (data: FormData) => {
    try {
      const { first_name, last_name, organization_name, email, password } =
        data;
      const cleanEmail = email.trim().toLowerCase();

      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        // optional: store metadata too
        options: {
          data: {
            first_name,
            last_name,
            organization_name,
          },
        },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      // If email confirmation is ON, user may exist but session/user might not be usable yet.
      if (!userId) {
        Alert.alert(
          "Check your email",
          "Account created. Please confirm your email, then login.",
        );
        router.replace("/login");
        return;
      }

      //  2) DO NOT INSERT profile (trigger already did)
      //  Update the profile row created by trigger
      const { data: updData, error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          first_name,
          last_name,
          organization_name,
        })
        .eq("id", userId)
        .select(); // ✅ IMPORTANT: forces return, easier to debug

      console.log("UPDATE RESULT:", updData);
      console.log("UPDATE ERROR:", profileUpdateError);

      if (profileUpdateError) {
        console.log("PROFILE UPDATE ERROR:", profileUpdateError);
        Alert.alert("Profile Error", profileUpdateError.message);
        throw profileUpdateError;
      }

      Alert.alert(
        "Success",
        "Account created successfully! Please wait for approval if required.",
      );
      router.replace("/login");
    } catch (error: any) {
      console.error("Signup Error:", error);
      Alert.alert(
        "Registration Error",
        error.message ?? "Something went wrong",
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/login");
            }
          }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Create Account</Text>

          <Controller
            control={control}
            name="first_name"
            render={({ field: { value, onChange } }) => (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor="#dcdada"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.first_name && (
                  <Text style={styles.errorText}>
                    {errors.first_name.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="last_name"
            render={({ field: { value, onChange } }) => (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor="#dcdada"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.last_name && (
                  <Text style={styles.errorText}>
                    {errors.last_name.message}
                  </Text>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="organization_name"
            render={({ field: { value, onChange } }) => (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Organization Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your organization name"
                  placeholderTextColor="#dcdada"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.organization_name && (
                  <Text style={styles.errorText}>
                    {errors.organization_name.message}
                  </Text>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#dcdada"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#dcdada"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                />
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="confirm_password"
            render={({ field: { value, onChange } }) => (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Confirm Password </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#dcdada"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                />
                {errors.confirm_password && (
                  <Text style={styles.errorText}>
                    {errors.confirm_password.message}
                  </Text>
                )}
              </View>
            )}
          />
          <Pressable
            style={styles.registerButton}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.registerButtonText}>
              {isSubmitting ? "Registering..." : "Register"}
            </Text>
          </Pressable>

          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text
              style={styles.footerLink}
              onPress={() => router.push("/login")}
            >
              Login
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: "center",
    paddingTop: 34,
    paddingBottom: 60,
    paddingHorizontal: 24,
    backgroundColor: "#F5F5F5",
  },

  heading: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
    color: "#1F7A4D",
  },

  input: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 10,
  },

  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 4,
  },

  registerButton: {
    height: 52,
    backgroundColor: "#1F7A4D",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    elevation: 4,
  },

  registerButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  footerText: {
    marginTop: 22,
    textAlign: "center",
    fontSize: 14,
    color: "#1D1D1D",
  },

  footerLink: {
    color: "#1F7A4D",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#6E6F71",
  },
  inputWrapper: {
    marginBottom: 5,
  },
  backButton: {
    marginBottom: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    // backgroundColor: "#E0E0E0",
    borderRadius: 8,
  },

  backButtonText: {
    fontSize: 16,
    // fontWeight: "600",
    color: "#1F7A4D",
  },
});
