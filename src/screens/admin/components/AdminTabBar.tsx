import { PlatformPressable } from "@react-navigation/elements";
import { View } from "react-native";
import { adminTabs } from "../../../config/adminTabs";
import tw from "twrnc";
import { useLinkBuilder } from "@react-navigation/native";

export default function AdminTabBar({ state, navigation }: any) {
  const { buildHref } = useLinkBuilder();

  return (
    <View style={tw`flex-row border-t bg-gray-100 h-20 pt-2`}>
      {adminTabs.map((tab, index) => {
        const isFocused = state.index === index;
        const Icon = tab.icon;

        return (
          <PlatformPressable
            key={tab.name}
            href={buildHref(tab.name)}
            onPress={() => navigation.navigate(tab.name)}
            style={tw`flex-1 items-center justify-center`}
          >
            <Icon
              size={26}
              color={isFocused ? "#1F7A4D" : "#374151"}
            />
          </PlatformPressable>
        );
      })}
    </View>
  );
}
