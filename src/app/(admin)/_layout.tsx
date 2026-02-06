import { Tabs, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { adminTabs } from "@/src/config/adminTabs";
import { useAdminHeaderMenu } from "@/src/hooks/useAdminHeaderMenu";
import AdminTabBar from "@/src/screens/admin/components/AdminTabBar";
import ProfileMenu from "@/src/screens/admin/components/ProfileMenu";
import { User } from "lucide-react-native";
import tw from "twrnc";

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
              <View
                style={tw`w-9 h-9 rounded-full border items-center justify-center`}
              >
                <User size={18} />
              </View>
            </Pressable>
            <ProfileMenu
              open={menu.open}
              onProfile={() => router.push("/(admin)/profile")}
              onLogout={menu.logout}
            />
          </View>
        ),
      }}
      tabBar={(props) => <AdminTabBar {...props} />}
    >
      {adminTabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.title }}
        />
        //looks for matching file inside the same folder
      ))}
      <Tabs.Screen name="profile" options={{ href: null, title: "Profile" }} />
    </Tabs>
  );
}
