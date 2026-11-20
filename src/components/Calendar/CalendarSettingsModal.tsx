import { DAY_OPTIONS } from "@/src/constants/adminCalendar";
import { fetchCalendarWeekendDays, saveCalendarWeekendDays } from "@/src/services/calendar-settings.service";
import { useUsersStore } from "@/src/store/useUsersStore";
import { calendarStore } from "@/src/utils/adminCalendar";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import AppButton from "../ui/AppButton";
import ModalShell from "../ui/ModalShell";

export default function CalendarSettingsModal({ organizationId, onClose }: {
  organizationId: number;
  onClose: () => void;
}) {
  const [days, setDays] = useState<number[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchCalendarWeekendDays(organizationId)
      .then(value => { if (active) setDays(value); })
      .catch(() => {
        if (active) setError("Could not load weekend settings. Close this window and try again.");
      });
    return () => { active = false; };
  }, [organizationId]);

  const save = async () => {
    if (!days) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await saveCalendarWeekendDays(organizationId, days);
      if (useUsersStore.getState().currentUserProfile?.organization_id === organizationId) {
        calendarStore.setOrganization(organizationId);
        calendarStore.setWeekendDays(saved);
      }
      onClose();
    } catch {
      setError("Could not save weekend days. Your changes are still here. Try saving again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      visible
      title="Weekend days"
      subtitle="Choose recurring days off for calendars, attendance and leave calculations."
      onClose={onClose}
      showCloseButton
      closeDisabled={saving}
      scrollable
      loading={days === null && !error}
      loadingMessage="Loading weekend days…"
      footer={<AppButton title="Save weekend days" fullWidth onPress={save} loading={saving} disabled={days === null} />}
    >
      <Text style={{ ...typography.description, marginBottom: 12 }}>
        Saving also updates existing leave durations and attendance summaries.
      </Text>
      {error && <Text accessibilityRole="alert" style={{ ...typography.description, color: colors.dangerText, marginBottom: 12 }}>{error}</Text>}
      {days !== null && DAY_OPTIONS.map((day, index) => (
        <View key={day.key} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 48 }}>
          <Text style={typography.body}>{day.full}</Text>
          <Switch
            accessibilityLabel={`${day.full} is a weekend day`}
            value={days.includes(index)}
            disabled={saving}
            trackColor={{ false: colors.borderStrong, true: colors.primary }}
            onValueChange={enabled => setDays(current => enabled ? [...(current ?? []), index] : (current ?? []).filter(value => value !== index))}
          />
        </View>
      ))}
    </ModalShell>
  );
}
