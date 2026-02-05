import { LogOut, UserCircle } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import tw from "twrnc";

type Props = {
  open: boolean;
  onProfile: () => void;
  onLogout: () => void;
};

export default function ProfileMenu({ open, onProfile, onLogout }: Props) {
  if (!open) return null;

  return (
    <View
      style={tw`absolute right-4 top-12 bg-white w-44 rounded-xl shadow-lg border border-gray-200 overflow-hidden`}
    >
      <Pressable
        onPress={onProfile}
        android_ripple={{ color: "#E5E7EB" }}
        style={({ pressed }) =>
          tw`flex-row items-center px-4 py-3 ${pressed ? "bg-gray-100" : ""
            }`
        }
      >
        <UserCircle size={18} color="#374151" />
        <Text style={tw`ml-3 text-gray-800 font-medium`}>
          Profile
        </Text>
      </Pressable>
      <View style={tw`h-px bg-gray-200 mx-3`} />
      <Pressable
        onPress={onLogout}
        android_ripple={{ color: "#FEE2E2" }}
        style={({ pressed }) =>
          tw`flex-row items-center px-4 py-3 ${pressed ? "bg-red-50" : ""
            }`
        }
      >
        <LogOut size={18} color="#EF4444" />
        <Text style={tw`ml-3 text-red-500 font-medium`}>
          Logout
        </Text>
      </Pressable>
    </View>
  );
}
