import { colors } from "@/theme/colors";
import {
  LabelValue,
  StatusConfigValue,
} from "@/src/components/Leave/leaveDetailsShared";
import { Leave, LeaveStatus } from "@/src/services/leave.service";
import { CheckCircle, XCircle } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";

import { TW } from "@/theme/twStyles";
import React from "react";
import tw from "@/theme/tw";

interface Props {
  leave: Leave;
  cfg: StatusConfigValue;
  remainingDays: number | null;
  usedDays: number | null;
  showActions?: boolean;
  handleStatusChange?: (status: LeaveStatus) => Promise<void> | void;
}

const PendingLeaveView = ({
  leave,
  cfg,
  remainingDays,
  usedDays,
  showActions = false,
  handleStatusChange,
}: Props) => {
  console.log(
    "showActions",
    showActions,
    "handlestatuschange",
    handleStatusChange,
  );

  return (
    <View style={tw`flex-1 bg-canvas`}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`${showActions ? "pb-32" : "pb-10"}`}>
        <View
          style={tw`mx-5 mt-5 rounded-3xl bg-slate-50 border border-slate-100 px-5 py-6 items-center`}>
          <Text style={tw`text-section font-bold text-slate-900`}>
            {leave.first_name} {leave.last_name}
          </Text>

          <Text style={tw`text-description text-slate-400 mt-0.5`}>
            {leave.leave_type_name ?? "Leave Request"}
          </Text>

          <View
            style={[
              tw`mt-3 px-4 py-1.5 rounded-full`,
              { backgroundColor: cfg.bg },
            ]}>
            <Text style={[tw`text-caption font-bold`, { color: cfg.text }]}>
              {cfg.label}
            </Text>
          </View>

          <View style={tw`mt-4 flex-row gap-4`}>
            <View style={tw`items-center`}>
              <Text style={tw`text-section font-bold text-slate-900`}>
                {leave.days_count ?? 0}
              </Text>
              <Text style={tw`text-caption text-slate-400`}>Days</Text>
            </View>

            {remainingDays !== null && (
              <>
                <View style={tw`w-px bg-slate-200`} />
                <View style={tw`items-center`}>
                  <Text
                    style={[
                      tw`text-section font-bold`,
                      remainingDays <= 0
                        ? tw`text-red-500`
                        : tw`text-emerald-600`,
                    ]}>
                    {remainingDays}
                  </Text>
                  <Text style={tw`text-caption text-slate-400`}>Remaining</Text>
                </View>
              </>
            )}

            <View style={tw`w-px bg-slate-200`} />
            <View style={tw`items-center`}>
              <Text style={tw`text-section font-bold text-slate-900`}>
                {leave.leave_limit}
              </Text>
              <Text style={tw`text-caption text-slate-400`}>Limit</Text>
            </View>
          </View>
        </View>
        <View style={tw`px-5 mt-6 border-t border-slate-100`}>
          <Text
            style={tw`text-caption font-bold text-slate-400 uppercase tracking-wider mb-2`}>
            Details
          </Text>

          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`flex-1 border-b border-slate-100`}>
              <LabelValue
                label="Start Date"
                value={leave.start_date ?? "N/A"}
              />
            </View>
            <View style={tw`flex-1 border-b border-slate-100`}>
              <LabelValue label="End Date" value={leave.end_date ?? "N/A"} />
            </View>
          </View>

          <View style={tw`border-b border-slate-100`}>
            <LabelValue
              label="Duration"
              value={`${leave.days_count ?? 0} days`}
            />
          </View>

          <View style={tw`border-b border-slate-100`}>
            <LabelValue label="Reason" value={leave.reason ?? "N/A"} />
          </View>
        </View>
        {usedDays !== null && remainingDays !== null && (
          <View style={tw`px-5 mt-6`}>
            <Text
              style={tw`text-caption font-bold text-slate-400 uppercase tracking-wider mb-2`}>
              Leave Balance
            </Text>

            <View style={tw`flex-row justify-between items-center`}>
              <View style={tw`flex-1 border-b border-slate-100`}>
                <LabelValue
                  label="Used"
                  value={`${usedDays} days`}
                  valueStyle={{ color: colors.danger }}
                />
              </View>
              <View style={tw`flex-1 border-b border-slate-100`}>
                <LabelValue
                  label="Limit"
                  value={`${leave.leave_limit} days`}
                  valueStyle={{ color: colors.ink }}
                />
              </View>
            </View>

            <View style={tw`flex-row`}>
              <View style={tw`flex-1 pr-2 border-b border-slate-100`}>
                <LabelValue
                  label="Remaining"
                  value={`${remainingDays} days`}
                  valueStyle={{
                    color: remainingDays <= 0 ? colors.danger : colors.success,
                  }}
                />
              </View>
              <View style={tw`flex-1 border-b border-slate-100`}>
                <LabelValue
                  label="Type"
                  value={leave.leave_type_name ?? "N/A"}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      {showActions && handleStatusChange && (
        <View style={tw`px-5 py-4 flex-row gap-3`}>
          <Pressable
            onPress={() => handleStatusChange("approved")}
            style={({ pressed }) => [
              tw`flex-1 flex-row items-center justify-center py-4 rounded-2xl ${TW.bgAction}`,
              pressed && tw`opacity-70`,
            ]}>
            <CheckCircle size={18} color={colors.surface} />
            <Text style={tw`text-white font-bold ml-2`}>Approve</Text>
          </Pressable>

          <Pressable
            onPress={() => handleStatusChange("rejected")}
            style={({ pressed }) => [
              tw`flex-1 flex-row items-center justify-center py-4 rounded-2xl ${TW.bgRejected}`,
              pressed && tw`opacity-70`,
            ]}>
            <XCircle size={18} color={colors.surface} />
            <Text style={tw`text-white font-bold ml-2`}>Reject</Text>
          </Pressable>

        </View>
      )}
    </View>
  );
};

export default PendingLeaveView;
