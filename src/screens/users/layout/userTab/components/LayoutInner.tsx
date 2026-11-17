import { AppHeaderRight, AppScreenLayout, HomeScreenHeaderContext, HeaderCheckMenu, HomePageIntro } from "@/src/components/navigation/header/AppHeader";
import { colors } from "@/theme/colors";
import { StatusBar } from "expo-status-bar";
import { Stack, usePathname, useRouter } from "expo-router";
import { useAttendanceContext } from "@/src/context/AttendanceContext";
import { useUserHeaderController } from "@/src/hooks/navigation/useUserHeaderController";
import { useHeaderMenu } from "@/src/hooks/useHeaderMenu";
import ReasonModel from "./ReasonModel";

export default function LayoutInner() {
  const att = useAttendanceContext();
  const router = useRouter();
  const pathname = usePathname();
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
    <HomeScreenHeaderContext.Provider value={
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
    }>
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

      <Stack
        screenLayout={({ children, route }) => (
          <AppScreenLayout
            isHome={false}
            insetBottom={route.name !== "(main-tabs)"}
            backgroundColor={colors.canvas}
            onBack={!hideBackRow && (showBackButton || ["profile/index", "holidays", "activity-log"].includes(route.name)) ? () => {
              if (!handleBackPress()) router.replace("/(users)/(main-tabs)/dashboard");
            } : undefined}
          >
            {children}
          </AppScreenLayout>
        )}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}
      >
        <Stack.Screen name="(main-tabs)" />
        <Stack.Screen name="profile/index" />
        <Stack.Screen name="holidays" />
        <Stack.Screen name="activity-log" />
      </Stack>
    </HomeScreenHeaderContext.Provider>
  );
}
