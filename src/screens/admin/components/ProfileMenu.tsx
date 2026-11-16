import { colors } from "@/theme/colors";
import { LogOut, UserCircle } from "lucide-react-native";
import {
  Modal,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import tw from "@/theme/tw";

type Props = {
  open: boolean;
  onProfile: () => void;
  onLogout: () => void;
  onClose?: () => void;
};

export default function ProfileMenu({
  open,
  onProfile,
  onLogout,
  onClose,
}: Props) {
  if (!open) return null;

  const handleClose = onClose ?? (() => {});

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent={false}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={tw`flex-1`}>
          <TouchableWithoutFeedback>
            <View
              style={[
                tw`absolute right-4 top-20 bg-white border border-border p-2 rounded-xl`,
                {
                  width: 150,
                  elevation: 10,
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                },
              ]}
            >
              <Pressable
                onPress={onProfile}
                android_ripple={{ color: colors.border }}
                style={({ pressed }) =>
                  tw`flex-row items-center px-3 py-2 ${pressed ? "opacity-75" : ""}`
                }
              >
                <UserCircle size={18} color={colors.ink} />
                <Text style={tw`ml-2 font-bold text-ink`}>Profile</Text>
              </Pressable>

              <View style={tw`h-px bg-border my-1`} />
              <Pressable
                onPress={onLogout}
                android_ripple={{ color: colors.dangerSoft }}
                style={({ pressed }) =>
                  tw`flex-row items-center px-3 py-2 ${pressed ? "opacity-75" : ""}`
                }
              >
                <LogOut size={20} color={colors.danger} />
                <Text style={tw`ml-2 font-bold text-danger`}>Logout</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
