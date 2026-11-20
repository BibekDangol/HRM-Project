import { HomeScreenHeader } from "@/src/components/navigation/header/AppHeader";
import { RefreshControl, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import tw from "@/theme/tw";
import AddUserModal from "../manage-users/AddUserModal";
import AdminOverview, { AttendanceOverview } from "./AdminOverview";
import AdminQuickActions from "./AdminQuickActions";
import { useAdminDashboard } from "./useAdminDashboard";
import { AdminDashboardHero, AdminTeamSummary, AdminUpcomingEvents } from "./AdminDashboardSummary";

export default function DashboardScreen() {
  const router = useRouter();
  const dashboard = useAdminDashboard();

  return (
    <View style={tw`flex-1 bg-canvas`}>
      <ScrollView
        contentContainerStyle={tw`pb-32 gap-4`}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={dashboard.refreshing} onRefresh={dashboard.onRefresh} />}
      >
        <HomeScreenHeader />
        <View style={[tw`px-4 gap-5`, { width: "100%", maxWidth: 760, alignSelf: "center" }]}>
          <AdminDashboardHero />
          <AdminOverview
            overview={dashboard.overview}
            error={dashboard.overviewError}
            onReviewLeaves={() => router.push("/(admin)/(main-tabs)/leave")}
          />
          <AttendanceOverview
            overview={dashboard.overview}
            error={dashboard.overviewError}
            onViewAttendance={() => router.push("/(admin)/(main-tabs)/more/attendance-list")}
          />
          <AdminTeamSummary count={dashboard.employeeCount} onViewUsers={() => router.push("/(admin)/(main-tabs)/manage-users")} />
          <AdminQuickActions onAddEmployee={dashboard.openAddUser} />
          <AdminUpcomingEvents
            items={dashboard.calendarItems}
            loading={dashboard.calendarLoading}
            onViewAll={() => router.push("/(admin)/holidays")}
          />
        </View>
      </ScrollView>
      <AddUserModal
        visible={dashboard.addUserModalVisible}
        tempPassword={dashboard.tempPassword}
        onClose={dashboard.closeAddUser}
        onSubmit={dashboard.handleAddUser}
        supervisors={dashboard.users}
        currentUserId={dashboard.currentUserId}
        isSubmitting={dashboard.isSubmittingUser}
      />
    </View>
  );
}
