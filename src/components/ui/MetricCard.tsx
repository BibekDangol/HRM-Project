import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { TW } from "@/theme/twStyles";
import tw from "@/theme/tw";

type Props = {
  title: string;
  value: number | string;
  icon: ReactNode;
  accent?: string;
  sectionTitle?: string;
  statusLabel?: string;
  statusMeta?: string;
};

export default function MetricCard({
  title,
  value,
  icon,
  accent = TW.bgAction,
  sectionTitle = "Team overview",
  statusLabel = "Directory",
  statusMeta = "Refresh to update",
}: Props) {
  return (
    <>
      <Text style={tw`font-semibold ${TW.textPrimary} pb-2 text-section`}>
        {sectionTitle}
      </Text>
      <View
        style={tw`overflow-hidden rounded-xl ${TW.bgButton} ${TW.BORDER} border`}
      >
        <View style={tw`h-0.5 w-full ${accent}`} />
        <View style={tw`flex-row flex-wrap items-center gap-3 px-4 py-4`}>
          <View
            style={tw`w-10 h-10 rounded-lg ${accent} items-center justify-center shrink-0`}
          >
            {icon}
          </View>
          <View style={{ flexGrow: 1, flexBasis: 120 }}>
            <Text
              style={tw`${TW.textSecondary} text-description font-semibold`}
            >
              {title}
            </Text>
            <Text
              style={tw`${TW.textPrimary} text-metric font-extrabold leading-tight`}
            >
              {value}
            </Text>
          </View>
          <View style={tw`items-end gap-0.5`}>
            <View style={tw`flex-row items-center gap-1`}>
              <View style={tw`w-1.5 h-1.5 rounded-full ${accent}`} />
              <Text style={tw`${TW.textSecondary} text-caption font-medium`}>
                {statusLabel}
              </Text>
            </View>
            <Text style={tw`${TW.textSecondary} text-caption`}>{statusMeta}</Text>
          </View>
        </View>
      </View>
    </>
  );
}
