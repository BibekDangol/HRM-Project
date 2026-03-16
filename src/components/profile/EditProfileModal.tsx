import { ProfileData } from "@/src/types/profile.types";
import { FormInput, FormOutput } from "@/src/types/user";
import { TW } from "@/theme/twStyles";
import { Lock, X } from "lucide-react-native";
import React from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import ModalInput from "./ModalInput";

type Props = {
  visible: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  control: Control<FormInput, unknown, FormOutput>;
  errors: FieldErrors<FormOutput>;
  isSaving: boolean;
  onSubmit: () => void;
};

export default function EditProfileModal({
  visible,
  onClose,
  profile,
  control,
  errors,
  isSaving,
  onSubmit,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
          onPress={onClose}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "#ffffff",
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: Platform.OS === "ios" ? 44 : 32,
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 18 }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: TW.BORDER,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 22,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: TW.bgSecondary,
                  letterSpacing: -0.2,
                }}
              >
                Edit Profile
              </Text>

              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={({ pressed }) => ({
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: TW.BORDER,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <X size={15} color={TW.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>

            <Controller
              control={control}
              name="firstName"
              render={({ field: { value, onChange, onBlur } }) => (
                <ModalInput
                  label="First Name"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="First name"
                  error={errors.firstName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field: { value, onChange, onBlur } }) => (
                <ModalInput
                  label="Last Name"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="Last name"
                  error={errors.lastName?.message}
                />
              )}
            />

            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#6B7280",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                marginBottom: 7,
              }}
            >
              Email
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 9,
                backgroundColor: TW.BORDER,
                borderWidth: 1,
                borderColor: "#6B7280",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 13,
                marginBottom: 24,
              }}
            >
              <Lock size={13} color={TW.bgSecondary} strokeWidth={1.8} />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "500",
                  color: TW.textPrimary,
                }}
              >
                {profile?.email ?? "—"}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({
                  flex: 1,
                  borderWidth: 1.5,
                  borderColor: "#6B7280",
                  borderRadius: 13,
                  paddingVertical: 14,
                  alignItems: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: TW.textSecondary,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={onSubmit}
                disabled={isSaving}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: TW.bgSecondary,
                  borderRadius: 13,
                  paddingVertical: 14,
                  alignItems: "center",
                  opacity: isSaving ? 0.55 : pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}
                >
                  {isSaving ? "Saving…" : "Update"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
