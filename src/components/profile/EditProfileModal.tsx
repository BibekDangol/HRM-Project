import { ProfileData } from "@/src/types/profile.types";
import { FormInput, FormOutput } from "@/src/types/user";
import { TW } from "@/theme/twStyles";
import { Lock, X } from "lucide-react-native";
import React from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  Text,
  TouchableWithoutFeedback,
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                width: "100%",
                maxWidth: 380,
                backgroundColor: "#FFFFFF",
                borderRadius: 22,
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 14,
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
                elevation: 8,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "800",
                      color: "#111827",
                    }}
                  >
                    Edit Profile
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      marginTop: 2,
                    }}
                  >
                    Update your details
                  </Text>
                </View>
              </View>

              {/* Inputs */}
              <View>
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <ModalInput
                      label="First Name"
                      value={value ?? ""}
                      onChange={onChange}
                      onBlur={onBlur}
                      placeholder="Enter first name"
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
                      value={value ?? ""}
                      onChange={onChange}
                      onBlur={onBlur}
                      placeholder="Enter last name"
                      error={errors.lastName?.message}
                    />
                  )}
                />

                {/* Email */}
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: TW.bgSecondary,
                      marginBottom: 6,
                    }}
                  >
                    Email
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      backgroundColor: "#F9FAFB",
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                    }}
                  >
                    <Lock size={15} color={TW.bgSecondary} strokeWidth={1.9} />
                    <Text
                      numberOfLines={1}
                      style={{
                        flex: 1,
                        marginLeft: 8,
                        fontSize: 14,
                        color: "#6B7280",
                      }}
                    >
                      {profile?.email ?? "—"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  marginTop: 16,
                }}
              >
                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    onClose();
                  }}
                  style={({ pressed }) => ({
                    flex: 1,
                    height: 44,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    backgroundColor: "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#6B7280",
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    onSubmit();
                  }}
                  disabled={isSaving}
                  style={({ pressed }) => ({
                    flex: 1,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: TW.bgSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                    opacity: isSaving ? 0.7 : pressed ? 0.85 : 1,
                  })}
                >
                  {isSaving && (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  )}

                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    {isSaving ? "Saving..." : "Update"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
