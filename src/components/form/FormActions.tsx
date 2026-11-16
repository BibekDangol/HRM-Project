import { View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import AppButton from "@/src/components/ui/AppButton";
import tw from "@/theme/tw";

type Props = {
  onCancel: () => void;
  onSubmit: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  loading?: boolean;
  loadingTitle?: string;
  cancelDisabled?: boolean;
  submitDisabled?: boolean;
  submitVariant?: "primary" | "danger";
  style?: StyleProp<ViewStyle>;
};

export default function FormActions({
  onCancel,
  onSubmit,
  cancelLabel = "Cancel",
  submitLabel = "Save",
  loading = false,
  loadingTitle,
  cancelDisabled = false,
  submitDisabled = false,
  submitVariant = "primary",
  style,
}: Props) {
  return (
    <View style={[tw`flex-row gap-3`, style]}>
      <AppButton
        title={cancelLabel}
        onPress={onCancel}
        variant="secondary"
        disabled={cancelDisabled}
        style={tw`flex-1`}
      />
      <AppButton
        title={submitLabel}
        onPress={onSubmit}
        loading={loading}
        loadingTitle={loadingTitle}
        disabled={submitDisabled}
        variant={submitVariant}
        style={tw`flex-1`}
      />
    </View>
  );
}
