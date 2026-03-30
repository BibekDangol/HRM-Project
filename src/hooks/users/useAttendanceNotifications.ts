import {
  registerForPushNotificationsAsync,
  scheduleAttendanceNotifications,
} from "../../services/users/attendanceNotification.service";
import { useEffect, useState } from "react";

import { getAttendanceRulesService } from "../../services/users/attendance.service";

export function useAttendanceNotifications() {
  const [attendanceRules, setAttendanceRules] = useState<Record<
    string,
    unknown
  > | null>(null);

  useEffect(() => {
    const init = async () => {
      await registerForPushNotificationsAsync();
      const rules = await getAttendanceRulesService();
      setAttendanceRules(rules);
      await scheduleAttendanceNotifications(rules);
    };

    init();
  }, []);

  return { attendanceRules };
}
