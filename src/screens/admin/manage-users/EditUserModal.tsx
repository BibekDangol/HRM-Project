import { Check, ChevronDown, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

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
}

const roles = ["user", "admin", "supervisor"];

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

        {/* Modal Sheet */}
        <View style={tw`${TW.bgWhite} rounded-t-3xl px-6 pt-4 pb-10`}>

          {/* Drag Handle */}
          <View style={tw`items-center mb-4`}>
            <View style={tw`h-1 w-12 rounded-full bg-gray-300`} />
          </View>

          {/* Header */}
          <View style={tw`flex-row items-center justify-between mb-6`}>
            <View>
              <Text style={tw`text-xl font-bold ${TW.textPrimary}`}>
                Edit User
              </Text>
              <Text style={tw`text-sm ${TW.textSecondary}`}>
                {user.first_name} {user.last_name}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                tw`h-9 w-9 rounded-full bg-gray-100 items-center justify-center`,
                pressed && tw`opacity-70`,
              ]}
            >
              <X size={18} color="#475569" />
            </Pressable>
          </View>

          {/* Role Selector */}
          <View style={tw`flex-row gap-2 mb-5`}>
            {roles.map((roleProfile) => {
              const selected = roleProfile === role;

              return (
                <Pressable
                  key={roleProfile}
                  onPress={() => setRole(roleProfile)}
                  style={[
                    tw`flex-1 py-3 rounded-xl border items-center`,
                    selected
                      ? tw`${TW.bgAction} border-[#1B4A5A]`
                      : tw`bg-white border-gray-200`,
                  ]}
                >
                  <Text
                    style={[
                      tw`text-xs font-bold capitalize`,
                      selected ? tw`${TW.textButton}` : tw`${TW.textSecondary}`,
                    ]}
                  >
                    {roleProfile.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Supervisor */}
          <Text style={tw`text-sm font-semibold ${TW.textSecondary} mb-2`}>
            Supervisor
          </Text>

          <Pressable
            onPress={() => setShowSupervisorPicker(!showSupervisorPicker)}
            style={({ pressed }) => [
              tw`flex-row items-center justify-between px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 mb-2`,
              pressed && tw`opacity-80`,
            ]}
          >
            <Text style={tw`text-sm font-medium ${TW.textPrimary}`}>
              {supervisorName()}
            </Text>

            <ChevronDown
              size={18}
              color="#94a3b8"
              style={{
                transform: [{ rotate: showSupervisorPicker ? "180deg" : "0deg" }],
              }}
            />
          </Pressable>

          {showSupervisorPicker && (
            <View style={tw`border border-gray-200 rounded-2xl overflow-hidden mb-5`}>

              <ScrollView
                style={{ maxHeight: 180 }}
                showsVerticalScrollIndicator={false}
              >

                {/* Self */}
                <Pressable
                  onPress={() => {
                    setSupervisor(user.id);
                    setShowSupervisorPicker(false);
                  }}
                  style={({ pressed }) => [
                    tw`flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100`,
                    pressed && tw`bg-gray-50`,
                  ]}
                >
                  <Text style={tw`text-sm font-medium ${TW.textPrimary}`}>
                    Self
                  </Text>

                  {supervisor === user.id && (
                    <Check size={16} color="#1B4A5A" />
                  )}
                </Pressable>

                {users
                  .filter((u) => u.id !== user.id)
                  .map((u) => (
                    <Pressable
                      key={u.id}
                      onPress={() => {
                        setSupervisor(u.id);
                        setShowSupervisorPicker(false);
                      }}
                      style={({ pressed }) => [
                        tw`flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100`,
                        pressed && tw`bg-gray-50`,
                      ]}
                    >
                      <View>
                        <Text style={tw`text-sm font-medium ${TW.textPrimary}`}>
                          {`${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()}
                        </Text>
                        <Text style={tw`text-xs ${TW.textTertiary}`}>
                          {u.email}
                        </Text>
                      </View>

                      {supervisor === u.id && (
                        <Check size={16} color="#1B4A5A" />
                      )}
                    </Pressable>
                  ))}

              </ScrollView>
            </View>
          )}

          {/* Buttons */}
          <View style={tw`flex-row gap-3 mt-2`}>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                tw`flex-1 py-4 rounded-2xl border border-gray-200 items-center`,
                pressed && tw`opacity-80`,
              ]}
            >
              <Text style={tw`${TW.textSecondary} font-semibold`}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              disabled={!isChanged}
              onPress={onSave}
              style={({ pressed }) => [
                tw`flex-1 py-4 rounded-2xl items-center`,
                isChanged ? tw`${TW.bgAction}` : tw`bg-gray-200`,
                pressed && isChanged && tw`opacity-85`,
              ]}
            >
              <Text
                style={[
                  tw`font-bold`,
                  isChanged ? tw`${TW.textButton}` : tw`text-gray-400`,
                ]}
              >
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