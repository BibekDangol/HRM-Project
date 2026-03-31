import * as Clipboard from "expo-clipboard";

import { Alert, Pressable, Text, View } from "react-native";

import { TW } from "@/theme/twStyles";
import { Copy } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "twrnc";

interface Props {
  tempPassword: string;
  setTempPassword: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function TempPasswordModal({
  tempPassword,
  setTempPassword,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={tw`absolute inset-0 bg-black/50 items-center justify-end`}>
      <View
        style={[
          tw`bg-white w-full rounded-t-3xl px-6 pt-4`,
          { paddingBottom: insets.bottom + 16 },
        ]}>
        <View style={tw`items-center mb-5`}>
          <View style={tw`h-1 w-10 rounded-full bg-slate-200`} />
        </View>
        <Text style={tw`text-xl font-bold ${TW.textPrimary} mb-1`}>
          User Created
        </Text>
        <Text style={tw`text-sm ${TW.textSecondary} mb-5`}>
          Save this temporary password — it won`&apos;`t be shown again.
        </Text>
        <View
          style={tw`bg-slate-50 border ${TW.BORDER} rounded-2xl px-4 py-4 mb-5`}>
          <Text style={tw`text-xs ${TW.textSecondary} mb-1`}>
            Temporary Password
          </Text>
          <Text
            selectable
            style={tw`text-lg font-bold ${TW.textPrimary} tracking-widest`}>
            {tempPassword}
          </Text>
        </View>
        <Pressable
          onPress={async () => {
            await Clipboard.setStringAsync(tempPassword);
            Alert.alert("Copied", "Temporary password copied to clipboard");
          }}
          style={({ pressed }) => [
            tw`flex-row items-center justify-center ${TW.bgSecondary} py-4 rounded-2xl mb-3`,
            pressed && tw`opacity-85`,
          ]}>
          <Copy size={18} color="white" />
          <Text style={tw`text-white font-bold ml-2`}>Copy Password</Text>
        </Pressable>
        <Pressable
          onPress={() => setTempPassword(null)}
          style={({ pressed }) => [
            tw`py-4 rounded-2xl border ${TW.BORDER} items-center`,
            pressed && tw`opacity-80`,
          ]}>
          <Text style={tw`font-semibold ${TW.textPrimary}`}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}
