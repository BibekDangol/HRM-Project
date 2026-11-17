import { colors } from "@/theme/colors";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Platform, Pressable, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-screens/experimental";
import { FilterTab, Header } from "./components/Header";
import EmptyState from "@/src/components/states/EmptyState";
import LoadingState from "@/src/components/states/LoadingState";
import { Pagination } from "@/src/components/lists/Pagination";
import { useLeaves } from "@/src/hooks/users/useLeaves";
import { usePagination } from "@/src/hooks/usePagination";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarClock, Plus } from "lucide-react-native";
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
  if (
    prevRequestedTab !== validRequestedTab &&
    validRequestedTab !== undefined
  ) {
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
    (id: number | null) => leaveTypes.find((t) => t.id === id)?.name ?? "Leave",
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
          paddingBottom: 96,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Header
            leaves={leaves}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
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

      <SafeAreaView
        pointerEvents="box-none"
        edges={{ bottom: Platform.OS === "ios" }}
        style={{ position: "absolute", bottom: 0, right: 0, left: 0 }}
      >
        <View pointerEvents="box-none" style={{ padding: 16, alignItems: "flex-end" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Request leave"
            onPress={() => router.push("/(users)/(main-tabs)/leaves/calendar/applyLeave")}
            style={({ pressed }) => ({
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed ? colors.primaryPressed : colors.primary,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.18)",
            })}
          >
            <Plus color={colors.surface} size={28} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
