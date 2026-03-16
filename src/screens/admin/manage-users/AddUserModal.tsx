import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { UserProfile } from "@/src/types/admin";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import tw from "twrnc";
import { z } from "zod";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: AddUserFormData) => Promise<void>;
  supervisors: UserProfile[];
  currentUserId: string;
  isSubmitting: boolean;
}

const addUserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  supervisor_id: z.string(),
});

export type AddUserFormData = z.infer<typeof addUserSchema>;

const AddUserModal = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  supervisors,
  currentUserId,
}: Props) => {
  const { control, handleSubmit, reset } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      supervisor_id: currentUserId,
    },
  });

  if (!visible) return null;

  const submit = async (data: AddUserFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={tw`flex-1 bg-black/40`}>
        <KeyboardAvoidingView
          style={tw`flex-1`}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Modal Sheet */}
            <View style={tw`${TW.bgWhite} rounded-t-3xl px-6 py-8`}>
              {/* Title */}
              <Text
                style={tw`text-2xl font-bold text-center mb-6 ${TW.textPrimary}`}
              >
                Add New User
              </Text>

              {/* FIRST NAME */}
              <Controller
                control={control}
                name="first_name"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <View style={tw`mb-4`}>
                    <Text style={tw`text-sm font-semibold mb-1 ${TW.textSecondary}`}>
                      First Name
                    </Text>

                    <TextInput
                      style={tw`h-13 bg-gray-100 rounded-xl px-4 text-base ${TW.textPrimary}`}
                      placeholder="John"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                    />

                    {error && (
                      <Text style={tw`text-xs mt-1 ${TW.DANGER}`}>
                        {error.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* LAST NAME */}
              <Controller
                control={control}
                name="last_name"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <View style={tw`mb-4`}>
                    <Text style={tw`text-sm font-semibold mb-1 ${TW.textSecondary}`}>
                      Last Name
                    </Text>

                    <TextInput
                      style={tw`h-13 bg-gray-100 rounded-xl px-4 text-base ${TW.textPrimary}`}
                      placeholder="Doe"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                    />

                    {error && (
                      <Text style={tw`text-xs mt-1 ${TW.DANGER}`}>
                        {error.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* EMAIL */}
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <View style={tw`mb-4`}>
                    <Text style={tw`text-sm font-semibold mb-1 ${TW.textSecondary}`}>
                      Email
                    </Text>

                    <TextInput
                      style={tw`h-13 bg-gray-100 rounded-xl px-4 text-base ${TW.textPrimary}`}
                      placeholder="example@gmail.com"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={value}
                      onChangeText={onChange}
                    />

                    {error && (
                      <Text style={tw`text-xs mt-1 ${TW.DANGER}`}>
                        {error.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* Supervisor */}
              <Controller
                control={control}
                name="supervisor_id"
                render={({ field: { value, onChange } }) => (
                  <View style={tw`mb-6`}>
                    <Text style={tw`text-sm font-semibold mb-2 ${TW.textSecondary}`}>
                      Supervisor
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {supervisors.map((sup) => {
                        const selected = value === sup.id;

                        return (
                          <TouchableOpacity
                            key={sup.id}
                            onPress={() => onChange(sup.id)}
                            style={[
                              tw`px-4 py-2 rounded-full mr-2 border`,
                              selected
                                ? tw`border-[#1B4A5A] bg-[#E6F1F3]`
                                : tw`border-gray-300`,
                            ]}
                          >
                            <Text
                              style={tw`text-sm ${selected ? TW.textPrimary : TW.textSecondary
                                }`}
                            >
                              {sup.first_name} {sup.last_name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              />

              {/* ACTION BUTTONS */}
              <View style={tw`flex-row justify-between mt-6`}>

                {/* Cancel */}
                <TouchableOpacity
                  onPress={onClose}
                  style={tw`h-13 px-6 rounded-xl justify-center bg-gray-100`}
                >
                  <Text style={tw`${TW.textSecondary} font-semibold`}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                {/* Submit */}
                <TouchableOpacity
                  onPress={handleSubmit(submit)}
                  disabled={isSubmitting}
                  style={[
                    tw`h-13 px-8 rounded-xl items-center justify-center ${TW.bgAction}`,
                    isSubmitting && tw`opacity-70`,
                  ]}
                >
                  <Text style={tw`font-semibold ${TW.textButton}`}>
                    {isSubmitting ? "Adding..." : "Add User"}
                  </Text>
                </TouchableOpacity>

              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AddUserModal;