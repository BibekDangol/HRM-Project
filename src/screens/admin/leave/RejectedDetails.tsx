import { Leave, fetchLeaveById } from "@/src/services/leave.service";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

import RejectedLeaveView from "@/src/components/Leave/RejectedLeaveView";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { useLocalSearchParams } from "expo-router";
import tw from "twrnc";

export default function RejectedDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadLeave = async () => {
      try {
        const data = await fetchLeaveById(id as string);
        setLeave(data);
      } finally {
        setLoading(false);
      }
    };
    loadLeave();
  }, [id]);

  if (loading) return <LoadingIndicator message="Loading..." />;

  if (!leave) {
    return (
      <View style={tw`flex-1 justify-center items-center p-4`}>
        <Text style={tw`text-red-500 text-lg`}>Leave not found</Text>
      </View>
    );
  }
  const leaveDuration =
    leave.days_count < 1 ? `Half Day (${leave.day_type})` : "Full Day";
  return <RejectedLeaveView leave={leave} leaveDuration={leaveDuration} />;
}
