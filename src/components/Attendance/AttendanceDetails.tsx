import { fontSizes, lineHeights } from "@/theme/typography";
import { colors } from "@/theme/colors";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { formatTime, getMonthKey, getTodayDate } from "@/src/utils/getDate";
import { MAX_YEAR, MIN_YEAR, MONTHS } from "@/src/utils/userDashboard";
import { Calendar, Download } from "lucide-react-native";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useAttendance } from "@/src/hooks/supervisor/useAttendanceDetails";
import { useAttendanceStats } from "@/src/hooks/users/useAttendanceStats";
import { TW } from "@/theme/twStyles";
import { useState } from "react";
import tw from "@/theme/tw";

type Props = {
  userId: string;
  name: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  manager?: string;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  present: {
    label: "Present",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: colors.successText,
  },
  absent: {
    label: "Absent",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: colors.dangerText,
  },
  on_leave: {
    label: "Leave",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: colors.warningText,
  },
  late: {
    label: "Late",
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: colors.orangeText,
  },
  holiday: {
    label: "Holiday",
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: colors.subtle,
  },
};

// ─── CSV helpers ──────────────────────────────────────────────────────────────
const escapeCSV = (val: string | number | null | undefined) => {
  const str = val === null || val === undefined ? "" : String(val);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const buildCSV = (
  name: string,
  month: string,
  groupedByDate: Record<string, any[]>,
  summary: { present: number; absent: number; leave: number },
): string => {
  const lines: string[] = [];

  lines.push(`Employee,${escapeCSV(name)}`);
  lines.push(`Period,${escapeCSV(month)}`);
  lines.push(
    `Generated,${new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`,
  );
  lines.push("");
  lines.push("Summary");
  lines.push(`Days Present,${summary.present}`);
  lines.push(`Days Absent,${summary.absent}`);
  lines.push(`On Leave,${summary.leave}`);
  const totalDays = summary.present + summary.absent + summary.leave;
  const rate =
    totalDays > 0 ? Math.round((summary.present / totalDays) * 100) : 0;
  lines.push(`Attendance Rate,${rate}%`);
  lines.push("");
  lines.push("Date,Status,Check In,Check Out,Hours");

  for (const [day, records] of Object.entries(groupedByDate)) {
    const r = records[0];
    if (!r) continue;
    const status = STATUS_CONFIG[r.status]?.label ?? r.status ?? "";
    const checkIn = formatTime(r.check_in_time) || "";
    const checkOut = formatTime(r.check_out_time) || "";
    let hours = "";
    if (r.check_in_time && r.check_out_time) {
      const diff =
        (new Date(r.check_out_time).getTime() -
          new Date(r.check_in_time).getTime()) /
        3600000;
      hours = `${diff.toFixed(1)}h`;
    }
    lines.push(
      [day, status, checkIn, checkOut, hours].map(escapeCSV).join(","),
    );
  }

  return lines.join("\n");
};

const exportCSV = async (csvString: string, filename: string) => {
  try {
    if (Platform.OS === "android") {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert(
          "Permission denied",
          "Storage access is required to save the file.",
        );
        return;
      }
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename,
        "text/csv",
      );
      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      Alert.alert(
        "Saved!",
        `${filename} has been saved to your selected folder.`,
      );
    } else {
      const tempUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(tempUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(tempUri, {
          mimeType: "text/csv",
          dialogTitle: "Save Attendance Report",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        Alert.alert(
          "Sharing not available",
          "Cannot save files on this device.",
        );
      }
    }
  } catch (err) {
    Alert.alert("Export failed", "Something went wrong while exporting.");
    console.error(err);
  }
};

// ─── Sub-components ───────────────────────────────────────────────────────────
// const StatusBadge = ({ status }: { status: string }) => {
//   const cfg = STATUS_CONFIG[status] ?? {
//     label: status,
//     bg: "bg-slate-100",
//     text: "text-slate-500",
//     dot: colors.subtle,
//   };
//   return (
//     <View
//       style={tw`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${cfg.bg}`}
//     >
//       <View
//         style={[tw`w-1.5 h-1.5 rounded-full`, { backgroundColor: cfg.dot }]}
//       />
//       <Text style={tw`text-description font-medium ${cfg.text}`}>{cfg.label}</Text>
//     </View>
//   );
// };

const SectionLabel = ({ children }: { children: string }) => (
  <View style={tw`flex-row items-center gap-2 mb-4`}>
    <Text
      style={[
        tw`text-caption uppercase tracking-widest`,
        { color: TW.BRAND_MUTED, letterSpacing: 1.5 },
      ]}
    >
      {children}
    </Text>
    <View style={tw`flex-1 h-px bg-slate-200`} />
  </View>
);

const StatBox = ({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent: string;
}) => (
  <View
    style={[
      tw`flex-1 mx-1 rounded-xl p-3 items-center`,
      {
        backgroundColor: accent + "12",
        borderWidth: 1,
        borderColor: accent + "28",
      },
    ]}
  >
    <Text style={[tw`text-page font-bold mb-0.5`, { color: accent }]}>
      {value}
    </Text>
    <Text
      style={{
        fontSize: fontSizes.caption,
        textAlign: "center",
        color: accent + "bb",
        letterSpacing: 0.4,
        textTransform: "uppercase",
        lineHeight: lineHeights.caption,
      }}
    >
      {label}
    </Text>
  </View>
);

// ─── Main component ───────────────────────────────────────────────────────────
const AttendanceView: React.FC<Props> = ({ userId, name }) => {
  const {  groupedByDate, selectedMonth, setSelectedMonth } =
    useAttendance(userId);

  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const now = new Date();
  const [pickerYear, setPickerYear] = useState(
    Math.min(now.getFullYear(), MAX_YEAR),
  );

  const currentMonth = selectedMonth ?? getMonthKey(getTodayDate());
  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const filteredEntries = Object.entries(groupedByDate).filter(([day]) =>
    day.startsWith(currentMonth),
  );
  const filteredByMonth = Object.fromEntries(filteredEntries);

  const [summaryYear, summaryMonth] = currentMonth.split("-").map(Number);
  const { stats: attendanceSummary, loading: summaryLoading } = useAttendanceStats(userId, summaryYear, summaryMonth - 1);
  const monthSummary = { present: attendanceSummary.present, absent: attendanceSummary.absent, leave: attendanceSummary.leaveTaken };

  const handleDownload = () => {
    if (summaryLoading) return;
    const csvString = buildCSV(
      name,
      currentMonth,
      filteredByMonth,
      monthSummary,
    );
    const filename = `attendance_${name.replace(/\s+/g, "_")}_${currentMonth}.csv`;
    exportCSV(csvString, filename);
  };

  const canIncYear = pickerYear < MAX_YEAR;
  const canDecYear = pickerYear > MIN_YEAR;

  return (
    <View style={tw`flex-1 bg-canvas`}>

      <ScrollView
        style={tw`flex-1 bg-canvas`}
        contentContainerStyle={tw`p-4 pb-14`}
        showsVerticalScrollIndicator={false}
      >
        {/* Top padding so content clears the floating button */}
        <View style={tw`pt-12`}>
          <View
            style={tw`bg-white rounded-2xl overflow-hidden border border-slate-200`}
          >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <View
              style={[tw`px-5 pt-6 pb-5`, { backgroundColor: TW.bgSecondary }]}
            >
              {/* Title + meta */}
              <View style={tw`flex-row justify-between items-start mb-4`}>
                <View style={tw`flex-1 pr-4`}>
                  <Text
                    style={[
                      tw`text-caption mb-1`,
                      { color: colors.onPrimarySoft, letterSpacing: 1.2 },
                    ]}
                  >
                    ATTENDANCE REPORT
                  </Text>
                  <Text style={[tw`text-page font-bold`, { color: colors.surface }]}>
                    {currentMonth}
                  </Text>
                </View>
                <View style={tw`items-end`}>
                  {[
                    ["Generated", reportDate],
                    ["Status", "Final"],
                  ].map(([lbl, val]) => (
                    <Text
                      key={lbl}
                      style={[tw`text-caption mb-0.5`, { color: colors.onPrimarySoft }]}
                    >
                      {lbl}:{" "}
                      <Text
                        style={{ color: TW.BRAND_LIGHT, fontWeight: "500" }}
                      >
                        {val}
                      </Text>
                    </Text>
                  ))}
                </View>
              </View>

              {/* Employee pill */}
              <View
                style={[
                  tw`self-start flex-row items-center px-3 py-1.5 rounded-full mb-5`,
                  {
                    backgroundColor: colors.onPrimaryWash,
                    borderWidth: 1,
                    borderColor: colors.onPrimaryWashMedium,
                  },
                ]}
              >
                <Text
                  style={{
                    color: TW.BRAND_LIGHT,
                    fontSize: fontSizes.caption, lineHeight: lineHeights.caption,
                    fontWeight: "600",
                  }}
                >
                  {name}
                </Text>
              </View>

              {/* Action buttons */}
              <View style={tw`flex-row gap-2`}>
                <Pressable
                  onPress={() => setShowMonthPicker(true)}
                  style={[
                    tw`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl`,
                    {
                      backgroundColor: colors.onPrimaryWash,
                      borderWidth: 1,
                      borderColor: colors.onPrimaryBorderSoft,
                    },
                  ]}
                >
                  <Calendar size={13} color={TW.BRAND_LIGHT} />
                  <Text
                    style={{
                      color: TW.BRAND_LIGHT,
                      fontSize: fontSizes.caption, lineHeight: lineHeights.caption,
                      fontWeight: "500",
                    }}
                  >
                    Change Month
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleDownload}
                  disabled={summaryLoading}
                  style={[
                    tw`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl`,
                    {
                      backgroundColor: colors.onPrimaryWash,
                      borderWidth: 1,
                      borderColor: colors.onPrimaryBorderSoft,
                    },
                  ]}
                >
                  <Download size={13} color={TW.BRAND_LIGHT} />
                  <Text
                    style={{
                      color: TW.BRAND_LIGHT,
                      fontSize: fontSizes.caption, lineHeight: lineHeights.caption,
                      fontWeight: "500",
                    }}
                  >
                    Export CSV
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* ── Summary stats ───────────────────────────────────────────── */}
            <View style={tw`px-4 pt-5 pb-2`}>
              <SectionLabel>Summary</SectionLabel>
              <View style={tw`flex-row -mx-1 mb-2`}>
                <StatBox
                  value={summaryLoading ? "—" : monthSummary.present}
                  label={"Days\nPresent"}
                  accent={colors.successText}
                />
                <StatBox
                  value={summaryLoading ? "—" : monthSummary.absent}
                  label={"Days\nAbsent"}
                  accent={colors.dangerText}
                />
                <StatBox
                  value={summaryLoading ? "—" : monthSummary.leave}
                  label={"On\nLeave"}
                  accent={colors.warningText}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ── Month Picker Modal ───────────────────────────────────────────── */}
        <Modal
          visible={showMonthPicker}
          transparent
          animationType="none"
          onRequestClose={() => setShowMonthPicker(false)}
        >
          <Pressable
            style={tw`flex-1 bg-black/50 justify-end`}
            onPress={() => setShowMonthPicker(false)}
          >
            <Pressable
              style={[
                tw`rounded-t-3xl px-5 pt-3 pb-8`,
                { backgroundColor: colors.surface },
              ]}
              onPress={() => {}}
            >
              {/* Handle */}
              <View style={tw`items-center mb-4`}>
                <View
                  style={[
                    tw`h-1 w-10 rounded-full`,
                    { backgroundColor: TW.bgSecondary },
                  ]}
                />
              </View>

              {/* Year stepper */}
              <View style={tw`flex-row items-center justify-center gap-5 mb-5`}>
                <Pressable
                  disabled={!canDecYear}
                  onPress={() =>
                    setPickerYear((y) => Math.max(MIN_YEAR, y - 1))
                  }
                  style={({ pressed }) => [
                    tw`h-9 w-9 rounded-full items-center justify-center border`,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    (!canDecYear || pressed) && { opacity: 0.4 },
                  ]}
                >
                  <Text style={[tw`font-bold text-body`, { color: colors.ink }]}>
                    ‹
                  </Text>
                </Pressable>

                <Text
                  style={[
                    tw`text-section font-bold w-16 text-center`,
                    { color: colors.ink },
                  ]}
                >
                  {pickerYear}
                </Text>

                <Pressable
                  disabled={!canIncYear}
                  onPress={() =>
                    setPickerYear((y) => Math.min(MAX_YEAR, y + 1))
                  }
                  style={({ pressed }) => [
                    tw`h-9 w-9 rounded-full items-center justify-center border`,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    (!canIncYear || pressed) && { opacity: 0.4 },
                  ]}
                >
                  <Text style={[tw`font-bold text-body`, { color: colors.ink }]}>
                    ›
                  </Text>
                </Pressable>
              </View>

              {/* 3-col month grid */}
              <View style={tw`flex-row flex-wrap gap-2 mb-5`}>
                {MONTHS.map((m, idx) => {
                  const currentYear = now.getFullYear();
                  const currentMonthIdx = now.getMonth();

                  const isFuture =
                    pickerYear === currentYear && idx > currentMonthIdx;

                  const monthKey = `${pickerYear}-${String(idx + 1).padStart(2, "0")}`;
                  const isActive = currentMonth === monthKey && !isFuture;

                  const isCurrent =
                    idx === currentMonthIdx && pickerYear === currentYear;

                  return (
                    <Pressable
                      key={m}
                      disabled={isFuture}
                      onPress={() => {
                        setSelectedMonth(monthKey);
                        setShowMonthPicker(false);
                      }}
                      style={({ pressed }) => [
                        tw`py-3 rounded-2xl items-center justify-center`,
                        { width: "31%" },
                        isActive
                          ? { backgroundColor: TW.bgSecondary }
                          : isCurrent
                            ? {
                                backgroundColor: colors.warningSoft,
                                borderWidth: 1.5,
                                borderColor: colors.accent,
                              }
                            : isFuture
                              ? { backgroundColor: colors.canvas }
                              : { backgroundColor: colors.surfaceMuted },
                        pressed && !isFuture && { opacity: 0.8 },
                      ]}
                    >
                      <Text
                        style={[
                          tw`text-description font-semibold text-center`,
                          isActive
                            ? { color: colors.surface }
                            : isFuture
                              ? { color: colors.borderStrong }
                              : { color: colors.ink },
                        ]}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Done */}
              <Pressable
                onPress={() => setShowMonthPicker(false)}
                style={({ pressed }) => [
                  tw`py-4 rounded-full items-center`,
                  { backgroundColor: TW.bgSecondary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[tw`font-bold text-body`, { color: colors.surface }]}>
                  Done
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default AttendanceView;
