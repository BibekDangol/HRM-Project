import { Tabs, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { useAdminHeaderMenu } from "@/src/hooks/useAdminHeaderMenu";
import { User } from "lucide-react-native";
import tw from "twrnc";
import { adminTabs } from "../../../config/adminTabs";
import AdminTabBar from "../../../pages/AdminUsers/components/AdminTabBar";
import ProfileMenu from "../../../pages/AdminUsers/components/ProfileMenu";

export default function AdminLayout() {
  const router = useRouter();
  const menu = useAdminHeaderMenu();

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerRight: () => (
          <View style={tw`mr-4`}>
            <Pressable onPress={menu.toggle}>
              <View style={tw`w-9 h-9 rounded-full border items-center justify-center`}>
                <User size={18} />
              </View>
            </Pressable>
            <ProfileMenu
              open={menu.open}
              onProfile={() => router.push("/(admin)/(tabs)/profile")}
              onLogout={menu.logout}
            />
          </View>
        ),
      }}
      tabBar={(props) => <AdminTabBar {...props} />}
    >
      {adminTabs.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.title }}
        />
        //looks for matching file inside the same folder
      ))}
      <Tabs.Screen
        name="profile"
        options={{ href: null, title: "Profile" }}
      />
    </Tabs>
  );
}
