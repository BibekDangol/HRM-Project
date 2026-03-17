import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { Dispatch, SetStateAction } from "react";

import { TW } from "@/theme/twStyles";
import tw from "twrnc";

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
    <Modal
      transparent
      visible={commentModalOpen}
      animationType="slide"
      onRequestClose={onModalClose}>
      {/* Backdrop */}
      <Pressable
        style={tw`flex-1 bg-black/50 justify-end`}
        onPress={onModalClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={tw`w-full`}>
          {/* Modal Content */}
          <Pressable
            onPress={(e) => e.stopPropagation()} // prevent closing when clicking inside
            style={[
              tw`rounded-t-3xl px-5 pt-4 pb-10`,
              { backgroundColor: TW.bgPrimary },
            ]}>
            {/* Drag indicator */}
            <View style={tw`items-center mb-5`}>
              <View
                style={[
                  tw`h-1 w-10 rounded-full`,
                  { backgroundColor: TW.textSecondary },
                ]}
              />
            </View>

            {/* Title */}
            <Text
              style={[tw`text-xl font-bold mb-1`, { color: TW.bgSecondary }]}>
              {commentMode === "checkin" ? "Late Check-in" : "Early Check-out"}
            </Text>

            {/* Subtitle */}
            <Text style={[tw`text-sm mb-5`, { color: TW.textSecondary }]}>
              Please provide a reason to continue.
            </Text>

            {/* Input */}
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Write your reason here..."
              placeholderTextColor="#9CA3AF"
              multiline
              editable={!isLocked}
              style={[
                tw`rounded-2xl p-4 text-sm`,
                {
                  backgroundColor: "#F3F4F6",
                  color: TW.bgSecondary,
                  minHeight: 100,
                  textAlignVertical: "top",
                  borderWidth: 1,
                  borderColor: TW.BORDER,
                  opacity: isLocked ? 0.5 : 1,
                },
              ]}
            />
            {/* Buttons */}
            <View style={tw`flex-row gap-3 mt-4`}>
              {/* Cancel */}
              <Pressable
                disabled={isLocked}
                onPress={onReasonModalCancel}
                style={({ pressed }) => [
                  tw`flex-1 py-4 rounded-2xl items-center border`,
                  {
                    backgroundColor: "transparent",
                    opacity: isLocked ? 0.4 : pressed ? 0.7 : 1,
                  },
                ]}>
                <Text
                  style={[tw`font-bold text-sm`, { color: TW.bgSecondary }]}>
                  Cancel
                </Text>
              </Pressable>

              {/* Submit */}
              <Pressable
                disabled={isSubmitDisabled}
                onPress={onSubmitComment}
                style={({ pressed }) => [
                  tw`flex-1 py-4 rounded-2xl items-center`,
                  {
                    backgroundColor: isSubmitDisabled
                      ? `${TW.bgSecondary}`
                      : TW.bgSecondary,
                    opacity: pressed ? 0.85 : isSubmitDisabled ? 0.8 : 1,
                  },
                ]}>
                <Text style={[tw`font-bold text-sm`, { color: "#fff" }]}>
                  {isLocked ? "..." : "Submit"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default ReasonModel;
