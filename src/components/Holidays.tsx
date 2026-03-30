import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useUsersStore } from "@/src/store/useUsersStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { useFocusEffect } from "expo-router";
import { Filter } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "twrnc";

type FilterType = "all" | "holiday" | "event";

type CalendarItem = {
  id: string;
  title: string;
  type: "holiday" | "event";
  color: string;
  start_date: string;
  end_date: string | null;
};

const formatDateRange = (start: string, end: string | null) => {
  const s = new Date(start + "T00:00:00");
  const startStr = s.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
  if (!end || end === start) return startStr;
  const e = new Date(end + "T00:00:00");
  const endStr = e.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
  return `${startStr} – ${endStr}`;
};

const formatDay = (d: string) => {
  const date = new Date(d + "T00:00:00");
  return {
    day: date.getDate().toString().padStart(2, "0"),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
  };
};

const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

const getItemStatus = (item: CalendarItem) => {
  const start = new Date(item.start_date + "T00:00:00");
  const end = item.end_date ? new Date(item.end_date + "T00:00:00") : start;
  if (start <= todayDate && end >= todayDate) return "today";
  if (start > todayDate) return "upcoming";
  return "past";
};

const CalendarRow = ({
  item,
  isHighlighted,
}: {
  item: CalendarItem;
  isHighlighted: boolean;
}) => {
  const { day, month, weekday } = formatDay(item.start_date);
  const status = getItemStatus(item);
  const isToday = status === "today";
  const isPast = status === "past";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isHighlighted ? "#E6F4F4" : "#FFFFFF",
        borderRadius: 16,
        marginBottom: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: isHighlighted ? "#008080" : "#EAECEF",
        shadowColor: "#000",
        shadowOpacity: isPast ? 0.02 : 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: isPast ? 0 : 2,
        opacity: isPast ? 0.5 : 1,
      }}>
      {/* Date block */}
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          backgroundColor: isHighlighted ? "#ffffff" : "#F8FAFC",
          borderColor: isHighlighted ? "#008080" : "#94A3B8",
          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
          flexShrink: 0,
        }}>
        <Text
          style={{
            color: "#64748B",
            fontSize: 10,
            fontWeight: "600",
            letterSpacing: 0.5,
          }}>
          {month}
        </Text>
        <Text
          style={{
            color: isHighlighted ? "#008080" : "#1B4A5A",
            fontSize: 22,
            fontWeight: "800",
            lineHeight: 26,
          }}>
          {day}
        </Text>
        <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "500" }}>
          {weekday}
        </Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {isHighlighted && (
          <Text
            style={{
              color: "#008080",
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 0.6,
              marginBottom: 2,
            }}>
            {isToday ? "TODAY" : "UPCOMING"}
          </Text>
        )}
        <Text
          style={{ color: "#1B4A5A", fontSize: 15, fontWeight: "700" }}
          numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: "#94A3B8", fontSize: 12, marginTop: 3 }}>
          {formatDateRange(item.start_date, item.end_date)}
        </Text>
      </View>

      {/* Type badge */}
      <View
        style={{
          backgroundColor: isHighlighted ? "#ffffff" : "#F1F5F9",
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
          marginLeft: 8,
          borderWidth: isHighlighted ? 1 : 0,
          borderColor: "#008080",
        }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: isHighlighted
              ? "#008080"
              : item.type === "holiday"
                ? "#EF4444"
                : "#3B82F6",
          }}>
          {item.type === "holiday" ? "Holiday" : "Event"}
        </Text>
      </View>
    </View>
  );
};

const EmptyState = ({ label }: { label: string }) => (
  <View
    style={{
      backgroundColor: "#F8FAFC",
      borderRadius: 16,
      paddingVertical: 40,
      alignItems: "center",
    }}>
    <Text style={{ color: "#CBD5E1", fontSize: 12 }}>No {label} found</Text>
  </View>
);

