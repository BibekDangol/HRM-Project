import { RelativePathString, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import tw from "twrnc";
import { adminTabs } from "../../../config/adminTabs";

export default function AdminTabBar({ state }: any) {
  const router = useRouter();

  return (
    <View style={[tw`flex-row border-t border-gray-300 bg-gray-100`, { height: 80, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 16 },]}>
      {adminTabs.map((tab, index) => {
        const isFocused = state.index === index;
        const Icon = tab.icon;

        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(`/(admin)/${tab.name}` as RelativePathString)}
            style={tw`flex-1 items-center justify-center`}
          >
            <Icon
              size={26}
              color={isFocused ? "#1F7A4D" : "#374151"}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
