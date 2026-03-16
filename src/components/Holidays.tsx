import { useUsersStore } from "@/src/store/useUsersStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { Filter } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "twrnc";
import { BackButton } from "./BackButton";

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

const CalendarRow = ({ item }: { item: CalendarItem }) => {
  const { day, month, weekday } = formatDay(item.start_date);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginBottom: 10,
        padding: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          backgroundColor: "#F1F5F9",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
          flexShrink: 0,
        }}
      >
        <Text
          style={{
            color: "#64748B",
            fontSize: 10,
            fontWeight: "600",
            letterSpacing: 0.5,
          }}
        >
          {month}
        </Text>
        <Text
          style={{
            color: "#1B4A5A",
            fontSize: 22,
            fontWeight: "800",
            lineHeight: 26,
          }}
        >
          {day}
        </Text>
        <Text style={{ color: "#94A3B8", fontSize: 10, fontWeight: "500" }}>
          {weekday}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{ color: "#1B4A5A", fontSize: 15, fontWeight: "700" }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={{ color: "#94A3B8", fontSize: 12, marginTop: 3 }}>
          {formatDateRange(item.start_date, item.end_date)}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: "#F1F5F9",
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
          marginLeft: 8,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: item.type === "holiday" ? "#EF4444" : "#3B82F6",
          }}
        >
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
    }}
  >
    <Text style={{ color: "#CBD5E1", fontSize: 13 }}>No {label} found</Text>
  </View>
);

export default function HolidaysEventsScreen() {
  const insets = useSafeAreaInsets();
  const { userProfile } = useUsersStore();

  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const filtered =
    filter === "all" ? items : items.filter((i) => i.type === filter);

  const fetchItems = useCallback(async () => {
    const orgId = userProfile?.organization_id;
    if (!orgId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_calendar")
        .select("id, title, type, color, start_date, end_date")
        .eq("organization_id", orgId)
        .order("start_date", { ascending: true });
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
        style={tw`flex-1 bg-[#F8FAFC]`}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
          />
        }
      >
        {/* ── Top bar ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          {/* Back button */}
          <BackButton
            color="#64748B"
            backgroundColor="#F1F5F9"
            style={{ marginLeft: 0 }}
          />

          {/* Count label (centered) */}
          <Text
            style={{
              color: "#64748B",
              fontSize: 13,
              flex: 1,
              textAlign: "center",
            }}
          >
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

          {/* Filter icon */}
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
            })}
          >
            <Filter size={16} color="#64748B" strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* ── List ── */}
        {loading ? (
          <EmptyState label={emptyLabel} />
        ) : filtered.length === 0 ? (
          <EmptyState label={emptyLabel} />
        ) : (
          filtered.map((item) => <CalendarRow key={item.id} item={item} />)
        )}
      </ScrollView>

      {/* ── Filter bottom sheet ── */}
      <Modal
        visible={filterModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
          onPress={() => setFilterModalOpen(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: insets.bottom + 24,
            }}
          >
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
              }}
            >
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
                  })}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? "#0F172A" : "#64748B",
                    }}
                  >
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
                      }}
                    >
                      <Text
                        style={{
                          color: "#0F172A",
                          fontSize: 12,
                          fontWeight: "800",
                        }}
                      >
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
