import { LeaveTypeRow, LeaveTypeWithStats } from "@/src/types/userLeave";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import tw from "twrnc";

export function LeaveTypeDropdown({
  value,
  onChange,
  types,
  loading,
  onRefresh,
  showStats = true, // Add this prop
}: {
  value: number | null;
  onChange: (v: number) => void;
  types: LeaveTypeRow[] | LeaveTypeWithStats[]; // Accept both types
  loading: boolean;
  onRefresh: () => Promise<void> | void;
  showStats?: boolean; // Optional prop to show/hide stats
}) {
  const [open, setOpen] = useState(false);

  const currentLabel = useMemo(() => {
    if (value == null) return "Select Leave Type";
    return types.find((t) => t.id === value)?.name ?? "Select Leave Type";
  }, [value, types]);

  // Type guard to check if item has stats
  const hasStats = (item: LeaveTypeRow | LeaveTypeWithStats): item is LeaveTypeWithStats => {
    return 'approvedUsed' in item;
  };

  return (
    <View>
      <View style={tw`flex-row items-center justify-between`}>
        <Text style={tw`text-slate-800 font-semibold`}>Leave Type</Text>
      </View>

      <Pressable
        onPress={async () => {
          if (loading) return;
          await onRefresh();
          setOpen((v) => !v);
        }}
        style={({ pressed }) => [
          tw`mt-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white`,
          pressed && tw`opacity-85`,
          loading && tw`opacity-60`,
        ]}
      >
        <Text
          style={tw`${value != null ? "text-slate-900" : "text-slate-400"} font-semibold`}
        >
          {loading ? "Loading leave types..." : currentLabel}
        </Text>
      </Pressable>

      {open && !loading && (
        <View
          style={tw`mt-2 rounded-2xl border border-slate-200 overflow-hidden`}
        >
          {types.length === 0 ? (
            <View style={tw`px-4 py-3 bg-white`}>
              <Text style={tw`text-slate-500`}>No leave types found.</Text>
            </View>
          ) : (
            types.map((t, idx) => (
              <Pressable
                key={t.id}
                onPress={() => {
                  onChange(t.id);
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  tw`px-4 py-3 bg-white flex-row items-center justify-between`,
                  idx !== types.length - 1 && tw`border-b border-slate-100`,
                  pressed && tw`bg-slate-50`,
                ]}
              >
                <View style={tw`flex-1 pr-3`}>
                  <Text style={tw`text-slate-900 font-semibold`}>
                    {t.name ?? "Unnamed"}
                  </Text>
                </View>

                {showStats && hasStats(t) && (
                  <View style={tw`items-end`}>
                    <Text style={tw`text-slate-700 font-semibold`}>
                      {t.approvedUsed}/{t.leave_limit} approved
                    </Text>
                    <Text style={tw`text-slate-500 text-xs`}>
                      pending {t.pending} • left {t.remaining}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}