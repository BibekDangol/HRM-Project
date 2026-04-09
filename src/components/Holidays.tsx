import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { useFocusEffect } from "expo-router";
import { SlidersHorizontal } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUsersStore } from "@/src/store/useUsersStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { TW } from "@/theme/twStyles";
import {
  CalendarItem,
  FILTERS,
  FilterType,
  formatDate,
  getNepalTodayKey,
} from "@/src/utils/calendar.utils";

type GroupedCalendarItems = {
  date: string;
  items: CalendarItem[];
};

type AdminCalendarRow = {
  id: number;
  title: string | null;
  type: string | null;
  color: string | null;
  start_date: string | null;
  end_date: string | null;
};

const EventItemRow = ({ item }: { item: CalendarItem }) => (
  <View
    style={{
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: "rgba(27,74,90,0.08)",
    }}
  >
    <Text
      style={{
        color: TW.bgSecondary,
        fontSize: 15,
        fontWeight: "600",
        lineHeight: 21,
      }}
    >
      {item.title}
    </Text>

    <Text
      style={{
        color: TW.BRAND_MUTED,
        fontSize: 12,
        marginTop: 3,
      }}
    >
      {item.type === "holiday" ? "Holiday" : "Event"}
    </Text>
  </View>
);

const DateGroupCard = ({
  group,
  isHighlighted,
}: {
  group: GroupedCalendarItems;
  isHighlighted: boolean;
}) => (
  <View
    style={{
      marginBottom: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isHighlighted ? "#BAE6FD" : "rgba(27,74,90,0.08)",
      backgroundColor: isHighlighted ? "#F0F9FF" : "#fff",
      overflow: "hidden",
    }}
  >
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: isHighlighted ? "#E0F2FE" : "rgba(27,74,90,0.04)",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            minWidth: 62,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 10,
            backgroundColor: isHighlighted ? "#fff" : "rgba(27,74,90,0.08)",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: TW.bgSecondary,
              fontSize: 13,
              fontWeight: "700",
            }}
          >
            {formatDate(group.date)}
          </Text>
        </View>

        <View>
          <Text
            style={{
              color: TW.bgSecondary,
              fontSize: 15,
              fontWeight: "700",
            }}
          >
            {group.items.length} {group.items.length === 1 ? "item" : "items"}
          </Text>

          <Text
            style={{
              color: TW.BRAND_MUTED,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            Holidays & Events
          </Text>
        </View>
      </View>

      {isHighlighted && (
        <View
          style={{
            backgroundColor: TW.bgSecondary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 10,
              fontWeight: "700",
            }}
          >
            LATEST
          </Text>
        </View>
      )}
    </View>

    <View style={{ paddingHorizontal: 14, paddingBottom: 6 }}>
      {group.items.map((item, index) => (
        <View
          key={item.id}
          style={{
            borderTopWidth: index === 0 ? 0 : 1,
            borderTopColor: "rgba(27,74,90,0.08)",
          }}
        >
          <EventItemRow item={item} />
        </View>
      ))}
    </View>
  </View>
);

const FilterModal = ({
  visible,
  filter,
  onSelect,
  onClose,
}: {
  visible: boolean;
  filter: FilterType;
  onSelect: (f: FilterType) => void;
  onClose: () => void;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <Pressable
      onPress={onClose}
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
      }}
    >
      <Pressable
        onPress={() => {}}
        style={{
          width: "100%",
          maxWidth: 300,
          backgroundColor: "#fff",
          borderRadius: 22,
          padding: 24,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}
      >
        <Text
          style={{
            color: TW.bgSecondary,
            fontSize: 16,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Filter
        </Text>

        {FILTERS.map((opt) => {
          const active = filter === opt.key;

          return (
            <Pressable
              key={opt.key}
              onPress={() => {
                onSelect(opt.key);
                onClose();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 13,
                paddingHorizontal: 16,
                borderRadius: 12,
                marginBottom: 8,
                backgroundColor: active
                  ? TW.bgSecondary
                  : "rgba(27,74,90,0.06)",
              }}
            >
              <Text
                style={{
                  color: active ? "#fff" : TW.bgSecondary,
                  fontSize: 14,
                  fontWeight: active ? "700" : "400",
                }}
              >
                {opt.label}
              </Text>

              {active && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#fff",
                  }}
                />
              )}
            </Pressable>
          );
        })}
      </Pressable>
    </Pressable>
  </Modal>
);

