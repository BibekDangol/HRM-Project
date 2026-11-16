import { colors } from "@/theme/colors";
import React, { Dispatch, SetStateAction } from "react";

import FormActions from "@/src/components/form/FormActions";
import FormField from "@/src/components/form/FormField";
import ModalShell from "@/src/components/ui/ModalShell";
import tw from "@/theme/tw";

type CommentMode = "checkin" | "checkout" | "";

interface Props {
  commentModalOpen: boolean;
  isLocked: boolean;
  setCommentText: Dispatch<SetStateAction<string>>;
  commentMode: CommentMode;
  commentText: string;
  onModalClose: () => void;
  onReasonModalCancel: () => void;
  onSubmitComment: () => void;
}

const ReasonModel: React.FC<Props> = ({
  commentModalOpen,
  isLocked,
  setCommentText,
  commentMode,
  commentText,
  onModalClose,
  onReasonModalCancel,
  onSubmitComment,
}) => {
  const isSubmitDisabled = isLocked || commentText.trim().length === 0;

  return (
    <ModalShell
      visible={commentModalOpen}
      onClose={onModalClose}
      variant="bottom"
      showHandle
      avoidKeyboard
      closeDisabled={isLocked}
      title={commentMode === "checkin" ? "Late Check-in" : "Early Check-out"}
      subtitle="Please provide a reason to continue."
      footer={
        <FormActions
          onCancel={onReasonModalCancel}
          onSubmit={onSubmitComment}
          cancelLabel="Cancel"
          submitLabel="Submit"
          loading={isLocked}
          loadingTitle="..."
          cancelDisabled={isLocked}
          submitDisabled={isSubmitDisabled}
        />
      }
    >
      <FormField
        value={commentText}
        onChangeText={setCommentText}
        placeholder="Write your reason here..."
        placeholderTextColor={colors.subtle}
        multiline
        editable={!isLocked}
        variant="filled"
        inputStyle={tw`min-h-[100px] text-sm`}
      />
    </ModalShell>
  );
};

export default ReasonModel;
