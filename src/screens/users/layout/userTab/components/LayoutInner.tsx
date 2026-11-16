import { Tabs, usePathname, useRouter } from "expo-router";
import AppHeaderLeft from "@/src/components/navigation/header/AppHeaderLeft";
import AppHeaderRight from "@/src/components/navigation/header/AppHeaderRight";
import HeaderCheckMenu from "@/src/components/navigation/header/HeaderCheckMenu";
import { useAttendanceContext } from "@/src/context/AttendanceContext";
import { useUserHeaderController } from "@/src/hooks/navigation/useUserHeaderController";
import { useHeaderMenu } from "@/src/hooks/useHeaderMenu";
import { getTabScreenOptions } from "@/src/config/tabScreenOptions";
import MyTabBar from "@/src/components/navigation/tabbar/UserTabBar";
import ReasonModel from "./ReasonModel";

export default function LayoutInner() {
  const att = useAttendanceContext();
  const router = useRouter();
  const pathname = usePathname();
  const sharedOptions = getTabScreenOptions(pathname);
  const menu = useHeaderMenu();

  const {
    checkOpen,
    showBackButton,
    onLogout,
    handleBackPress,
    handleCheckTrigger,
    handleProfilePress,
    handleProfileTrigger,
    handleToggleCheck,
  } = useUserHeaderController({
    pathname,
    router,
    menu,
    att,
  });

  return (
    <>
      <ReasonModel
        commentModalOpen={att.commentModalOpen}
        isLocked={att.isLocked}
        onModalClose={att.handleReasonModalClose}
        onSubmitComment={att.submitComment}
        commentMode={att.commentMode ?? ""}
        commentText={att.commentText}
        onReasonModalCancel={att.handleReasonModalCancel}
        setCommentText={att.setCommentText}
      />

      <Tabs
        screenOptions={{
          ...sharedOptions,
          sceneStyle: {
            ...sharedOptions.sceneStyle,
            flex: 1,
          },
          headerTitleStyle: {
            ...sharedOptions.headerTitleStyle,
            fontWeight: "bold",
            paddingBottom: 8,
          },
          headerLeft: () => (
            <AppHeaderLeft visible={showBackButton} onPress={handleBackPress} />
          ),
          headerRight: () => (
            <AppHeaderRight
              variant="user"
              isLocked={att.isLocked}
              profileMenuOpen={menu.open}
              onProfileTrigger={handleProfileTrigger}
              onProfileClose={menu.close}
              onProfilePress={handleProfilePress}
              onLogoutPress={onLogout}
            >
              <HeaderCheckMenu
                isLocked={att.isLocked}
                isCheckedIn={att.isCheckedIn}
                isOpen={checkOpen}
                checkedInAt={att.checkedInAt}
                elapsedMs={att.elapsedMs}
                onTriggerPress={handleCheckTrigger}
                onTogglePress={handleToggleCheck}
              />
            </AppHeaderRight>
          ),
        }}
        tabBar={(props) => <MyTabBar {...props} />}
      >
        <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="leaves" options={{ title: "Leaves" }} />
        <Tabs.Screen
          name="profile/index"
          options={{ title: "Profile", href: null }}
        />
        <Tabs.Screen name="more" options={{ title: "Settings" }} />

        <Tabs.Screen
          name="holidays"
          options={{
            title: "Holidays and Events",
            href: null,
            headerTitleAlign: "center",
          }}
        />
        <Tabs.Screen
          name="activity-log"
          options={{
            title: "Recent Activity",
            href: null,
            headerTitleAlign: "center",
          }}
        />
      </Tabs>
    </>
  );
}
