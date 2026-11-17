import { colors } from "@/theme/colors";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TW } from "@/theme/twStyles";
import { X } from "lucide-react-native";
import tw from "@/theme/tw";

type Props = {
  visible: boolean;
  onClose: () => void;
  variant?: "center" | "bottom";
  title?: string;
  subtitle?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  closeDisabled?: boolean;
  statusBarTranslucent?: boolean;
  avoidKeyboard?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  scrollable?: boolean;
  maxWidth?: number;
  children: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function ModalShell({
  visible,
  onClose,
  variant = "center",
  title,
  subtitle,
  showHandle = false,
  showCloseButton = false,
  closeOnBackdropPress = true,
  closeDisabled = false,
  statusBarTranslucent = true,
  avoidKeyboard = false,
  loading = false,
  loadingMessage = "Loading...",
  scrollable = false,
  maxWidth = 380,
  children,
  footer,
  overlay,
  contentStyle,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    if (closeDisabled) return;
    Keyboard.dismiss();
    onClose();
  };

  const handleBackdrop = () => {
    if (!closeOnBackdropPress) return;
    handleClose();
  };

  const cardStyle =
    variant === "bottom"
      ? [
          tw`bg-white rounded-t-3xl px-6 pt-4`,
          { paddingBottom: Math.max(insets.bottom, 16) },
          contentStyle,
        ]
      : [
          tw`bg-white rounded-3xl px-5 pt-5 pb-4 w-full`,
          { maxWidth },
          contentStyle,
        ];

  const wrapperStyle =
    variant === "bottom"
      ? tw`flex-1 justify-end`
      : tw`flex-1 justify-center items-center px-5`;

  const card = (
    <View style={cardStyle}>
      {showHandle ? (
        <View style={tw`items-center mb-4`}>
          <View style={tw`h-1 w-12 rounded-full bg-gray-300`} />
        </View>
      ) : null}

      {title || subtitle || showCloseButton ? (
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <View style={tw`flex-1 pr-3`}>
            {title ? (
              <Text style={tw`text-section font-bold ${TW.textPrimary}`}>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text style={tw`text-description text-muted mt-1`}>{subtitle}</Text>
            ) : null}
          </View>

          {showCloseButton ? (
            <Pressable
              disabled={closeDisabled}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={({ pressed }) => [
                tw`h-12 w-12 rounded-full bg-gray-100 items-center justify-center`,
                (pressed || closeDisabled) && tw`opacity-60`,
              ]}
            >
              <X size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {scrollable ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 520 }}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}

      {footer ? <View style={tw`mt-4`}>{footer}</View> : null}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={statusBarTranslucent}
      onRequestClose={handleClose}
    >
      <View style={tw`flex-1`}>
        <Pressable
          onPress={handleBackdrop}
          style={tw`absolute inset-0 bg-black/40`}
          accessibilityLabel="Close modal"
        />

        {overlay}

        {avoidKeyboard ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={tw`flex-1`}
            pointerEvents="box-none"
          >
            <View style={wrapperStyle} pointerEvents="box-none">
              {card}
            </View>
          </KeyboardAvoidingView>
        ) : (
          <View style={wrapperStyle} pointerEvents="box-none">
            {card}
          </View>
        )}

        {loading ? (
          <View style={tw`absolute inset-0 bg-black/30 items-center justify-center z-50`}>
            <View style={tw`bg-white p-6 rounded-2xl items-center`}>
              <ActivityIndicator size="large" color={TW.bgSecondary} />
              <Text style={tw`mt-3 font-semibold ${TW.textPrimary}`}>
                {loadingMessage}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
