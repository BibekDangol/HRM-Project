import { useAttendance } from "@/src/hooks/useAttendance";
import { formatTime, getMonthKey, getTodayDate } from "@/src/utils/getDate";
import { MAX_YEAR, MIN_YEAR, MONTHS } from "@/src/utils/userDashboard";
import { TW } from "@/theme/twStyles";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Calendar, Download } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import tw from "twrnc";
import { BackButton } from "../BackButton";

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
    dot: "#16704c",
  },
  absent: {
    label: "Absent",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "#b33030",
  },
  on_leave: {
    label: "Leave",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "#b56b00",
  },
  late: {
    label: "Late",
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "#c2580a",
  },
  holiday: {
    label: "Holiday",
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "#94a3b8",
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
const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "#94a3b8",
  };
  return (
    <View
      style={tw`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${cfg.bg}`}
    >
      <View
        style={[tw`w-1.5 h-1.5 rounded-full`, { backgroundColor: cfg.dot }]}
      />
      <Text style={tw`text-sm font-medium ${cfg.text}`}>{cfg.label}</Text>
    </View>
  );
};

const SectionLabel = ({ children }: { children: string }) => (
  <View style={tw`flex-row items-center gap-2 mb-4`}>
    <Text
      style={[
        tw`text-xs uppercase tracking-widest`,
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
    <Text style={[tw`text-2xl font-bold mb-0.5`, { color: accent }]}>
      {value}
    </Text>
    <Text
      style={{
        fontSize: 10,
        textAlign: "center",
        color: accent + "bb",
        letterSpacing: 0.4,
        textTransform: "uppercase",
        lineHeight: 14,
      }}
    >
      {label}
    </Text>
  </View>
);

// ─── Main component ───────────────────────────────────────────────────────────
const AttendanceView: React.FC<Props> = ({ userId, name }) => {
  const { summary, groupedByDate, selectedMonth, setSelectedMonth } =
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

  const monthSummary = filteredEntries.reduce(
    (acc, [, records]) => {
      const status = records[0]?.status ?? "";
      if (status === "present" || status === "late") acc.present += 1;
      else if (status === "absent") acc.absent += 1;
      else if (status === "on_leave") acc.leave += 1;
      return acc;
    },
    { present: 0, absent: 0, leave: 0 },
  );

  const handleDownload = () => {
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
    <View style={tw`flex-1 bg-white`}>
      {/* ── Floating back button ── */}
      <View style={tw`absolute top-4 left-4 z-50`}>
        <BackButton />
      </View>

      <ScrollView
        style={tw`flex-1 bg-white`}
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
                      tw`text-xs mb-1`,
                      { color: TW.BRAND_MUTED, letterSpacing: 1.2 },
                    ]}
                  >
                    ATTENDANCE REPORT
                  </Text>
                  <Text style={[tw`text-2xl font-bold`, { color: "#fff" }]}>
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
                      style={[tw`text-xs mb-0.5`, { color: TW.BRAND_MUTED }]}
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
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.15)",
                  },
                ]}
              >
                <Text
                  style={{
                    color: TW.BRAND_LIGHT,
                    fontSize: 13,
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
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.18)",
                    },
                  ]}
                >
                  <Calendar size={13} color={TW.BRAND_LIGHT} />
                  <Text
                    style={{
                      color: TW.BRAND_LIGHT,
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  >
                    Change Month
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleDownload}
                  style={[
                    tw`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl`,
                    {
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.18)",
                    },
                  ]}
                >
                  <Download size={13} color={TW.BRAND_LIGHT} />
                  <Text
                    style={{
                      color: TW.BRAND_LIGHT,
                      fontSize: 12,
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
                  value={monthSummary.present}
                  label={"Days\nPresent"}
                  accent="#16704c"
                />
                <StatBox
                  value={monthSummary.absent}
                  label={"Days\nAbsent"}
                  accent="#b33030"
                />
                <StatBox
                  value={monthSummary.leave}
                  label={"On\nLeave"}
                  accent="#b56b00"
                />
              </View>
            </View>
          </View>
        </View>

        {/* ── Month Picker Modal ───────────────────────────────────────────── */}
        <Modal
          visible={showMonthPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMonthPicker(false)}
        >
          <Pressable
            style={tw`flex-1 bg-black/50 justify-end`}
            onPress={() => setShowMonthPicker(false)}
          >
            <Pressable
              style={[
                tw`rounded-t-3xl px-5 pt-3 pb-8`,
                { backgroundColor: "#ffffff" },
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
                    { borderColor: "#e2e8f0", backgroundColor: "#fff" },
                    (!canDecYear || pressed) && { opacity: 0.4 },
                  ]}
                >
                  <Text style={[tw`font-bold text-base`, { color: "#1F2937" }]}>
                    ‹
                  </Text>
                </Pressable>

                <Text
                  style={[
                    tw`text-lg font-bold w-16 text-center`,
                    { color: "#1F2937" },
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
                    { borderColor: "#e2e8f0", backgroundColor: "#fff" },
                    (!canIncYear || pressed) && { opacity: 0.4 },
                  ]}
                >
                  <Text style={[tw`font-bold text-base`, { color: "#1F2937" }]}>
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
                                backgroundColor: "#FFFBEB",
                                borderWidth: 1.5,
                                borderColor: "#FFC107",
                              }
                            : isFuture
                              ? { backgroundColor: "#F9FAFB" }
                              : { backgroundColor: "#F3F4F6" },
                        pressed && !isFuture && { opacity: 0.8 },
                      ]}
                    >
                      <Text
                        style={[
                          tw`text-sm font-semibold text-center`,
                          isActive
                            ? { color: "#ffffff" }
                            : isFuture
                              ? { color: "#CBD5E1" }
                              : { color: "#1F2937" },
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
                <Text style={[tw`font-bold text-base`, { color: "#ffffff" }]}>
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
