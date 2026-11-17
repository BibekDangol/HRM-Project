import { BackButton } from "@/src/components/BackButton";
import { colors } from "@/theme/colors";
import { StatusBar } from "expo-status-bar";
import { useState, type ReactNode } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
  showBrand?: boolean;
};

export default function AuthScreen({ title, subtitle, children, footer, onBack, showBrand = false }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  // Keep the initial spacing when Android resizes the window for the keyboard.
  const [compact] = useState(height < 700);

  return (
    <KeyboardAvoidingView style={authStyles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="dark" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[
          authStyles.canvas,
          {
            paddingTop: insets.top + (compact ? 10 : 24),
            paddingBottom: insets.bottom + (compact ? 12 : 20),
            paddingLeft: insets.left + (width < 360 ? 20 : 24),
            paddingRight: insets.right + (width < 360 ? 20 : 24),
          },
        ]}>
          <View style={authStyles.content}>
            {showBrand ? (
              <View style={[authStyles.brand, compact && { marginBottom: 12 }]}>
                <Image source={require("@/src/assets/images/oddoo-hrm-symbol-v1.png")} style={authStyles.logo} resizeMode="contain" accessible={false} />
                <View style={authStyles.brandText}>
                  <Text style={authStyles.brandName}>Oddooo</Text>
                  <Text style={authStyles.brandDescription}>Workforce management</Text>
                </View>
              </View>
            ) : null}
            <View style={[authStyles.introduction, compact && { marginBottom: 12 }]}>
              <View style={authStyles.headingRow}>
                {onBack ? <BackButton onPress={onBack} /> : null}
                <Text accessibilityRole="header" style={[authStyles.heading, onBack && authStyles.headingWithBack]}>{title}</Text>
              </View>
              {!compact ? <Text style={authStyles.subtitle}>{subtitle}</Text> : null}
            </View>
            <View style={[authStyles.form, compact && { gap: 10 }]}>{children}</View>
            {footer ? <View style={authStyles.footer}>{footer}</View> : null}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

export const authStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  canvas: { flex: 1 },
  content: { width: "100%", maxWidth: 440, alignSelf: "center" },
  brand: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 28 },
  logo: { width: 48, height: 48 },
  brandText: { flex: 1, gap: 3 },
  brandName: { fontSize: 22, fontWeight: "700", color: colors.ink },
  brandDescription: { fontSize: 13, lineHeight: 20, color: colors.muted },
  introduction: { gap: 8, marginBottom: 24 },
  headingRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headingWithBack: { flex: 1, fontSize: 24 },
  heading: { fontSize: 28, fontWeight: "700", letterSpacing: -0.6, color: colors.ink },
  subtitle: { fontSize: 15, lineHeight: 22, color: colors.muted },
  form: { gap: 16 },
  label: { fontSize: 14, fontWeight: "600", color: colors.ink },
  input: { fontSize: 16, paddingVertical: 10 },
  forgotPassword: { alignSelf: "flex-end", minHeight: 48, paddingLeft: 12, justifyContent: "center" },
  link: { fontSize: 14, fontWeight: "600", color: colors.primary },
  buttonText: { fontSize: 16 },
  footer: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", columnGap: 4, marginTop: 12 },
  footerText: { fontSize: 14, color: colors.muted },
  footerLink: { minHeight: 48, justifyContent: "center" },
  pressed: { opacity: 0.7 },
});
