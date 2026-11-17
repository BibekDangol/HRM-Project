import { Leave } from "@/src/services/leave.service";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import tw from "@/theme/tw";

export type LeaveDetailCardProps = {
  leave: Leave;
  status?: "approved" | "rejected" | "pending";
};

const STATUS_CONFIG = {
  approved: {
    title: "Leave Approved",
    subtitle: "This leave request has been approved",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    badgeText: "APPROVED",
    auditLabel: "Approved By",
  },
  rejected: {
    title: "Leave Rejected",
    subtitle: "This leave request has been rejected",
    textColor: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeText: "REJECTED",
    auditLabel: "Rejected By",
  },
  pending: {
    title: "Leave Pending",
    subtitle: "This leave request is awaiting review",
    textColor: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    badgeText: "PENDING",
    auditLabel: "Reviewed By",
  },
};

export function LeaveDetailCard({ leave, status }: LeaveDetailCardProps) {
  const effectiveStatus = (status ?? leave.status ?? "pending").toLowerCase() as
    | "approved"
    | "rejected"
    | "pending";

  const cfg = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.pending;

  const leaveDuration =
    leave.days_count < 1
      ? `Half Day (${leave.day_type ?? "HALF"})`
      : `${leave.days_count} ${leave.days_count === 1 ? "Day" : "Days"}`;

  const leaveTypeName =
    leave.leave_type_name || leave.leave_types?.name || "Leave";

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={tw`flex-1 bg-canvas`}
      contentContainerStyle={tw`p-4 pb-12`}
    >
      <View style={tw`bg-white rounded-2xl p-5 shadow-sm border border-slate-100`}>
        {/* Header Banner */}
        <View style={tw`mb-5 pb-4 border-b border-slate-100`}>
          <View style={tw`flex-row items-center justify-between mb-1`}>
            <Text style={tw`text-lg font-bold text-slate-900`}>{cfg.title}</Text>
            <View
              style={tw`px-3 py-1 rounded-full ${cfg.bgColor} border ${cfg.borderColor}`}
            >
              <Text style={tw`text-xs font-bold ${cfg.textColor}`}>
                {cfg.badgeText}
              </Text>
            </View>
          </View>
          <Text style={tw`text-xs ${cfg.textColor} font-medium`}>
            {cfg.subtitle}
          </Text>
        </View>

        {/* Employee Info */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1`}>
            Employee Name
          </Text>
          <Text style={tw`text-slate-900 text-base font-semibold`}>
            {leave.first_name} {leave.last_name}
          </Text>
        </View>

        {/* Leave Type */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1`}>
            Leave Type
          </Text>
          <Text style={tw`text-slate-800 text-sm font-medium`}>
            {leaveTypeName}
          </Text>
        </View>

        {/* Dates */}
        <View style={tw`flex-row justify-between mb-4`}>
          <View style={tw`flex-1 pr-2`}>
            <Text style={tw`text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1`}>
              Start Date
            </Text>
            <Text style={tw`text-slate-800 text-sm font-medium`}>
              {leave.start_date || "N/A"}
            </Text>
          </View>
          <View style={tw`flex-1 pl-2`}>
            <Text style={tw`text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1`}>
              End Date
            </Text>
            <Text style={tw`text-slate-800 text-sm font-medium`}>
              {leave.end_date || "N/A"}
            </Text>
          </View>
        </View>

        {/* Duration */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1`}>
            Duration
          </Text>
          <Text style={tw`text-slate-800 text-sm font-medium`}>
            {leaveDuration}
          </Text>
        </View>

        {/* Reason */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1`}>
            Reason
          </Text>
          <Text style={tw`text-slate-700 text-sm`}>
            {leave.reason || "N/A"}
          </Text>
        </View>

        {/* Status & Review Audit */}
        <View style={tw`border-t border-slate-100 pt-4 mt-2`}>
          <Text style={tw`text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1`}>
            Status
          </Text>
          <Text style={tw`text-sm font-bold ${cfg.textColor} mb-3`}>
            {cfg.badgeText}
          </Text>

          {effectiveStatus !== "pending" && (
            <>
              <Text style={tw`text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1`}>
                {cfg.auditLabel}
              </Text>
              <Text style={tw`text-slate-800 text-sm font-medium`}>
                {leave.action_taken_by_name || "N/A"}
              </Text>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

export default LeaveDetailCard;
