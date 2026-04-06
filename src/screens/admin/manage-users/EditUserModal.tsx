import { ChevronDown, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { UserProfile } from "@/src/types/admin";
import { TW } from "@/theme/twStyles";
import tw from "twrnc";

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
  isSubmitting: boolean;
}

const roles = ["user", "admin"];

const EditUserModal = ({
  visible,
  users,
  user,
  role,
  supervisor,
  setRole,
  setSupervisor,
  onClose,
  onSave,
  isChanged,
  isSubmitting,
}: Props) => {
  const [showSupervisorPicker, setShowSupervisorPicker] = useState(false);

  if (!visible || !user) return null;

  const supervisorName = () => {
    if (!supervisor || supervisor === user.id) return "Self";
    const found = users.find((u) => u.id === supervisor);
    return found
      ? `${found.first_name ?? ""} ${found.last_name ?? ""}`.trim()
      : "Unknown";
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={tw`flex-1 bg-black/40 justify-end`}>
        {/* 🔵 LOADING OVERLAY */}
        {isSubmitting && (
          <View
            style={tw`absolute inset-0 bg-black/30 items-center justify-center z-50`}>
            <View style={tw`bg-white p-6 rounded-2xl items-center`}>
              <ActivityIndicator size="large" color="#1B4A5A" />
              <Text style={tw`mt-3 font-semibold ${TW.textPrimary}`}>
                Saving changes...
              </Text>
            </View>
          </View>
        )}

        {/* Modal Sheet */}
        <View style={tw`${TW.bgWhite} rounded-t-3xl px-6 pt-4 pb-10`}>
          {/* Drag Handle */}
          <View style={tw`items-center mb-4`}>
            <View style={tw`h-1 w-12 rounded-full bg-gray-300`} />
          </View>

          {/* Header */}
          <View style={tw`flex-row items-center justify-between mb-6`}>
            <Text style={tw`text-xl font-bold ${TW.textPrimary}`}>
              Edit User
            </Text>

            <Pressable
              disabled={isSubmitting}
              onPress={onClose}
              style={({ pressed }) => [
                tw`h-9 w-9 rounded-full bg-gray-100 items-center justify-center`,
                (pressed || isSubmitting) && tw`opacity-60`,
              ]}>
              <X size={18} color="#475569" />
            </Pressable>
          </View>

          {/* Role Section */}
          <View style={tw`mb-5`}>
            <Text style={tw`text-sm font-semibold ${TW.textSecondary} mb-2`}>
              Role
            </Text>

            <View style={tw`flex-row gap-2`}>
              {roles.map((roleProfile) => {
                const selected = roleProfile === role;

                return (
                  <Pressable
                    key={roleProfile}
                    disabled={isSubmitting}
                    onPress={() => setRole(roleProfile)}
                    style={[
                      tw`flex-1 py-3 rounded-xl border items-center`,
                      selected
                        ? tw`${TW.bgAction} border-[#1B4A5A]`
                        : tw`bg-white border-gray-200`,
                      isSubmitting && tw`opacity-60`,
                    ]}>
                    <Text
                      style={[
                        tw`text-xs font-bold capitalize`,
                        selected
                          ? tw`${TW.textButton}`
                          : tw`${TW.textSecondary}`,
                      ]}>
                      {roleProfile.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Supervisor Section */}
          <View style={tw`mb-5`}>
            <Text style={tw`text-sm font-semibold ${TW.textSecondary} mb-2`}>
              Supervisor
            </Text>

            <Pressable
              disabled={isSubmitting}
              onPress={() => setShowSupervisorPicker(!showSupervisorPicker)}
              style={({ pressed }) => [
                tw`flex-row items-center justify-between px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 mb-2`,
                (pressed || isSubmitting) && tw`opacity-60`,
              ]}>
              <Text style={tw`text-sm font-medium ${TW.textPrimary}`}>
                {supervisorName()}
              </Text>
              <ChevronDown size={18} color="#94a3b8" />
            </Pressable>

            {showSupervisorPicker && (
              <View
                style={tw`border border-gray-200 rounded-2xl overflow-hidden`}>
                <ScrollView style={{ maxHeight: 180 }}>
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => {
                      setSupervisor(user.id);
                      setShowSupervisorPicker(false);
                    }}
                    style={tw`flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100`}>
                    <Text>Self</Text>
                  </Pressable>

                  {users
                    .filter((u) => u.id !== user.id)
                    .map((u) => (
                      <Pressable
                        key={u.id}
                        disabled={isSubmitting}
                        onPress={() => {
                          setSupervisor(u.id);
                          setShowSupervisorPicker(false);
                        }}
                        style={tw`flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100`}>
                        <Text>
                          {`${u.first_name ?? ""} ${u.last_name ?? ""}`}
                        </Text>
                      </Pressable>
                    ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={tw`flex-row gap-3 mt-2`}>
            <Pressable
              disabled={isSubmitting}
              onPress={onClose}
              style={({ pressed }) => [
                tw`flex-1 py-4 rounded-2xl border border-gray-200 items-center`,
                (pressed || isSubmitting) && tw`opacity-60`,
              ]}>
              <Text style={tw`${TW.textSecondary} font-semibold`}>Cancel</Text>
            </Pressable>

            <Pressable
              disabled={!isChanged || isSubmitting}
              onPress={onSave}
              style={({ pressed }) => [
                tw`flex-1 py-4 rounded-2xl items-center`,
                isChanged ? tw`${TW.bgAction}` : tw`bg-gray-200`,
                (pressed || isSubmitting) && isChanged && tw`opacity-85`,
              ]}>
              <Text
                style={[
                  tw`font-bold`,
                  isChanged ? tw`${TW.textButton}` : tw`text-gray-400`,
                ]}>
                Save Changes
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditUserModal;
