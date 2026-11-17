import TempPasswordContent from "./TempPasswordContent";
import ErrorState from "@/src/components/states/ErrorState";
import type { AdminAddUserResponse } from "@/src/services/admin/add-user-service";
import type { AppError, ValidationFields } from "@/src/types/appError";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import FormActions from "@/src/components/form/FormActions";
import FormField from "@/src/components/form/FormField";
import ModalShell from "@/src/components/ui/ModalShell";
import { addUserSchema } from "@/src/schema/admin/addUserSchema";
import { UserProfile } from "@/src/types/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import tw from "@/theme/tw";
import { z } from "zod";
import { ChevronDown, ChevronUp } from "lucide-react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: AddUserFormData) => Promise<AdminAddUserResponse>;
  tempPassword?: string | null;
  supervisors: UserProfile[];
  currentUserId: string;
  isSubmitting: boolean;
}

export type AddUserFormData = z.infer<typeof addUserSchema>;

export default function AddUserModal({
  visible,
  tempPassword,
  onClose,
  onSubmit,
  isSubmitting,
  supervisors,
}: Props) {
  const router = useRouter();
  const { control, handleSubmit, reset, setError, clearErrors } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      supervisor_id: null,
    },
  });

  const [showOptions, setShowOptions] = useState(false);
  const [submitError, setSubmitError] = useState<AppError | null>(null);
  const [dropdownLayout, setDropdownLayout] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<View>(null);

  const openDropdown = () => {
    Keyboard.dismiss();
    if (triggerRef.current) {
      triggerRef.current.measure((_x, _y, width, height, pageX, pageY) => {
        setDropdownLayout({ top: pageY + height, left: pageX, width });
        setShowOptions(true);
      });
    }
  };

  const submit = async (data: AddUserFormData) => {
    clearErrors();
    setSubmitError(null);
    const result = await onSubmit(data);
    if (!result.success) {
      setSubmitError(result.error);
      if (result.error.kind === "validation") {
        const fieldNames: Partial<Record<keyof ValidationFields, keyof AddUserFormData>> = {
          email: "email", firstName: "first_name", lastName: "last_name",
          first_name: "first_name", last_name: "last_name", supervisor_id: "supervisor_id",
        };
        for (const [field, issue] of Object.entries(result.error.fields)) {
          const name = fieldNames[field as keyof ValidationFields];
          if (name) setError(name, {
            type: "server",
            message: issue === "alreadyExists" ? "This value is already in use." : issue === "required" ? "This field is required." : "Enter a valid value.",
          });
        }
      }
      return;
    }
    Keyboard.dismiss();
    reset();
    setSubmitError(null);
    setShowOptions(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    Keyboard.dismiss();
    reset();
    setShowOptions(false);
    setSubmitError(null);
    onClose();
  };

  const handleSignIn = async () => {
    await useAuthStore.getState().signOut();
    useUsersStore.setState({ currentUserProfile: null, selectedUserProfile: null, users: [], organizationName: "" });
    handleClose();
    router.replace("/(auth)/login");
  };

  const dropdownOverlay = showOptions ? (
    <>
      <Pressable
        onPress={() => setShowOptions(false)}
        style={tw`absolute inset-0 z-40`}
      />
      <View
        style={[
          tw`absolute bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden`,
          {
            top: dropdownLayout.top,
            left: dropdownLayout.left,
            width: dropdownLayout.width,
          },
        ]}
      >
        <ScrollView
          style={{ maxHeight: 220 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          <Controller
            control={control}
            name="supervisor_id"
            render={({ field: { onChange } }) => (
              <>
                <Pressable
                  onPress={() => {
                    onChange(null);
                    setShowOptions(false);
                  }}
                  style={tw`px-4 py-3 border-b border-gray-100`}
                >
                  <Text style={tw`font-semibold`}>Self</Text>
                </Pressable>
                {supervisors.map((sup) => (
                  <Pressable
                    key={sup.id}
                    onPress={() => {
                      onChange(sup.id);
                      setShowOptions(false);
                    }}
                    style={tw`px-4 py-3 border-b border-gray-100`}
                  >
                    <Text style={tw`text-body text-ink`}>
                      {sup.first_name} {sup.last_name}
                    </Text>
                  </Pressable>
                ))}
              </>
            )}
          />
        </ScrollView>
      </View>
    </>
  ) : null;

  return (
    <ModalShell
      visible={visible}
      onClose={handleClose}
      title={tempPassword ? "User Created" : "Add New User"}
      subtitle={tempPassword ? "Save this temporary password — it won't be shown again." : undefined}
      avoidKeyboard
      closeDisabled={isSubmitting}
      closeOnBackdropPress={!isSubmitting && !tempPassword}
      overlay={tempPassword ? undefined : dropdownOverlay}
      footer={tempPassword ? undefined : (
        <FormActions
          onCancel={handleClose}
          onSubmit={handleSubmit(submit)}
          submitLabel={submitError && submitError.kind !== "validation" && submitError.kind !== "unauthorized" ? "Try again" : "Add User"}
          loadingTitle="Adding..."
          loading={isSubmitting}
          cancelDisabled={isSubmitting}
          submitDisabled={submitError?.kind === "unauthorized"}
        />
      )}
    >
      {!tempPassword && submitError ? (
        <ErrorState
          error={submitError}
          onRetry={submitError.kind === "unauthorized" ? handleSignIn : undefined}
          retryLabel="Sign in again"
        />
      ) : null}
      {tempPassword ? (
        <TempPasswordContent tempPassword={tempPassword} onDone={handleClose} />
      ) : (
        <>
          {/* First Name */}
          <Controller
            control={control}
            name="first_name"
            render={({
              field: { value, onChange, onBlur },
              fieldState: { error },
            }) => (
              <FormField
                label="First Name"
                labelVariant="compact"
                variant="filled"
                placeholder="John"
                placeholderTextColor={colors.placeholder}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                returnKeyType="next"
                error={error?.message}
                containerStyle={tw`mb-3`}
              />
            )}
          />

          {/* Last Name */}
          <Controller
            control={control}
            name="last_name"
            render={({
              field: { value, onChange, onBlur },
              fieldState: { error },
            }) => (
              <FormField
                label="Last Name"
                labelVariant="compact"
                variant="filled"
                placeholder="Doe"
                placeholderTextColor={colors.placeholder}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                returnKeyType="next"
                error={error?.message}
                containerStyle={tw`mb-3`}
              />
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({
              field: { value, onChange, onBlur },
              fieldState: { error },
            }) => (
              <FormField
                label="Email"
                labelVariant="compact"
                variant="filled"
                placeholder="example@gmail.com"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                returnKeyType="done"
                error={error?.message}
                containerStyle={tw`mb-3`}
              />
            )}
          />

          {/* Supervisor */}
          <Controller
            control={control}
            name="supervisor_id"
            render={({ field: { value } }) => {
              const selected =
                value === null
                  ? "Self"
                  : supervisors.find((s) => s.id === value);

              return (
                <View style={tw`mb-2`}>
                  <Text style={tw`text-description font-semibold mb-1 text-gray-600`}>Supervisor</Text>
                  <Pressable
                    ref={triggerRef}
                    onPress={openDropdown}
                    style={tw`h-12 px-4 rounded-2xl bg-gray-100 flex-row items-center justify-between`}
                  >
                    <Text style={tw`text-body text-gray-800`}>
                      {typeof selected === "string"
                        ? selected
                        : selected
                          ? `${selected.first_name} ${selected.last_name}`
                          : "Select Supervisor"}
                    </Text>
                    {showOptions ? (
                      <ChevronUp size={18} color={colors.muted} />
                    ) : (
                      <ChevronDown size={18} color={colors.muted} />
                    )}
                  </Pressable>
                </View>
              );
            }}
          />
        </>
      )}
    </ModalShell>
  );
}
