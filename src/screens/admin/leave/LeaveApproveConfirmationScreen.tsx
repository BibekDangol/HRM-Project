import { colors } from "@/theme/colors";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { CheckCircle } from "lucide-react-native";
import tw from "@/theme/tw";

export default function LeaveApproveConfirmationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  return (
    <View style={tw`flex-1 bg-canvas items-center justify-center px-6`}>
      <CheckCircle size={72} color={colors.success} />

      <Text style={tw`text-section font-semibold mt-4`}>
        Leave request approved
      </Text>

      <Text style={tw`text-description text-gray-500 text-center mt-2`}>
        You have approved the leave request.
      </Text>

      <Pressable style={tw`bg-blue-600 py-3 rounded-lg w-full mt-8`}>
        <Text style={tw`text-center text-white font-semibold`}
          onPress={() => router.push('/(admin)/(main-tabs)/leave')}>
          Back to leave page
        </Text>
      </Pressable>
      <Pressable style={tw`border border-blue-600 py-3 rounded-lg w-full mt-3`}>
        <Text style={tw`text-center text-blue-600 font-semibold`}
          onPress={() =>
            router.push({
              pathname: '/(admin)/(main-tabs)/leave/approved-details',
              params: { id: id } // pass leave id
            })
          }>
          View Approval Details
        </Text>
      </Pressable>
    </View>
  );
}
