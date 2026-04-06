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
      style={[
        tw` right-0 top-12 bg-white border border-[#E5E5E5] p-2 rounded-xl`,
        { width: 150 },
      ]}>
      <Pressable
        onPress={onProfile}
        android_ripple={{ color: "#E5E7EB" }}
        style={({ pressed }) => tw`flex-row items-center px-3 py-2`}>
        <UserCircle size={18} color="#0C0C0C" />
        <Text style={tw`ml-2 font-bold text-[#0C0C0C]`}>Profile</Text>
      </Pressable>

      <View style={tw`h-px bg-[#E5E5E5] my-1`} />
      <Pressable
        onPress={onLogout}
        android_ripple={{ color: "#FEE2E2" }}
        style={({ pressed }) => tw`flex-row items-center px-3 py-2`}>
        <LogOut size={20} color="#FF4D4F" />
        <Text style={tw`ml-2 font-bold text-[#FF4D4F]`}>Logout</Text>
      </Pressable>
    </View>
  );
}
