import { colors } from "@/theme/colors";
import * as Clipboard from "expo-clipboard";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { useEffect, useMemo, useState } from "react";

import AppButton from "@/src/components/ui/AppButton";
import { TW } from "@/theme/twStyles";
import { Check, Copy, Eye, EyeClosed } from "lucide-react-native";
import tw from "@/theme/tw";

interface Props {
  tempPassword: string;
  onDone: () => void;
}

export default function TempPasswordContent({
  tempPassword,
  onDone,
}: Props) {
  const { width } = useWindowDimensions();

  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isSmallPhone = width < 360;

  const sizes = useMemo(
    () => ({
      labelSize: isSmallPhone ? 11 : 12,
      passwordSize: isSmallPhone ? 18 : 22,
      actionSize: isSmallPhone ? 40 : 44,
      doneHeight: isSmallPhone ? 48 : 52,
      doneText: isSmallPhone ? 15 : 16,
      copyMsgSize: isSmallPhone ? 12 : 13,
    }),
    [isSmallPhone],
  );

  const handleCopy = async () => {
    await Clipboard.setStringAsync(tempPassword);
    setCopied(true);
  };

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <>
      {/* Password Box */}
      <View
        style={[
          tw`rounded-2xl mb-3 mt-2`,
          {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: copied ? colors.successBorder : colors.border,
            paddingHorizontal: isSmallPhone ? 14 : 16,
            paddingVertical: isSmallPhone ? 14 : 16,
          },
        ]}
      >
        <Text
          style={[
            tw`${TW.textSecondary} mb-2`,
            { fontSize: sizes.labelSize },
          ]}
        >
          Temporary Password
        </Text>

        <View style={tw`flex-row items-center`}>
          <Text
            selectable={revealed}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              tw`flex-1 font-bold ${TW.textPrimary}`,
              {
                fontSize: sizes.passwordSize,
                letterSpacing: isSmallPhone ? 1.5 : 2,
              },
            ]}
          >
            {revealed ? tempPassword : "••••••••••"}
          </Text>

          <View style={tw`flex-row ml-3`}>
            <Pressable
              onPress={() => setRevealed((prev) => !prev)}
              style={({ pressed }) => [
                tw`items-center justify-center rounded-xl mr-2`,
                {
                  width: sizes.actionSize,
                  height: sizes.actionSize,
                  backgroundColor: colors.primaryBorder,
                },
                pressed && tw`opacity-80`,
              ]}
            >
              {revealed ? (
                <Eye size={18} color={TW.bgSecondary} />
              ) : (
                <EyeClosed size={18} color={TW.bgSecondary} />
              )}
            </Pressable>

            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [
                tw`items-center justify-center rounded-xl`,
                {
                  width: sizes.actionSize,
                  height: sizes.actionSize,
                  backgroundColor: copied ? colors.success : TW.bgSecondary,
                },
                pressed && tw`opacity-80`,
              ]}
            >
              {copied ? (
                <Check size={20} color={colors.surface} />
              ) : (
                <Copy size={18} color={colors.surface} />
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {/* Copy Success */}
      {copied && (
        <Text
          style={[
            tw`text-center text-green-600 mb-4`,
            { fontSize: sizes.copyMsgSize, fontWeight: "600" },
          ]}
        >
          Password copied to clipboard
        </Text>
      )}

      <AppButton
        title="Done"
        onPress={onDone}
        style={{ backgroundColor: TW.bgSecondary, height: sizes.doneHeight }}
        textStyle={{ fontSize: sizes.doneText }}
      />
    </>
  );
}
