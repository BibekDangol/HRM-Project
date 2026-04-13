import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { addUserSchema } from "@/src/schema/admin/addUserSchema";
import { UserProfile } from "@/src/types/admin";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import tw from "twrnc";
import { z } from "zod";
import { ChevronDown, ChevronUp } from "lucide-react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: AddUserFormData) => Promise<void>;
  supervisors: UserProfile[];
  currentUserId: string;
  isSubmitting: boolean;
}

export type AddUserFormData = z.infer<typeof addUserSchema>;

export default function AddUserModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  supervisors,
}: Props) {
  const { control, handleSubmit, reset } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      supervisor_id: null,
    },
  });

  const [showOptions, setShowOptions] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const triggerRef = useRef<View>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [dropdownLayout, setDropdownLayout] = useState({ top: 0, left: 0, width: 0 });

  const openDropdown = () => {
    Keyboard.dismiss();
    if (triggerRef.current) {
      triggerRef.current.measure((_x, _y, width, height, pageX, pageY) => {
        setDropdownLayout({ top: pageY + height, left: pageX, width });
        setShowOptions(true);
      });
    }
  };

  const submit = async (data: AddUserFormData) => {
    await onSubmit(data);
    reset();
    setShowOptions(false);
    onClose();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    reset();
    setShowOptions(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* Global dropdown — rendered at Modal root level, above everything */}
      {showOptions && (
        <>
          <Pressable
            onPress={() => setShowOptions(false)}
            style={tw`absolute inset-0 z-40`}
          />
          <View
            style={[
              tw`absolute bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden`,
              {
                top: dropdownLayout.top,
                left: dropdownLayout.left,
                width: dropdownLayout.width,
              },
            ]}
          >
            <ScrollView
              style={{ maxHeight: 220 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              <Controller
                control={control}
                name="supervisor_id"
                render={({ field: { onChange } }) => (
                  <>
                    <Pressable
                      onPress={() => {
                        onChange(null);
                        setShowOptions(false);
                      }}
                      style={tw`px-4 py-3 border-b border-gray-100`}
                    >
                      <Text style={tw`font-semibold`}>Self</Text>
                    </Pressable>
                    {supervisors.map((sup) => (
                      <Pressable
                        key={sup.id}
                        onPress={() => {
                          onChange(sup.id);
                          setShowOptions(false);
                        }}
                        style={tw`px-4 py-3 border-b border-gray-100`}
                      >
                        <Text>
                          {sup.first_name} {sup.last_name}
                        </Text>
                      </Pressable>
                    ))}
                  </>
                )}
              />
            </ScrollView>
          </View>
        </>
      )}

      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setShowOptions(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={tw`flex-1`}
        >
          <View
            style={[
              tw`flex-1 bg-black/40 px-5`,
              {
                justifyContent: keyboardVisible ? "flex-start" : "center",
                paddingTop:
                  Platform.OS === "android"
                    ? keyboardVisible
                      ? 48
                      : 24
                    : keyboardVisible
                      ? 70
                      : 24,
              },
            ]}
          >
            <TouchableWithoutFeedback>
              <View
                style={[
                  tw`bg-white rounded-3xl self-center px-5 pt-5 pb-4`,
                  { width: "100%", maxWidth: 380 },
                ]}
              >
                <Text
                  style={tw`text-[18px] font-bold text-center mb-4 ${TW.textPrimary}`}
                >
                  Add New User
                </Text>

                {/* First Name */}
                <Controller
                  control={control}
                  name="first_name"
                  render={({
                    field: { value, onChange, onBlur },
                    fieldState: { error },
                  }) => (
                    <View style={tw`mb-3`}>
                      <Text style={tw`text-sm font-semibold mb-1 ${TW.textSecondary}`}>
                        First Name
                      </Text>
                      <TextInput
                        style={tw`h-12 bg-gray-100 rounded-2xl px-4 text-base ${TW.textPrimary}`}
                        placeholder="John"
                        placeholderTextColor="#9CA3AF"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        returnKeyType="next"
                      />
                      {error && (
                        <Text style={tw`text-xs mt-1 text-red-500`}>{error.message}</Text>
                      )}
                    </View>
                  )}
                />

                {/* Last Name */}
                <Controller
                  control={control}
                  name="last_name"
                  render={({
                    field: { value, onChange, onBlur },
                    fieldState: { error },
                  }) => (
                    <View style={tw`mb-3`}>
                      <Text style={tw`text-sm font-semibold mb-1 ${TW.textSecondary}`}>
                        Last Name
                      </Text>
                      <TextInput
                        style={tw`h-12 bg-gray-100 rounded-2xl px-4 text-base ${TW.textPrimary}`}
                        placeholder="Doe"
                        placeholderTextColor="#9CA3AF"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        returnKeyType="next"
                      />
                      {error && (
                        <Text style={tw`text-xs mt-1 text-red-500`}>{error.message}</Text>
                      )}
                    </View>
                  )}
                />

                {/* Email */}
                <Controller
                  control={control}
                  name="email"
                  render={({
                    field: { value, onChange, onBlur },
                    fieldState: { error },
                  }) => (
                    <View style={tw`mb-3`}>
                      <Text style={tw`text-sm font-semibold mb-1 ${TW.textSecondary}`}>
                        Email
                      </Text>
                      <TextInput
                        style={tw`h-12 bg-gray-100 rounded-2xl px-4 text-base ${TW.textPrimary}`}
                        placeholder="example@gmail.com"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        returnKeyType="done"
                      />
                      {error && (
                        <Text style={tw`text-xs mt-1 text-red-500`}>{error.message}</Text>
                      )}
                    </View>
                  )}
                />

                {/* Supervisor */}
                <Controller
                  control={control}
                  name="supervisor_id"
                  render={({ field: { value } }) => {
                    const selected =
                      value === null
                        ? "Self"
                        : supervisors.find((s) => s.id === value);

                    return (
                      <View style={tw`mb-5`}>
                        <Text style={tw`mb-1 font-semibold`}>Supervisor</Text>
                        <Pressable
                          ref={triggerRef}
                          onPress={openDropdown}
                          style={tw`h-12 px-4 rounded-2xl bg-gray-100 flex-row items-center justify-between`}
                        >
                          <Text>
                            {typeof selected === "string"
                              ? selected
                              : selected
                                ? `${selected.first_name} ${selected.last_name}`
                                : "Select Supervisor"}
                          </Text>
                          {showOptions ? (
                            <ChevronUp size={18} color="#6B7280" />
                          ) : (
                            <ChevronDown size={18} color="#6B7280" />
                          )}
                        </Pressable>
                      </View>
                    );
                  }}
                />

                {/* Actions */}
                <View style={tw`flex-row gap-3`}>
                  <Pressable
                    onPress={handleSubmit(submit)}
                    disabled={isSubmitting}
                    style={[
                      tw`flex-1 h-12 rounded-2xl items-center justify-center flex-row`,
                      tw`${TW.bgAction}`,
                      isSubmitting && tw`opacity-70`,
                    ]}
                  >
                    {isSubmitting && (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Text style={tw`font-semibold ${TW.textButton}`}>
                      {isSubmitting ? "Adding..." : "Add User"}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleClose}
                    style={tw`flex-1 h-12 rounded-2xl justify-center items-center bg-gray-100`}
                  >
                    <Text style={tw`${TW.textSecondary} font-semibold`}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}