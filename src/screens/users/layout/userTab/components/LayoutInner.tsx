import { AppHeaderRight, AppScreenLayout, HeaderCheckMenu, HomePageIntro } from "@/src/components/navigation/header/AppHeader";
import { colors } from "@/theme/colors";
import { StatusBar } from "expo-status-bar";
import { Tabs, usePathname, useRouter } from "expo-router";
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
  const sharedOptions = getTabScreenOptions();
  const menu = useHeaderMenu();
  const hideBackRow =
    pathname.endsWith("/attendance-list") ||
    pathname.includes("/leaves/calendar/applyLeave") ||
    /\/supervisor-settings\/leave(?:\/index)?$/.test(pathname);

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
      <StatusBar style="dark" />
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
        screenLayout={({ children, route }) => (
          <AppScreenLayout
            isHome={route.name === "dashboard"}
            backgroundColor={colors.canvas}
            homeContent={
              <HomePageIntro name={menu.currentUserProfile?.first_name ?? "Home"}>
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
              </HomePageIntro>
            }
            onBack={!hideBackRow && (showBackButton || ["profile/index", "holidays", "activity-log"].includes(route.name)) ? () => {
              if (!handleBackPress()) router.replace("/(users)/dashboard");
            } : undefined}
          >
            {children}
          </AppScreenLayout>
        )}
        screenOptions={{
          ...sharedOptions,
          sceneStyle: {
            ...sharedOptions.sceneStyle,
            flex: 1,
          },
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
          }}
        />
        <Tabs.Screen
          name="activity-log"
          options={{
            title: "Recent Activity",
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}
