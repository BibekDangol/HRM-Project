import { useAttendance } from "@/src/hooks/useAttendance";
import { formatTime, getMonthKey, getTodayDate } from "@/src/utils/getDate";
import { TW } from "@/theme/twStyles";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Calendar, Download, FileText } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
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

// ─── Constants ────────────────────────────────────────────────────────────────
// const BRAND = "#1B3A4B";
// const BRAND_LIGHT = "#d6eaf0";
// const BRAND_MUTED = "#7fb6c9";

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
      // ── Android: save directly to Downloads via StorageAccessFramework ──
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
      // ── iOS: write to temp dir then open share/save sheet ──
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
      <Text style={tw`text-xs font-medium ${cfg.text}`}>{cfg.label}</Text>
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

const TableHeader = () => (
  <View
    style={[
      tw`flex-row items-center px-4 py-2.5`,
      { backgroundColor: TW.bgSecondary },
    ]}
  >
    {[
      { label: "Date", flex: 2.5 },
      { label: "Status", flex: 2.2 },
      { label: "In", flex: 1.5 },
      { label: "Out", flex: 1.5 },
      { label: "Hrs", flex: 1, right: true },
    ].map((col) => (
      <Text
        key={col.label}
        style={{
          flex: col.flex,
          color: TW.BRAND_MUTED,
          fontSize: 10,
          letterSpacing: 1.1,
          textTransform: "uppercase",
          fontWeight: "600",
          textAlign: col.right ? "right" : "left",
        }}
      >
        {col.label}
      </Text>
    ))}
  </View>
);

const TableRow = ({
  day,
  records,
  index,
}: {
  day: string;
  records: any[];
  index: number;
}) => {
  const r = records[0];
  if (!r) return null;

  let hours = "—";
  if (r.check_in_time && r.check_out_time) {
    const diff =
      (new Date(r.check_out_time).getTime() -
        new Date(r.check_in_time).getTime()) /
      3600000;
    hours = `${diff.toFixed(1)}h`;
  }

  const checkIn = formatTime(r.check_in_time) || "—";
  const checkOut = formatTime(r.check_out_time) || "—";
  const isDash = (v: string) => v === "—";
  const isEven = index % 2 === 0;

  return (
    <View
      style={[
        tw`flex-row items-center px-4 py-3 border-b border-slate-100`,
        { backgroundColor: isEven ? "#fff" : "#f9fbfc" },
      ]}
    >
      <Text
        style={{
          flex: 2.5,
          fontSize: 12,
          fontWeight: "600",
          color: TW.bgSecondary,
        }}
      >
        {day}
      </Text>
      <View style={{ flex: 2.2 }}>
        <StatusBadge status={r.status ?? "unknown"} />
      </View>
      <Text
        style={[
          { flex: 1.5, fontSize: 12 },
          isDash(checkIn) ? { color: "#c5d4d9" } : { color: "#3d5c68" },
        ]}
      >
        {checkIn}
      </Text>
      <Text
        style={[
          { flex: 1.5, fontSize: 12 },
          isDash(checkOut) ? { color: "#c5d4d9" } : { color: "#3d5c68" },
        ]}
      >
        {checkOut}
      </Text>
      <Text
        style={[
          { flex: 1, fontSize: 12, fontWeight: "600", textAlign: "right" },
          isDash(hours) ? { color: "#c5d4d9" } : { color: TW.bgSecondary },
        ]}
      >
        {hours}
      </Text>
    </View>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const AttendanceView: React.FC<Props> = ({ userId, name }) => {
  const { summary, months, groupedByDate, selectedMonth, setSelectedMonth } =
    useAttendance(userId);

  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const currentMonth = selectedMonth ?? getMonthKey(getTodayDate());
  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ── Filter all records to the selected month ──
  const filteredEntries = Object.entries(groupedByDate).filter(([day]) =>
    day.startsWith(currentMonth),
  );
  const filteredByMonth = Object.fromEntries(filteredEntries);

  // ── Recompute summary for the selected month only ──
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
  const totalDays =
    monthSummary.present + monthSummary.absent + monthSummary.leave;
  const rate =
    totalDays > 0 ? Math.round((monthSummary.present / totalDays) * 100) : 0;

  const entries = filteredEntries;

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

  return (
    <ScrollView
      style={tw`flex-1 bg-white`}
      contentContainerStyle={tw`p-4 pb-14`}
      showsVerticalScrollIndicator={false}
    >
      <BackButton />
      <View
        style={tw`bg-white rounded-2xl overflow-hidden border border-slate-200`}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={[tw`px-5 pt-6 pb-5`, { backgroundColor: TW.bgSecondary }]}>
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
                  <Text style={{ color: TW.BRAND_LIGHT, fontWeight: "500" }}>
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
            {/* <View
              style={[
                tw`w-2 h-2 rounded-full mr-2`,
                { backgroundColor: "#4ade80" },
              ]}
            /> */}
            <Text
              style={{ color: TW.BRAND_LIGHT, fontSize: 13, fontWeight: "600" }}
            >
              {name}
            </Text>
          </View>

          {/* Action buttons */}
          <View style={tw`flex-row gap-2`}>
            <Pressable
              onPress={() => setShowMonthPicker((v) => !v)}
              style={[
                tw`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl`,
                {
                  backgroundColor: showMonthPicker
                    ? "rgba(255,255,255,0.22)"
                    : "rgba(255,255,255,0.1)",
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
                {showMonthPicker ? "Close" : "Change Month"}
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

        {/* ── Month picker ────────────────────────────────────────────────── */}
        {showMonthPicker && (
          <View
            style={[
              tw`flex-row flex-wrap px-4 py-3 border-b border-slate-200`,
              { backgroundColor: "#f0f5f7" },
            ]}
          >
            {months.map((month) => {
              const active = currentMonth === month;
              return (
                <Pressable
                  key={month}
                  onPress={() => {
                    setSelectedMonth(month);
                    setShowMonthPicker(false);
                  }}
                  style={[
                    tw`mr-2 mb-2 px-3 py-1.5 rounded-lg border`,
                    active
                      ? {
                          backgroundColor: TW.bgSecondary,
                          borderColor: TW.bgSecondary,
                        }
                      : { backgroundColor: "#fff", borderColor: "#dde8ed" },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: active ? "#fff" : "#5a7e8e",
                    }}
                  >
                    {month}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── Summary stats ───────────────────────────────────────────────── */}
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
            {/* <StatBox
              value={`${rate}%`}
              label={"Attend-\nance"}
              accent={BRAND}
            /> */}
          </View>
        </View>

        {/* ── Daily log ───────────────────────────────────────────────────── */}
        {/* <View style={tw`px-4 pt-4 pb-5`}>
          <SectionLabel>{`Daily Log — ${currentMonth}`}</SectionLabel>
          <View style={tw`rounded-xl overflow-hidden border border-slate-200`}>
            <TableHeader />
            {entries.length === 0 ? (
              <View style={tw`items-center py-10 bg-white`}>
                <FileText size={28} color="#c5d4d9" />
                <Text style={[tw`text-sm mt-2`, { color: "#94a3b8" }]}>
                  No records for {currentMonth}
                </Text>
              </View>
            ) : (
              entries.map(([day, records], index) => (
                <TableRow key={day} day={day} records={records} index={index} />
              ))
            )}
          </View> */}
        {/* </View> */}
      </View>
    </ScrollView>
  );
};

export default AttendanceView;
