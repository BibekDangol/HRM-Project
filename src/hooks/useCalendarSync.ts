import { fetchCalendarWeekendDays } from "@/src/services/calendar-settings.service";
import { getCalendarItems } from "@/src/services/users/calendar.servce";
import { useUsersStore } from "@/src/store/useUsersStore";
import type { CalendarItem } from "@/src/types/Calendar";
import { calendarStore } from "@/src/utils/adminCalendar";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, AppState } from "react-native";

export function useCalendarSync(year: number, month: number) {
  const organizationId = useUsersStore(state => state.currentUserProfile?.organization_id);
  const [refreshing, setRefreshing] = useState(false);
  const refreshRef = useRef<() => Promise<void>>(async () => {});

  useFocusEffect(useCallback(() => {
    let active = true;
    let requestId = 0;
    calendarStore.setOrganization(organizationId ?? null);
    if (organizationId == null) return;

    const refresh = async (showIndicator = false) => {
      const id = ++requestId;
      if (showIndicator) setRefreshing(true);
      const previous = calendarStore.getState();
      const prefix = `${year}-${String(month).padStart(2, "0")}-`;
      try {
        const [weekendDays, { data, error }] = await Promise.all([
          fetchCalendarWeekendDays(organizationId),
          getCalendarItems(organizationId, `${prefix}01`, `${prefix}${new Date(year, month, 0).getDate()}`),
        ]);
        if (error) throw error;
        if (!active || id !== requestId) return;
        // A saved change made during this fetch takes precedence over its older response.
        if (calendarStore.getState().weekendRules === previous.weekendRules) {
          calendarStore.setWeekendDays(weekendDays);
        }
        if (calendarStore.getState().days === previous.days) {
          calendarStore.replaceMonthItems(year, month, (data ?? []) as CalendarItem[]);
        }
      } catch {
        if (active && id === requestId) {
          Alert.alert("Calendar unavailable", "Could not refresh weekends and holidays. Pull down on the calendar page to try again.");
        }
      } finally {
        if (active && id === requestId) setRefreshing(false);
      }
    };

    refreshRef.current = () => refresh(true);
    void refresh();
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") void refresh();
    });
    return () => {
      active = false;
      refreshRef.current = async () => {};
      setRefreshing(false);
      subscription.remove();
    };
  }, [organizationId, year, month]));

  return { refreshing, refresh: () => refreshRef.current() };
}
