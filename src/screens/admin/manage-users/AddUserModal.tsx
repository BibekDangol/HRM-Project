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
  //to let TS know onSubmit is async we use promise
  isSubmitting: boolean;
}
const addUserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  supervisor_id: z.string(),
});

export type AddUserFormData = z.infer<typeof addUserSchema>;
const AddUserModal = ({ visible, onClose, onSubmit, isSubmitting, supervisors, currentUserId }: Props) => {
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
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-end",
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={tw`bg-white rounded-t-3xl px-6 py-8`}>
              {/* Title */}
              <Text
                style={tw`text-[28px] font-bold text-center text-[#1F7A4D] mb-6`}
              >
                Add New User
              </Text>

              {/* FIRST NAME */}
              <Controller
                control={control}
                name="first_name"
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <View style={tw`mb-3`}>
                    <Text
                      style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}
                    >
                      First Name
                    </Text>

                    <TextInput
                      style={tw`h-[52px] bg-[#F5F5F5] rounded-xl px-4 text-[16px]`}
                      placeholder="John"
                      placeholderTextColor="#dcdada"
                      value={value}
                      onChangeText={onChange}
                    />
                    {error && (
                      <Text style={tw`text-[#FF6B6B] text-[13px] mt-2 ml-1`}>
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
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <View style={tw`mb-3`}>
                    <Text
                      style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}
                    >
                      Last Name
                    </Text>

                    <TextInput
                      style={tw`h-[52px] bg-[#F5F5F5] rounded-xl px-4 text-[16px]`}
                      placeholder="Doe"
                      placeholderTextColor="#dcdada"
                      value={value}
                      onChangeText={onChange}
                    />

                    {error && (
                      <Text style={tw`text-[#FF6B6B] text-[13px] mt-2 ml-1`}>
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
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <View style={tw`mb-4`}>
                    <Text
                      style={tw`text-[14px] font-semibold text-[#6E6F71] mb-1.5`}
                    >
                      E-mail
                    </Text>

                    <TextInput
                      style={tw`h-[52px] bg-[#F5F5F5] rounded-xl px-4 text-[16px]`}
                      placeholder="example@gmail.com"
                      placeholderTextColor="#dcdada"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={value}
                      onChangeText={onChange}
                    />

                    {error && (
                      <Text style={tw`text-[#FF6B6B] text-[13px] mt-2 ml-1`}>
                        {error.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* Supervisor Selector */}
              <Controller
                control={control}
                name="supervisor_id"
                render={({ field: { value, onChange } }) => (
                  <View style={tw`mb-4`}>
                    <Text style={tw`text-sm font-semibold text-[#6E6F71] mb-1`}>
                      Supervisor
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {supervisors.map((sup) => (
                        <TouchableOpacity
                          key={sup.id}
                          onPress={() => onChange(sup.id)}
                          style={[
                            tw`px-3 py-2 rounded-full mr-2 border`,
                            value === sup.id
                              ? tw`border-green-600 bg-green-100`
                              : tw`border-gray-300`,
                          ]}
                        >
                          <Text style={tw`text-sm text-gray-700`}>
                            {sup.first_name} {sup.last_name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              />

              {/* ACTION BUTTONS */}
              <View style={tw`flex-row justify-between mt-6`}>
                {/* Cancel */}
                <TouchableOpacity
                  onPress={onClose}
                  style={tw`h-[52px] px-6 rounded-xl justify-center`}
                >
                  <Text style={tw`text-[#6E6F71] font-semibold text-[16px]`}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                {/* Submit */}
                <TouchableOpacity
                  onPress={handleSubmit(submit)}
                  disabled={isSubmitting}
                  style={[
                    tw`h-[52px] px-8 rounded-xl items-center justify-center bg-[#1F7A4D]`,
                    isSubmitting ? tw`opacity-70` : tw`opacity-100`,
                  ]}
                >
                  <Text style={tw`text-white text-[16px] font-semibold`}>
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
