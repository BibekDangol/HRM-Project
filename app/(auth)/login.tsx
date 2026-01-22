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
import { MaterialCommunityIcons } from "@expo/vector-icons";

//ZOD Schema
const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

//ZOD Inferred
type FormData = z.infer<typeof schema>;

//React-hook-form
const Login: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const toggleShowPassword = () => setShowPassword((p) => !p);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  //supabase
  const onSubmit = async (data: FormData) => {
    try {
      const email = data.email.trim().toLowerCase();
      const password = data.password;

      // 1) Login
      const { data: signInData, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        Alert.alert("Login Failed", error.message);
        return;
      }

      const userId = signInData.user?.id;
      if (!userId) {
        Alert.alert("Login Failed", "User not found.");
        return;
      }

      // 2) Check approval_status from profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileError) {
        Alert.alert("Error", profileError.message);
        return;
      }

      if (profile.role === "admin") {
        router.replace("/(admin)/admin_dashboard");
      } else {
        router.replace("/(tabs)/home");
      }

      // approved
      // router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Welcome</Text>

          {/* EMAIL */}
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

                {/* wrapper to place icon inside */}
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#dcdada"
                    secureTextEntry={!showPassword}
                    value={value}
                    onChangeText={onChange}
                  />

                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off" : "eye"}
                    size={22}
                    color="#888"
                    style={styles.icon}
                    onPress={toggleShowPassword}
                  />
                </View>

                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Pressable
            style={styles.loginButton}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.loginButtonText}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Text>
          </Pressable>

          <Text style={styles.footerText}>
            Organization sign-up{" "}
            <Text
              style={styles.footerLink}
              onPress={() => router.push("/register")}
            >
              Register
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
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

  loginButton: {
    height: 52,
    backgroundColor: "#1F7A4D",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    elevation: 4,
  },

  loginButtonText: {
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
    borderRadius: 8,
  },

  backButtonText: {
    fontSize: 16,
    color: "#1F7A4D",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
  },

  icon: {
    marginLeft: 10,
  },
});
