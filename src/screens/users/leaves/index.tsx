import { colors } from "@/theme/colors";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { FilterTab, Header } from "./components/Header";
import EmptyState from "@/src/components/states/EmptyState";
import LoadingState from "@/src/components/states/LoadingState";
import { Pagination } from "@/src/components/lists/Pagination";
import { useLeaves } from "@/src/hooks/users/useLeaves";
import { usePagination } from "@/src/hooks/usePagination";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarClock, CalendarDays, Plus } from "lucide-react-native";
import AppButton from "@/src/components/ui/AppButton";
import tw from "@/theme/tw";
import { LeaveCard } from "./components/LeaveCard";

export default function LeavesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const flatListRef = useRef<FlatList>(null);

  const { loading, refreshing, leaves, leaveTypes, onRefresh } = useLeaves();

  const rawTab =
    typeof params.tab === "string"
      ? params.tab
      : Array.isArray(params.tab)
        ? params.tab[0]
        : undefined;

  const validRequestedTab =
    rawTab === "all" ||
    rawTab === "pending" ||
    rawTab === "approved" ||
    rawTab === "rejected"
      ? (rawTab as FilterTab)
      : undefined;

  const [prevRequestedTab, setPrevRequestedTab] = useState(validRequestedTab);
  const [activeTab, setActiveTab] = useState<FilterTab>(
    validRequestedTab ?? "all",
  );

  // Adjust activeTab during render if URL param changes (React 19 pattern)
  if (prevRequestedTab !== validRequestedTab && validRequestedTab !== undefined) {
    setPrevRequestedTab(validRequestedTab);
    setActiveTab(validRequestedTab);
  }

  const filteredLeaves = useMemo(() => {
    if (activeTab === "all") return leaves;
    return leaves.filter((l) => l.status === activeTab);
  }, [leaves, activeTab]);

  const {
    page,
    setPage,
    pagedData,
    pageNumbers,
    totalPages,
    shouldShowPagination,
  } = usePagination(
    filteredLeaves,
    undefined,
    () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
    { resetKey: activeTab },
  );

  const leaveTypeName = useCallback(
    (id: number | null) =>
      leaveTypes.find((t) => t.id === id)?.name ?? "Leave",
    [leaveTypes],
  );

  if (loading) {
    return <LoadingState fullScreen message="Loading leaves..." />;
  }

  return (
    <View style={tw`flex-1 bg-canvas`}>
      <FlatList
        ref={flatListRef}
        data={pagedData}
        keyExtractor={(i) => String(i.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View>
            <AppButton
              title="View calendar"
              variant="ghost"
              icon={<CalendarDays size={18} color={colors.primary} />}
              onPress={() => router.push("/(users)/leaves/calendar")}
              style={{ alignSelf: "flex-end", marginTop: 8 }}
            />
            <Header
              leaves={leaves}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={tw`mb-2`}>
            <LeaveCard
              item={item}
              leaveTypeName={leaveTypeName}
              router={router}
              activeTab={activeTab}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={
              <View
                style={tw`h-14 w-14 rounded-full bg-slate-100 items-center justify-center`}
              >
                <CalendarClock size={26} color={colors.subtle} />
              </View>
            }
            title="No leaves found"
            message={
              activeTab === "all"
                ? "You haven't requested any leaves yet."
                : `You have no ${activeTab} leave requests.`
            }
            actionLabel="Request leave"
            onAction={() => router.push("/(users)/leaves/calendar/applyLeave")}
            style={tw`py-12`}
          />
        }
        ListFooterComponent={
          shouldShowPagination ? (
            <View style={{ paddingBottom: 16 }}>
              <Pagination
                page={page}
                totalPages={totalPages}
                pageNumbers={pageNumbers}
                setPage={setPage}
                variant="muted"
              />
            </View>
          ) : null
        }
      />

      <View style={tw`px-4 py-3 border-t border-border bg-surface`}>
        <AppButton
          title="Request leave"
          fullWidth
          icon={<Plus color={colors.surface} size={20} />}
          onPress={() => router.push("/(users)/leaves/calendar/applyLeave")}
        />
      </View>
    </View>
  );
}