export default function HolidaysEventsScreen() {
  const insets = useSafeAreaInsets();
  const { currentUserProfile } = useUsersStore();
  const listRef = useRef<FlatList<GroupedCalendarItems>>(null);
  const hasFetchedRef = useRef(false);

  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [filterModal, setFilterModal] = useState(false);

  const todayKey = useMemo(() => getNepalTodayKey(), []);

  const fetchItems = useCallback(async () => {
    const orgId = currentUserProfile?.organization_id;
    if (!orgId) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("admin_calendar")
        .select("id, title, type, color, start_date, end_date")
        .eq("organization_id", orgId)
        .order("start_date", { ascending: true });

      if (error) throw error;

      const rows: AdminCalendarRow[] = (data ?? []) as AdminCalendarRow[];

      const mappedItems: CalendarItem[] = rows
        .filter(
          (item) =>
            item.start_date &&
            (item.type === "holiday" || item.type === "event")
        )
        .map((item) => ({
          id: String(item.id),
          title: item.title ?? "",
          type: item.type as "holiday" | "event",
          color: item.color ?? "",
          start_date: item.start_date ?? "",
          end_date: item.end_date ?? "",
        }));

      setItems(mappedItems);
    } catch (e) {
      console.log("HolidaysEvents fetch error:", e);
    } finally {
      setLoading(false);
      hasFetchedRef.current = true;
    }
  }, [currentUserProfile?.organization_id]);

  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useFocusEffect(
    useCallback(() => {
      if (hasFetchedRef.current) {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      }
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => filter === "all" || item.type === filter)
      .sort((a, b) => b.start_date.localeCompare(a.start_date));
  }, [items, filter]);

  const groupedItems = useMemo<GroupedCalendarItems[]>(() => {
    const groups: Record<string, CalendarItem[]> = {};

    visibleItems.forEach((item) => {
      if (!groups[item.start_date]) {
        groups[item.start_date] = [];
      }
      groups[item.start_date].push(item);
    });

    return Object.entries(groups).map(([date, grouped]) => ({
      date,
      items: grouped,
    }));
  }, [visibleItems]);

  const latestDate = groupedItems.length > 0 ? groupedItems[0].date : null;

  const emptyMessage = useMemo(() => {
    if (filter === "holiday") return "There are no holidays to display.";
    if (filter === "event") return "There are no events to display.";
    return "There are no holidays or events to display.";
  }, [filter]);

  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(27,74,90,0.08)",
            backgroundColor: "#fff",
          }}
        >
          <Pressable
            onPress={() => setFilterModal(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "rgba(27,74,90,0.08)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <SlidersHorizontal size={13} color={TW.bgSecondary} />
            <Text
              style={{
                color: TW.bgSecondary,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {FILTERS.find((o) => o.key === filter)?.label ?? "All"}
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={{ flex: 1, paddingTop: 48, alignItems: "center" }}>
            <ActivityIndicator color={TW.bgSecondary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={groupedItems}
            keyExtractor={(item) => item.date}
            renderItem={({ item }) => (
              <DateGroupCard
                group={item}
                isHighlighted={!!latestDate && item.date === latestDate}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: insets.bottom + 24,
              flexGrow: groupedItems.length === 0 ? 1 : undefined,
            }}
            ListEmptyComponent={
              <View style={{ flex: 1, justifyContent: "center", paddingTop: 40 }}>
                <Text
                  style={{
                    color: TW.BRAND_MUTED,
                    textAlign: "center",
                    fontSize: 14,
                  }}
                >
                  {emptyMessage}
                </Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={TW.bgSecondary}
                colors={[TW.bgSecondary]}
              />
            }
          />
        )}
      </View>

      <FilterModal
        visible={filterModal}
        filter={filter}
        onSelect={setFilter}
        onClose={() => setFilterModal(false)}
      />
    </>
  );
}