import { colors } from "@/theme/colors";
import { useState } from "react";

import FormActions from "@/src/components/form/FormActions";
import FormField from "@/src/components/form/FormField";
import ModalShell from "@/src/components/ui/ModalShell";
import tw from "@/theme/tw";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, limit: number) => Promise<void>; // assume API call returns Promise
  initialName?: string;
  initialLimit?: number;
};

export default function AddLeaveTypeModal({
  visible,
  onClose,
  onSubmit,
  initialName = "",
  initialLimit = 0,
}: Props) {
  const [name, setName] = useState(visible ? initialName : "");
  const [limit, setLimit] = useState(
    visible ? initialLimit.toString() : "",
  );
  const [loading, setLoading] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible && !wasVisible) {
    setWasVisible(true);
    setName(initialName);
    setLimit(initialLimit.toString());
    setLoading(false);
  } else if (!visible && wasVisible) {
    setWasVisible(false);
  }

  const isValid = !!name.trim() && Number(limit) > 0;
  const isEditing = !!initialName || initialLimit > 0;

  const handleSubmit = async () => {
    if (!isValid || loading) return;

    try {
      setLoading(true);
      await onSubmit(name.trim(), Number(limit));
      setName("");
      setLimit("");
      onClose();
    } catch (err) {
      console.log("Error saving leave type:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setName("");
    setLimit("");
    onClose();
  };

  return (
    <ModalShell
      visible={visible}
      onClose={handleClose}
      title={isEditing ? "Edit Leave Type" : "Add Leave Type"}
      closeDisabled={loading}
      closeOnBackdropPress={false}
      contentStyle={tw`rounded-2xl p-5`}
      footer={
        <FormActions
          onCancel={handleClose}
          onSubmit={handleSubmit}
          submitLabel="Save"
          loading={loading}
          loadingTitle="Saving..."
          cancelDisabled={loading}
          submitDisabled={!isValid}
        />
      }
    >
      <FormField
        label="Leave Name"
        variant="outlined"
        placeholder="Annual, Sick..."
        placeholderTextColor={colors.placeholder}
        value={name}
        onChangeText={setName}
        containerStyle={tw`mb-4`}
      />

      <FormField
        label="Leave Limit (days)"
        variant="outlined"
        placeholder="10"
        placeholderTextColor={colors.placeholder}
        keyboardType="numeric"
        value={limit}
        onChangeText={setLimit}
      />
    </ModalShell>
  );
}
