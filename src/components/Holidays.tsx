import { colors } from "@/theme/colors";
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
  FILTERS,
  FilterType,
  formatDate,
  getNepalTodayKey,
} from "@/src/utils/calendar.utils";
import { CalendarItem } from "../types/Calendar";

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

function isActiveToday(item: CalendarItem, todayKey: string) {
  const endDate = item.end_date || item.start_date;
  return item.start_date <= todayKey && endDate >= todayKey;
}

function getGroupStatus(
  group: GroupedCalendarItems,
  todayKey: string
): "today" | "upcoming" | "past" {
  const hasActiveToday = group.items.some((item) => isActiveToday(item, todayKey));
  if (hasActiveToday) return "today";

  if (group.date > todayKey) return "upcoming";

  return "past";
}

const EventItemRow = ({ item }: { item: CalendarItem }) => (
  <View
    style={{
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.primaryWash,
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
  badgeLabel,
  isPast,
}: {
  group: GroupedCalendarItems;
  isHighlighted: boolean;
  badgeLabel?: "TODAY" | "NEXT" | null;
  isPast: boolean;
}) => (
  <View
    style={{
      marginBottom: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isHighlighted ? colors.primaryBorder : colors.primaryWash,
      backgroundColor: isHighlighted ? colors.primarySoft : colors.surface,
      overflow: "hidden",
      opacity: isPast && !isHighlighted ? 0.72 : 1,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: isHighlighted ? colors.primarySoft : colors.primaryWashLight,
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
            backgroundColor: isHighlighted ? colors.surface : colors.primaryWash,
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

      {isHighlighted && badgeLabel && (
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
              color: colors.surface,
              fontSize: 10,
              fontWeight: "700",
            }}
          >
            {badgeLabel}
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
            borderTopColor: colors.primaryWash,
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
        backgroundColor: colors.overlay,
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
          backgroundColor: colors.surface,
          borderRadius: 22,
          padding: 24,
          shadowColor: colors.shadow,
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
                  : colors.primaryWashMedium,
              }}
            >
              <Text
                style={{
                  color: active ? colors.surface : TW.bgSecondary,
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
                    backgroundColor: colors.surface,
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
          id: item.id,
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Start the loading indicator for this external data fetch.
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

    return Object.entries(groups)
      .map(([date, grouped]) => ({
        date,
        items: grouped,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [visibleItems]);

  const highlightedDate = useMemo(() => {
    const todayGroup = groupedItems.find(
      (group) => getGroupStatus(group, todayKey) === "today"
    );
    if (todayGroup) return todayGroup.date;

    const nextUpcomingGroup = groupedItems
      .filter((group) => getGroupStatus(group, todayKey) === "upcoming")
      .sort((a, b) => a.date.localeCompare(b.date))[0];

    return nextUpcomingGroup?.date ?? null;
  }, [groupedItems, todayKey]);

  const highlightBadgeLabel = useMemo(() => {
    if (!highlightedDate) return null;

    const group = groupedItems.find((item) => item.date === highlightedDate);
    if (!group) return null;

    return getGroupStatus(group, todayKey) === "today" ? "TODAY" : "NEXT";
  }, [groupedItems, highlightedDate, todayKey]);

  const emptyMessage = useMemo(() => {
    if (filter === "holiday") return "There are no holidays to display.";
    if (filter === "event") return "There are no events to display.";
    return "There are no holidays or events to display.";
  }, [filter]);

  return (
    <>
      <View style={{ flex: 1, backgroundColor: colors.canvas }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.primaryWash,
            backgroundColor: colors.canvas,
          }}
        >
          <Pressable
            onPress={() => setFilterModal(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: colors.primaryWash,
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
            renderItem={({ item }) => {
              const status = getGroupStatus(item, todayKey);
              const isHighlighted = !!highlightedDate && item.date === highlightedDate;

              return (
                <DateGroupCard
                  group={item}
                  isHighlighted={isHighlighted}
                  badgeLabel={isHighlighted ? highlightBadgeLabel : null}
                  isPast={status === "past"}
                />
              );
            }}
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
