import { useCallback, useEffect, useState } from "react";
import { DailyAttendanceStatsRow } from "@/src/types/dailyAttendanceStats";
import {
  getDailyAttendanceStatsService,
  getLatestDailyAttendanceStatsService,
  getDailyAttendanceStatsByDateService,
  getOrganizationDailyAttendanceSummaryService,
} from "@/src/services/users/dailyAttendanceStats.service";

type MonthlySummary = {
  total_employees: number;
  total_present: number;
  total_absent: number;
  total_on_leave: number;
  total_incomplete: number;
  total_leave_days: number;
  days_with_data: number;
};

export function useDailyAttendanceStats(
  organizationId: number | undefined,
  startDate?: string,
  endDate?: string,
) {
  const [stats, setStats] = useState<DailyAttendanceStatsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!organizationId || !startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getDailyAttendanceStatsService(organizationId, startDate, endDate);
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch daily attendance stats");
    } finally {
      setLoading(false);
    }
  }, [organizationId, startDate, endDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Start the loading indicator for this external data fetch.
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useLatestDailyAttendanceStats(
  organizationId: number | undefined,
  limit = 30,
) {
  const [stats, setStats] = useState<DailyAttendanceStatsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getLatestDailyAttendanceStatsService(organizationId, limit);
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch latest daily attendance stats");
    } finally {
      setLoading(false);
    }
  }, [organizationId, limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Start the loading indicator for this external data fetch.
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useDailyAttendanceStatsByDate(
  organizationId: number | undefined,
  statDate?: string,
) {
  const [stat, setStat] = useState<DailyAttendanceStatsRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStat = useCallback(async () => {
    if (!organizationId || !statDate) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getDailyAttendanceStatsByDateService(organizationId, statDate);
      setStat(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch daily attendance stat");
    } finally {
      setLoading(false);
    }
  }, [organizationId, statDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Start the loading indicator for this external data fetch.
    fetchStat();
  }, [fetchStat]);

  return { stat, loading, error, refetch: fetchStat };
}

export function useOrganizationDailyAttendanceSummary(
  organizationId: number | undefined,
  year?: number,
  month?: number,
) {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!organizationId || year == null || month == null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getOrganizationDailyAttendanceSummaryService(organizationId, year, month);
      setSummary(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch monthly attendance summary");
    } finally {
      setLoading(false);
    }
  }, [organizationId, year, month]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Start the loading indicator for this external data fetch.
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}
