import * as Clipboard from "expo-clipboard";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { useEffect, useMemo, useState } from "react";

import { TW } from "@/theme/twStyles";
import { Check, Copy, Eye, EyeClosed, EyeOff } from "lucide-react-native";
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
  const { width } = useWindowDimensions();

  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isSmallPhone = width < 360;

  const sizes = useMemo(
    () => ({
      sheetRadius: isSmallPhone ? 26 : 30,
      sidePadding: isSmallPhone ? 18 : 24,
      topPadding: isSmallPhone ? 12 : 16,
      titleSize: isSmallPhone ? 16 : 18,
      subtitleSize: isSmallPhone ? 12 : 13,
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
    <View style={tw`absolute inset-0 bg-black/40 justify-end`}>
      <View
        style={[
          {
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: sizes.sheetRadius,
            borderTopRightRadius: sizes.sheetRadius,
            paddingHorizontal: sizes.sidePadding,
            paddingTop: sizes.topPadding,
            paddingBottom: insets.bottom ,
          },
        ]}
      >
        {/* Drag Handle */}
        <View style={tw`items-center mb-4`}>
          <View
            style={{
              width: 44,
              height: 5,
              borderRadius: 999,
              backgroundColor: "#E2E8F0",
            }}
          />
        </View>

        {/* Title */}
        <Text
          style={[
            tw`${TW.textPrimary} font-bold mb-1`,
            { fontSize: sizes.titleSize },
          ]}
        >
          User Created
        </Text>

        <Text
          style={[
            tw`${TW.textSecondary} mb-5`,
            {
              fontSize: sizes.subtitleSize,
              lineHeight: sizes.subtitleSize * 1.5,
            },
          ]}
        >
          Save this temporary password — it won&apos;t be shown again.
        </Text>

        {/* Password Box */}
        <View
          style={[
            tw`rounded-2xl mb-3`,
            {
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: copied ? "#86EFAC" : "#D9E3E8",
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
                    backgroundColor: "#DDECEF",
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
                    backgroundColor: copied ? "#16A34A" : TW.bgSecondary,
                  },
                  pressed && tw`opacity-80`,
                ]}
              >
                {copied ? (
                  <Check size={20} color="#FFFFFF" />
                ) : (
                  <Copy size={18} color="#FFFFFF" />
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

        {/* Done Button */}
        <Pressable
          onPress={() => setTempPassword(null)}
          style={({ pressed }) => [
            tw`items-center justify-center rounded-2xl`,
            {
              height: sizes.doneHeight,
              backgroundColor: TW.bgSecondary,
            },
            pressed && tw`opacity-85`,
          ]}
        >
          <Text
            style={[
              tw`text-white font-semibold`,
              { fontSize: sizes.doneText },
            ]}
          >
            Done
          </Text>
        </Pressable>
      </View>
    </View>
  );
}