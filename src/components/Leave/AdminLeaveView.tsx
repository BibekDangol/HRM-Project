import { RelativePathString, useFocusEffect, useRouter } from "expo-router";
import { CalendarClock, ChevronRight } from "lucide-react-native";
import { useCallback, useRef } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import LoadingIndicator from "@/src/components/LoadingIndicator";
import { useLeaveView } from "@/src/hooks/admin/useLeaveView";
import { LeaveStatus } from "@/src/services/leave.service";
import { useLeaveTabStore } from "@/src/store/useLeaveTabStore";
import { TW } from "@/theme/twStyles";
import tw from "twrnc";
import { Pagination } from "../PaginationModal";

type Props = {
  approvedPath: string;
  pendingPath: string;
  rejectedPath: string;
  fetchLeaves: (orgId: number, userId: string) => Promise<any[]>;
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> =
  {
    pending: { bg: "bg-red-50", text: "text-amber-600", dot: "bg-amber-400" },
    approved: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      dot: "bg-emerald-400",
    },
    rejected: { bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400" },
  };

const TABS: LeaveStatus[] = ["pending", "approved", "rejected"];

export default function LeaveView({
  approvedPath,
  pendingPath,
  rejectedPath,
  fetchLeaves,
}: Props) {
  const router = useRouter();
  const listRef = useRef<FlatList>(null);
  const { setActiveTab } = useLeaveTabStore();
  //renrenders if any of these changes
  const activeTab = useLeaveTabStore((s) => s.activeTab);
  console.log("store", activeTab);
  //zustand subscribes to any tab I click

  const {
    paginatedLeaves,
    counts,
    loading,
    refreshing,
    onRefresh,
    shouldShowPagination,
    pageNumbers,
    totalPages,
    page,
    setPage,
  } = useLeaveView({ fetchLeaves, scrollRef: listRef, activeTab });

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      listRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }, []),
  );

  const goToDetails = (leave: any) => {
    const path =
      leave.status === "approved"
        ? approvedPath
        : leave.status === "pending"
          ? pendingPath
          : rejectedPath;

    router.push({
      pathname: path as RelativePathString,
      params: { id: leave.id },
    });
  };

  if (loading) return <LoadingIndicator />;

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Tabs */}
      <View style={tw`flex-row mx-2 mt-2 rounded-2xl p-1 bg-slate-100`}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={({ pressed }) => [
                tw`flex-1 py-3 rounded-xl items-center`,
                isActive ? tw`${TW.bgAction}` : null,
                pressed && !isActive && tw`opacity-70`,
              ]}>
              <Text
                style={tw`text-sm font-bold ${
                  isActive ? TW.textButton : TW.textPrimary
                }`}>
                {tab.toUpperCase()}{" "}
                <Text
                  style={tw`text-xs ${
                    isActive ? TW.textButton : TW.textPrimary
                  }`}>
                  ({counts[tab]})
                </Text>
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        ref={listRef}
        data={paginatedLeaves}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`px-4 pt-3 pb-10`}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <View style={tw`h-3`} />}
        renderItem={({ item: leave }) => {
          const cfg = statusConfig[leave.status] ?? statusConfig.pending;

          return (
            <Pressable
              onPress={() => goToDetails(leave)}
              style={({ pressed }) => [
                tw`flex-row items-center bg-white border ${TW.BORDER} rounded-2xl px-4 py-4`,
                pressed && tw`bg-slate-50`,
              ]}>
              {/* Icon */}
              <View
                style={tw`h-12 w-12 rounded-xl bg-slate-100 items-center justify-center mr-4`}>
                <CalendarClock size={20} color="#475569" />
              </View>

              {/* Info */}
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-semibold ${TW.textPrimary}`}>
                  {leave.first_name} {leave.last_name ?? ""}
                </Text>
                <Text style={tw`text-xs ${TW.textSecondary} mt-0.5`}>
                  {leave.start_date}
                  {leave.end_date && leave.end_date !== leave.start_date
                    ? ` → ${leave.end_date}`
                    : ""}
                </Text>
              </View>

              {/* Status */}
              <View
                style={tw`flex-row items-center px-3 py-1.5 rounded-xl mr-3 ${cfg.bg}`}>
                <View style={tw`h-1.5 w-1.5 rounded-full mr-1.5 ${cfg.dot}`} />
                <Text style={tw`text-xs font-bold ${cfg.text}`}>
                  {leave.status.toUpperCase()}
                </Text>
              </View>

              <ChevronRight size={16} color="#cbd5e1" />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={tw`items-center justify-center py-20`}>
            <View
              style={tw`h-16 w-16 rounded-full ${TW.bgCards} items-center justify-center mb-4`}>
              <CalendarClock size={28} color="#94a3b8" />
            </View>
            <Text style={tw`text-base font-semibold ${TW.textPrimary}`}>
              No leave requests
            </Text>
            <Text style={tw`text-sm mt-1 ${TW.textSecondary}`}>
              All leave requests will appear here
            </Text>
          </View>
        }
      />

      {/* Pagination */}
      {shouldShowPagination && (
        <Pagination
          page={page}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          setPage={setPage}
          shouldShowPagination={shouldShowPagination}
          TW={TW}
          tw={tw}
        />
      )}
    </View>
  );
}
