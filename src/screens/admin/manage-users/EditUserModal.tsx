import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { UserProfile } from '.';
import tw from 'twrnc';

interface Props {
  visible: boolean;
  users: UserProfile[];
  user: UserProfile | null;
  role: string;
  supervisor: string | null;
  setRole: (val: string) => void;
  setSupervisor: (val: string | null) => void;
  onClose: () => void;
  onSave: () => void;
  isChanged: boolean;
}
const EditUserModal = ({ visible, users, user, role, supervisor, setRole, setSupervisor, onClose, onSave, isChanged }: Props) => {
  if (!visible || !user) return null;
  return (
    <Modal visible={visible} transparent animationType='slide'>
      <View style={tw`flex-1 justify-center items-center bg-black/40`}>
        <View style={tw`bg-white p-6 rounded-xl w-4/5`}>
          <Text style={tw`text-xl font-bold mb-4 text-gray-900`}>Edit User</Text>
          {/* Role Dropdown */}
          <Text style={tw`text-gray-700 mb-2`}>Role</Text>
          <View style={tw`border rounded-lg mb-4`}>
            <Picker
              selectedValue={role}
              onValueChange={(value) => setRole(value)}
            >
              <Picker.Item label="User" value="user" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>
          {/* Status Dropdown */}
          <Text style={tw`text-gray-700 mb-2`}>supervisor</Text>
          <View style={tw`border rounded-lg mb-4`}>
            <Picker
              selectedValue={supervisor}
              onValueChange={(value) => setSupervisor(value)}
            >
              <Picker.Item label="self" value={user.id} />
              {users.filter(u => u.id !== user.id).map((u) => (
                <Picker.Item key={u.id}
                  label={`${u.first_name ?? ""} ${u.last_name ?? ""} (${u.email})`}
                  value={u.id}
                />
              ))}
            </Picker>
          </View>
          {/* Cancel & Save Buttons */}
          <View style={tw`flex-row justify-between`}>
            <TouchableOpacity
              onPress={onClose}
              style={tw`py-2 px-4 rounded-lg bg-red-400`}
            >
              <Text style={tw`text-gray-700`}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!isChanged}
              onPress={onSave}
              style={tw`py-2 px-4 rounded-lg   ${isChanged ? "bg-green-500" : "bg-slate-300"}`}
            >
              <Text style={tw`text-white`}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default EditUserModal
