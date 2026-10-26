import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { FilterTab, Header } from "./components/Header";
import EmptyState from "@/src/components/states/EmptyState";
import LoadingState from "@/src/components/states/LoadingState";
import { Pagination } from "@/src/components/lists/Pagination";
import { useLeaves } from "@/src/hooks/users/useLeaves";
import { usePagination } from "@/src/hooks/usePagination";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarClock, Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "twrnc";
import { LeaveCard } from "./components/LeaveCard";

export default function LeavesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <View style={tw`flex-1 bg-white`}>
      <FlatList
        ref={flatListRef}
        data={pagedData}
        keyExtractor={(i) => String(i.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 80,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Header
            leaves={leaves}
            leaveTypes={leaveTypes}
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
                <CalendarClock size={26} color="#94A3B8" />
              </View>
            }
            title="No leaves found"
            message={
              activeTab === "all"
                ? "You haven't requested any leaves yet."
                : `You have no ${activeTab} leave requests.`
            }
            actionLabel="Apply Leave"
            onAction={() => router.push("/(users)/leaves/calendar")}
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

      <Pressable
        onPress={() => router.push("/(users)/leaves/calendar")}
        style={[
          tw`absolute right-5 bg-[#1B4A5A] w-13 h-13 rounded-full items-center justify-center`,
          {
            bottom: insets.bottom + 72,
            shadowColor: "#1B4A5A",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
      >
        <Plus color="#fff" size={24} />
      </Pressable>
    </View>
  );
}