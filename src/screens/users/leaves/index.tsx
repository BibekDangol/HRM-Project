import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { FilterTab, Header } from "./components/Header";

import LoadingIndicator from "@/src/components/LoadingIndicator";
import { useLeavePagination } from "@/src/hooks/users/useLeavePagination";
import { useLeaves } from "@/src/hooks/users/useLeaves";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import tw from "twrnc";
import { LeaveCard } from "./components/LeaveCard";

export default function LeavesScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { loading, refreshing, leaves, leaveTypes, onRefresh } = useLeaves();

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const filteredLeaves = useMemo(() => {
    if (activeTab === "all") return leaves;
    return leaves.filter((l) => l.status === activeTab);
  }, [leaves, activeTab]);
  const { page, setPage, pagedData, pageNumbers, totalPages } =
    useLeavePagination(filteredLeaves);

  const leaveTypeName = useCallback(
    (id: number | null) => leaveTypes.find((t) => t.id === id)?.name ?? "Leave",
    [leaveTypes],
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
        contentContainerStyle={tw`pb-24`}
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
          <View style={tw`flex-row items-center justify-center gap-2 py-4`}>
            <Pressable
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              style={tw`px-3 py-2 border border-slate-200 rounded-lg`}
            >
              <Text style={tw`text-slate-700 font-medium`}>Prev</Text>
            </Pressable>

            {pageNumbers.map((p) => (
              <Pressable
                key={p}
                onPress={() => setPage(p)}
                style={tw`px-3 py-2 rounded-lg border border-slate-200`}
              >
                <Text
                  style={[
                    tw`font-medium`,
                    p === page
                      ? tw`text-white bg-[#1B4A5A] px-2 py-1 rounded`
                      : tw`text-slate-700`,
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={tw`px-3 py-2 border border-slate-200 rounded-lg`}
            >
              <Text style={tw`text-slate-700 font-medium`}>Next</Text>
            </Pressable>
          </View>
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => router.push("/(users)/leaves/calendar")}
        style={tw`absolute bottom-6 right-6 bg-[#1B4A5A] w-14 h-14 rounded-full items-center justify-center shadow-lg`}
      >
        <Plus color="#fff" size={28} />
      </Pressable>
    </View>
  );
}
