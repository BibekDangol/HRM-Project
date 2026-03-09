import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

import tw from "twrnc";
import { useState } from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, limit: number) => void;
};

export default function AddLeaveTypeModal({ visible, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={tw`flex-1 bg-black/40 justify-center items-center`}>
        <View style={tw`bg-white w-4/5 p-5 rounded-xl`}>
          <Text style={tw`text-lg font-bold mb-3`}>Add Leave Type</Text>

          <TextInput
            placeholder="Leave Type (Annual, Sick)"
            value={name}
            onChangeText={setName}
            style={tw`border p-2 rounded mb-3`}
          />

          <TextInput
            placeholder="Limit (days)"
            keyboardType="numeric"
            value={limit}
            onChangeText={setLimit}
            style={tw`border p-2 rounded mb-4`}
          />

          <TouchableOpacity
            style={tw`bg-blue-600 py-3 rounded mb-2`}
            onPress={() => onSubmit(name, Number(limit))}
          >
            <Text style={tw`text-white text-center font-semibold`}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={tw`text-center text-gray-500`}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
