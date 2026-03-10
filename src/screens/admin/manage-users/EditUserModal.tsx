import { UserProfile } from "@/src/types/admin";
import { Check, ChevronDown, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
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
      <View style={tw`flex-1 bg-black/50 justify-end`}>
        <View style={tw`bg-white rounded-t-3xl px-6 pt-4 pb-10`}>
          {/* Handle */}
          <View style={tw`items-center mb-4`}>
            <View style={tw`h-1 w-10 rounded-full bg-slate-200`} />
          </View>

          {/* Header */}
          <View style={tw`flex-row items-center justify-between mb-6`}>
            <View>
              <Text style={tw`text-xl font-bold text-slate-900`}>
                Edit User
              </Text>
              <Text style={tw`text-sm text-slate-400 mt-0.5`}>
                {user.first_name} {user.last_name}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                tw`h-9 w-9 rounded-full bg-slate-100 items-center justify-center`,
                pressed && tw`opacity-70`,
              ]}
            >
              <X size={18} color="#475569" />
            </Pressable>
          </View>

          {/* Role */}
          <View style={tw`flex-row gap-2 mb-5`}>
            {roles.map((roleProfile) => (
              <Pressable
                key={roleProfile}
                onPress={() => setRole(roleProfile)}
                style={[
                  tw`flex-1 py-3 rounded-xl border items-center`,
                  roleProfile === role
                    ? tw`bg-green-700 border-green-700`
                    : tw`bg-white border-slate-200`,
                ]}
              >
                <Text
                  style={[
                    tw`text-xs font-bold capitalize`,
                    roleProfile === role ? tw`text-white` : tw`text-slate-500`,
                  ]}
                >
                  {roleProfile.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Supervisor */}
          <Text style={tw`text-sm font-semibold text-slate-700 mb-2`}>
            Supervisor
          </Text>

          <Pressable
            onPress={() => setShowSupervisorPicker(!showSupervisorPicker)}
            style={({ pressed }) => [
              tw`flex-row items-center justify-between px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 mb-2`,
              pressed && tw`opacity-80`,
            ]}
          >
            <Text style={tw`text-sm font-medium text-slate-900`}>
              {supervisorName()}
            </Text>
            <ChevronDown
              size={18}
              color="#94a3b8"
              style={{
                transform: [
                  { rotate: showSupervisorPicker ? "180deg" : "0deg" },
                ],
              }}
            />
          </Pressable>

          {showSupervisorPicker && (
            <View
              style={tw`border border-slate-200 rounded-2xl overflow-hidden mb-5`}
            >
              <ScrollView
                style={{ maxHeight: 180 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Self option */}
                <Pressable
                  onPress={() => {
                    setSupervisor(user.id);
                    setShowSupervisorPicker(false);
                  }}
                  style={({ pressed }) => [
                    tw`flex-row items-center justify-between px-4 py-3.5 border-b border-slate-100`,
                    pressed && tw`bg-slate-50`,
                  ]}
                >
                  <Text style={tw`text-sm text-slate-900 font-medium`}>
                    Self
                  </Text>
                  {supervisor === user.id && (
                    <Check size={16} color="#2563eb" />
                  )}
                </Pressable>

                {users
                  .filter((userProfile) => userProfile.id !== user.id)
                  .map((userProfile) => (
                    <Pressable
                      key={userProfile.id}
                      onPress={() => {
                        setSupervisor(userProfile.id);
                        setShowSupervisorPicker(false);
                      }}
                      style={({ pressed }) => [
                        tw`flex-row items-center justify-between px-4 py-3.5 border-b border-slate-100`,
                        pressed && tw`bg-slate-50`,
                      ]}
                    >
                      <View>
                        <Text style={tw`text-sm text-slate-900 font-medium`}>
                          {`${userProfile.first_name ?? ""} ${userProfile.last_name ?? ""}`.trim()}
                        </Text>
                        <Text style={tw`text-xs text-slate-400`}>
                          {userProfile.email}
                        </Text>
                      </View>
                      {supervisor === userProfile.id && (
                        <Check size={16} color="#2563eb" />
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
                tw`flex-1 py-4 rounded-2xl border border-slate-200 items-center`,
                pressed && tw`opacity-80`,
              ]}
            >
              <Text style={tw`text-slate-700 font-semibold`}>Cancel</Text>
            </Pressable>

            <Pressable
              disabled={!isChanged}
              onPress={onSave}
              style={({ pressed }) => [
                tw`flex-1 py-4 rounded-2xl items-center`,
                isChanged ? tw`bg-green-700` : tw`bg-slate-200`,
                pressed && isChanged && tw`opacity-85`,
              ]}
            >
              <Text
                style={[
                  tw`font-bold`,
                  isChanged ? tw`text-white` : tw`text-slate-400`,
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
