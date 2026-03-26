import { UserProfile } from "@/src/types/admin";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Keyboard,
} from "react-native";
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

export default function AddUserModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  supervisors,
  currentUserId,
}: Props) {
  const { control, handleSubmit, reset } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      supervisor_id: currentUserId,
    },
  });

  const submit = async (data: AddUserFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={tw`flex-1 bg-black/40 justify-center items-center px-5`}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ width: "100%" }}
            >
              <View
                style={[
                  tw`bg-white rounded-3xl px-5 pt-5 pb-4 self-center`,
                  {
                    width: "100%",
                    maxWidth: 380,
                  },
                ]}
              >
                <Text
                  style={tw`text-xl font-bold text-center mb-5 ${TW.textPrimary}`}
                >
                  Add New User
                </Text>

                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 4 }}
                >
                  <Controller
                    control={control}
                    name="first_name"
                    render={({
                      field: { value, onChange, onBlur },
                      fieldState: { error },
                    }) => (
                      <View style={tw`mb-3`}>
                        <Text
                          style={tw`text-sm font-semibold mb-1 ${TW.textSecondary}`}
                        >
                          First Name
                        </Text>

                        <TextInput
                          style={tw`h-12 bg-gray-100 rounded-xl px-4 text-base ${TW.textPrimary}`}
                          placeholder="John"
                          placeholderTextColor="#9CA3AF"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />

                        {error && (
                          <Text style={tw`text-xs mt-1 text-red-500`}>
                            {error.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  <Controller
                    control={control}
                    name="last_name"
                    render={({
                      field: { value, onChange, onBlur },
                      fieldState: { error },
                    }) => (
                      <View style={tw`mb-3`}>
                        <Text
                          style={tw`text-sm font-semibold mb-1 ${TW.textSecondary}`}
                        >
                          Last Name
                        </Text>

                        <TextInput
                          style={tw`h-12 bg-gray-100 rounded-xl px-4 text-base ${TW.textPrimary}`}
                          placeholder="Doe"
                          placeholderTextColor="#9CA3AF"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />

                        {error && (
                          <Text style={tw`text-xs mt-1 text-red-500`}>
                            {error.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  <Controller
                    control={control}
                    name="email"
                    render={({
                      field: { value, onChange, onBlur },
                      fieldState: { error },
                    }) => (
                      <View style={tw`mb-3`}>
                        <Text
                          style={tw`text-sm font-semibold mb-1 ${TW.textSecondary}`}
                        >
                          Email
                        </Text>

                        <TextInput
                          style={tw`h-12 bg-gray-100 rounded-xl px-4 text-base ${TW.textPrimary}`}
                          placeholder="example@gmail.com"
                          placeholderTextColor="#9CA3AF"
                          autoCapitalize="none"
                          keyboardType="email-address"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />

                        {error && (
                          <Text style={tw`text-xs mt-1 text-red-500`}>
                            {error.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  <Controller
                    control={control}
                    name="supervisor_id"
                    render={({ field: { value, onChange } }) => (
                      <View style={tw`mb-2`}>
                        <Text
                          style={tw`text-sm font-semibold mb-2 ${TW.textSecondary}`}
                        >
                          Supervisor
                        </Text>

                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ paddingRight: 4 }}
                        >
                          {supervisors.map((sup) => {
                            const selected = value === sup.id;

                            return (
                              <Pressable
                                key={sup.id}
                                onPress={() => onChange(sup.id)}
                                style={[
                                  tw`px-4 py-2 rounded-full mr-2 border`,
                                  selected
                                    ? tw`border-[#1B4A5A] bg-[#E6F1F3]`
                                    : tw`border-gray-300 bg-white`,
                                ]}
                              >
                                <Text
                                  style={tw`text-sm ${
                                    selected ? TW.textPrimary : TW.textSecondary
                                  }`}
                                >
                                  {sup.first_name} {sup.last_name}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}
                  />
                </ScrollView>

                <View style={tw`flex-row gap-3 mt-5`}>
                  <Pressable
                    onPress={onClose}
                    style={tw`flex-1 h-12 rounded-xl justify-center items-center bg-gray-100`}
                  >
                    <Text style={tw`${TW.textSecondary} font-semibold`}>
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSubmit(submit)}
                    disabled={isSubmitting}
                    style={[
                      tw`flex-1 h-12 rounded-xl items-center justify-center flex-row`,
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
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
