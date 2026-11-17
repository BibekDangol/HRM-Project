import { colors } from "@/theme/colors";
import { ProfileData } from "@/src/types/profile.types";
import { FormInput, FormOutput } from "@/src/types/user";
import { TW } from "@/theme/twStyles";
import { Lock } from "lucide-react-native";
import React from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Keyboard } from "react-native";
import tw from "@/theme/tw";

import FormActions from "@/src/components/form/FormActions";
import FormField from "@/src/components/form/FormField";
import ModalShell from "@/src/components/ui/ModalShell";

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
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Edit Profile"
      subtitle="Update your details"
      closeOnBackdropPress={false}
      avoidKeyboard
      footer={
        <FormActions
          onCancel={() => {
            Keyboard.dismiss();
            onClose();
          }}
          onSubmit={() => {
            Keyboard.dismiss();
            onSubmit();
          }}
          submitLabel="Update"
          loading={isSaving}
          loadingTitle="Saving..."
        />
      }
    >
      <Controller
        control={control}
        name="firstName"
        render={({ field: { value, onChange, onBlur } }) => (
          <FormField
            label="First Name"
            labelVariant="uppercase"
            variant="outlined"
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Enter first name"
            placeholderTextColor={colors.placeholder}
            error={errors.firstName?.message}
            containerStyle={tw`mb-4`}
          />
        )}
      />

      <Controller
        control={control}
        name="lastName"
        render={({ field: { value, onChange, onBlur } }) => (
          <FormField
            label="Last Name"
            labelVariant="uppercase"
            variant="outlined"
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Enter last name"
            placeholderTextColor={colors.placeholder}
            error={errors.lastName?.message}
            containerStyle={tw`mb-4`}
          />
        )}
      />

      <FormField
        label="Email"
        labelVariant="uppercase"
        variant="outlined"
        value={profile?.email ?? "—"}
        onChangeText={() => {}}
        editable={false}
        leftAccessory={
          <Lock
            size={15}
            color={TW.bgSecondary}
            strokeWidth={1.9}
            style={tw`mr-2`}
          />
        }
      />
    </ModalShell>
  );
}
