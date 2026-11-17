import { AlertCircle } from "lucide-react-native";
import { Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import AppButton from "@/src/components/ui/AppButton";
import { TW } from "@/theme/twStyles";
import tw from "@/theme/tw";
import { getAppErrorMessage, type AppError } from "@/src/types/appError";

type Props = {
  message?: string;
  error?: AppError | null;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export default function ErrorState({
  message = "Something went wrong.",
  error,
  onRetry,
  retryLabel = "Try again",
  style,
}: Props) {
  return (
    <View style={[tw`items-center justify-center py-12 px-6`, style]}>
      <AlertCircle size={28} color={TW.DANGER} />
      <Text style={tw`text-description ${TW.textSecondary} text-center mt-2`}>
        {error ? getAppErrorMessage(error) : message}
      </Text>
      {onRetry ? (
        <AppButton
          title={retryLabel}
          onPress={onRetry}
          size="sm"
          style={tw`mt-4`}
        />
      ) : null}
    </View>
  );
}
