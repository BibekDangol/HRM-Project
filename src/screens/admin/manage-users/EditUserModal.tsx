import { colors } from "@/theme/colors";
import { ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import FormActions from "@/src/components/form/FormActions";
import ModalShell from "@/src/components/ui/ModalShell";
import { UserProfile } from "@/src/types/admin";
import { TW } from "@/theme/twStyles";
import tw from "@/theme/tw";

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
    <ModalShell
      visible={visible}
      onClose={onClose}
      variant="bottom"
      title="Edit User"
      showHandle
      showCloseButton
      closeDisabled={isSubmitting}
      closeOnBackdropPress={false}
      loading={isSubmitting}
      loadingMessage="Saving changes..."
      footer={
        <FormActions
          onCancel={onClose}
          onSubmit={onSave}
          submitLabel="Save Changes"
          cancelDisabled={isSubmitting}
          submitDisabled={!isChanged || isSubmitting}
        />
      }
    >
      {/* Role Section */}
      <View style={tw`mb-5`}>
        <Text style={tw`text-description font-semibold ${TW.textSecondary} mb-2`}>
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
                    ? tw`${TW.bgAction} border-primary`
                    : tw`bg-white border-gray-200`,
                  isSubmitting && tw`opacity-60`,
                ]}
              >
                <Text
                  style={[
                    tw`text-caption font-bold capitalize`,
                    selected
                      ? tw`${TW.textButton}`
                      : tw`${TW.textSecondary}`,
                  ]}
                >
                  {roleProfile.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Supervisor Section */}
      <View style={tw`mb-5`}>
        <Text style={tw`text-description font-semibold ${TW.textSecondary} mb-2`}>
          Supervisor
        </Text>

        <Pressable
          disabled={isSubmitting}
          onPress={() => setShowSupervisorPicker(!showSupervisorPicker)}
          style={({ pressed }) => [
            tw`flex-row items-center justify-between px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 mb-2`,
            (pressed || isSubmitting) && tw`opacity-60`,
          ]}
        >
          <Text style={tw`text-description font-medium ${TW.textPrimary}`}>
            {supervisorName()}
          </Text>
          <ChevronDown size={18} color={colors.subtle} />
        </Pressable>

        {showSupervisorPicker && (
          <View style={tw`border border-gray-200 rounded-2xl overflow-hidden`}>
            <ScrollView style={{ maxHeight: 180 }}>
              <Pressable
                disabled={isSubmitting}
                onPress={() => {
                  setSupervisor(user.id);
                  setShowSupervisorPicker(false);
                }}
                style={tw`flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100`}
              >
                <Text style={tw`text-body text-ink`}>Self</Text>
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
                    style={tw`flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100`}
                  >
                    <Text style={tw`text-body text-ink`}>
                      {`${u.first_name ?? ""} ${u.last_name ?? ""}`}
                    </Text>
                  </Pressable>
                ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ModalShell>
  );
};

export default EditUserModal;
