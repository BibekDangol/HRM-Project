import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { TW } from "@/theme/twStyles";
import tw from "twrnc";

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
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false); // NEW: loading state

  const isValid = name.trim() && Number(limit) > 0;

  const handleSubmit = async () => {
    if (!isValid || loading) return;

    try {
      setLoading(true);
      await onSubmit(name.trim(), Number(limit)); // wait for API
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
    if (loading) return; // prevent closing while saving
    setName("");
    setLimit("");
    onClose();
  };

  // Update form fields when modal opens for editing
  useEffect(() => {
    if (visible) {
      setName(initialName);
      setLimit(initialLimit.toString());
      setLoading(false);
    }
  }, [visible, initialName, initialLimit]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={tw`flex-1 bg-black/40 justify-center items-center px-6`}>
        {/* Modal Card */}
        <View style={tw`bg-white w-full rounded-2xl p-5`}>
          {/* Title */}
          <Text style={tw`text-lg font-bold mb-5 ${TW.textPrimary}`}>
            Add Leave Type
          </Text>

          {/* Leave Name */}
          <Text style={tw`text-sm mb-1 ${TW.textSecondary}`}>Leave Name</Text>
          <TextInput
            placeholder="Annual, Sick..."
            value={name}
            onChangeText={setName}
            placeholderTextColor="#94a3b8"
            style={tw`border ${TW.BORDER} rounded-xl px-4 py-3 mb-4`}
          />

          {/* Limit */}
          <Text style={tw`text-sm mb-1 ${TW.textSecondary}`}>
            Leave Limit (days)
          </Text>
          <TextInput
            placeholder="10"
            keyboardType="numeric"
            value={limit}
            onChangeText={setLimit}
            placeholderTextColor="#94a3b8"
            style={tw`border ${TW.BORDER} rounded-xl px-4 py-3 mb-6`}
          />

          {/* Buttons */}
          <View style={tw`flex-row`}>
            <TouchableOpacity
              onPress={handleClose}
              disabled={loading}
              style={tw`flex-1 py-3 rounded-xl border ${TW.BORDER} mr-2 items-center`}>
              <Text style={tw`${TW.textSecondary} font-medium`}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!isValid || loading}
              onPress={handleSubmit}
              style={[
                tw`flex-1 py-3 rounded-xl items-center flex-row justify-center`,
                isValid ? tw`${TW.bgAction}` : tw`bg-gray-200`,
              ]}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={[
                    tw`font-semibold`,
                    isValid ? tw`text-white` : tw`${TW.bgSecondary}`,
                  ]}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
