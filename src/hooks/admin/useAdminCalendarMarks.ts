import { colors } from "@/theme/colors";
import { buildAdminMarks, useCalendarStore } from "@/src/utils/adminCalendar";

import { formatDateKey } from "@/src/utils/getDate";
import { useMemo } from "react";

export default function useAdminCalendarMarks(
  year: number,
  month: number,
  rangeStart: string | null,
  rangeEnd: string | null,
) {
  const store = useCalendarStore();

  return useMemo(() => {
    const base = { ...buildAdminMarks(year, month) };

    if (rangeStart) {
      const end = rangeEnd ?? rangeStart;

      let cursor = new Date(rangeStart);
      const endDate = new Date(end);

      while (cursor <= endDate) {
        const key = formatDateKey(cursor);

        base[key] = {
          ...(base[key] ?? {}),
          color: store.colors.publicHoliday,
          textColor: colors.surface,
          startingDay: key === rangeStart,
          endingDay: key === end,
        };

        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return base;
  }, [year, month, rangeStart, rangeEnd, store.colors.publicHoliday]);
}
