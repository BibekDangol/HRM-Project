import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { FilterTab, Header } from "./components/Header";

import LoadingIndicator from "@/src/components/LoadingIndicator";
import { usePagination } from "@/src/hooks/usePagination";
import { useLeaves } from "@/src/hooks/users/useLeaves";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "twrnc";
import { LeaveCard } from "./components/LeaveCard";
import { Pagination } from "@/src/components/PaginationModal";


export default function LeavesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const flatListRef = useRef<FlatList>(null);

  const { loading, refreshing, leaves, leaveTypes, onRefresh } =
    useLeaves();

  // ✅ Handle tab from params
  const requestedTab =
    typeof params.tab === "string"
      ? params.tab
      : Array.isArray(params.tab)
        ? params.tab[0]
        : undefined;

  const getInitialTab = (): FilterTab => {
    if (
      requestedTab === "all" ||
      requestedTab === "pending" ||
      requestedTab === "approved" ||
      requestedTab === "rejected"
    ) {
      return requestedTab;
    }
    return "all";
  };

  const [activeTab, setActiveTab] = useState<FilterTab>(getInitialTab());

  useEffect(() => {
    if (
      requestedTab === "all" ||
      requestedTab === "pending" ||
      requestedTab === "approved" ||
      requestedTab === "rejected"
    ) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  // ✅ Filter data
  const filteredLeaves = useMemo(() => {
    if (activeTab === "all") return leaves;
    return leaves.filter((l) => l.status === activeTab);
  }, [leaves, activeTab]);

  // ✅ Pagination hook
  const {
    page,
    setPage,
    pagedData,
    pageNumbers,
    totalPages,
    shouldShowPagination,
  } = usePagination(filteredLeaves);

  // ✅ Reset page on tab change
  useEffect(() => {
    flatListRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });
    setPage(1);
  }, [activeTab, setPage]);

  // ✅ Leave type name
  const leaveTypeName = useCallback(
    (id: number | null) =>
      leaveTypes.find((t) => t.id === id)?.name ?? "Leave",
    [leaveTypes]
  );

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <LoadingIndicator />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white px-4 pt-6`}>
      <FlatList
        ref={flatListRef}
        data={pagedData}
        keyExtractor={(i) => String(i.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 150,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={tw`mb-4`}>
            <Header
              leaves={leaves}
              leaveTypes={leaveTypes}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={tw`mb-3`}>
            <LeaveCard
              item={item}
              leaveTypeName={leaveTypeName}
              router={router}
              activeTab={activeTab}
            />
          </View>
        )}
        ListFooterComponent={
          shouldShowPagination ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              setPage={setPage}
              TW={{
                BORDER: "border-slate-200",
                textPrimary: "text-slate-700",
                textButton: "text-white",
                bgAction: "bg-[#1B4A5A]",
              }}
              tw={tw}
            />
          ) : null
        }
      />

      {/* Floating Button */}
      <Pressable
        onPress={() => router.push("/(users)/leaves/calendar")}
        style={[
          tw`absolute right-6 bg-[#1B4A5A] w-14 h-14 rounded-full items-center justify-center shadow-lg`,
          {
            bottom: insets.bottom + 78,
          },
        ]}
      >
        <Plus color="#fff" size={28} />
      </Pressable>
    </View>
  );
}
