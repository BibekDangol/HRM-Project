import { RelativePathString, usePathname, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import tw from "twrnc";
import { adminTabs } from "../../../config/adminTabs";

export default function AdminTabBar({ state }: any) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={[tw`flex-row border-t border-gray-300 bg-gray-100`, { height: 80, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 16 },]}>
      {adminTabs.map((tab, index) => {
        const isFocused = state.index === index;
        const Icon = tab.icon;
        const targetPath = `/(admin)/${tab.name}`;
        const isCurrentlyOnPath = pathname === targetPath || pathname?.startsWith(targetPath + "/");

        const handlePress = () => {
          if (!isFocused && !isCurrentlyOnPath) {
            router.replace(targetPath as RelativePathString);
          }
        };

        return (
          <Pressable
            key={tab.name}
            onPress={handlePress}
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