export default function HolidaysEventsScreen() {
  const insets = useSafeAreaInsets();
  const { userProfile } = useUsersStore();
  const scrollRef = useRef<ScrollView>(null);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Filter by type then sort descending
  const filtered = (
    filter === "all" ? items : items.filter((i) => i.type === filter)
  )
    .slice()
    .sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
    );

  // Single item to highlight — today first, else nearest upcoming
  const highlightId = (() => {
    const todayItem = filtered.find((i) => getItemStatus(i) === "today");
    if (todayItem) return todayItem.id;
    const upcomingItem = [...filtered]
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      )
      .find((i) => getItemStatus(i) === "upcoming");
    return upcomingItem?.id ?? null;
  })();

  const fetchItems = useCallback(async () => {
    const orgId = userProfile?.organization_id;
    if (!orgId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_calendar")
        .select("id, title, type, color, start_date, end_date")
        .eq("organization_id", orgId)
        .order("start_date", { ascending: false });
      if (error) throw error;
      setItems((data ?? []) as CalendarItem[]);
    } catch (e) {
      console.log("HolidaysEvents fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.organization_id]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  useFocusEffect(
    useCallback(() => {
      // runs every time screen is focused (tab switch back)
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "holiday", label: "Holidays" },
    { key: "event", label: "Events" },
  ];

  const emptyLabel =
    filter === "all"
      ? "holidays or events"
      : filter === "holiday"
        ? "holidays"
        : "events";

  return (
    <>
      <ScrollView
        ref={scrollRef}
        style={tw`flex-1 bg-white`}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
            colors={["#1B4A5A"]}
            tintColor="#1B4A5A"
          />
        }>
        {/* ── Top bar ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}>
          {/* <BackButton floating onPress={() => router.back()} /> */}
          <Text
            style={{
              color: "#64748B",
              fontSize: 13,
              flex: 1,
            }}>
            <Text style={{ color: "#0F172A", fontWeight: "700" }}>
              {filtered.length}
            </Text>
            {"  "}
            {filter === "all"
              ? "total"
              : filter === "holiday"
                ? "holidays"
                : "events"}
          </Text>

          <Pressable
            onPress={() => setFilterModalOpen(true)}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: filter !== "all" ? "#E2E8F0" : "#F1F5F9",
              opacity: pressed ? 0.7 : 1,
            })}>
            <Filter size={16} color="#64748B" strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* ── List ── */}
        {loading ? (
          <EmptyState label={emptyLabel} />
        ) : filtered.length === 0 ? (
          <EmptyState label={emptyLabel} />
        ) : (
          filtered.map((item) => (
            <CalendarRow
              key={item.id}
              item={item}
              isHighlighted={item.id === highlightId}
            />
          ))
        )}
      </ScrollView>

      {/* ── Filter bottom sheet ── */}
      <Modal
        visible={filterModalOpen}
        transparent
        animationType="none"
        onRequestClose={() => setFilterModalOpen(false)}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
          onPress={() => setFilterModalOpen(false)}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: insets.bottom + 24,
            }}>
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#E2E8F0",
                }}
              />
            </View>

            <Text
              style={{
                color: "#0F172A",
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 16,
              }}>
              Filter by
            </Text>

            {FILTER_OPTIONS.map((opt) => {
              const isActive = filter === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => {
                    setFilter(opt.key);
                    setFilterModalOpen(false);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 14,
                    marginBottom: 8,
                    backgroundColor: isActive ? "#F1F5F9" : "#F8FAFC",
                    opacity: pressed ? 0.75 : 1,
                  })}>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? "#0F172A" : "#64748B",
                    }}>
                    {opt.label}
                  </Text>
                  {isActive && (
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: "#E2E8F0",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                      <Text
                        style={{
                          color: "#0F172A",
                          fontSize: 12,
                          fontWeight: "800",
                        }}>
                        ✓
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
