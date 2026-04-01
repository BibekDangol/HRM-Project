import { useEffect, useState } from "react";
import { Text } from "react-native";

import RejectedLeaveView from "@/src/components/Leave/RejectedLeaveView";
import { fetchLeaveById, Leave } from "@/src/services/leave.service";
import { useLocalSearchParams } from "expo-router";
import tw from "twrnc";

const RejectedDetails = () => {
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useLocalSearchParams();
  useEffect(() => {
    if (!id) return;
    const loadLeave = async () => {
      try {
        const result = await fetchLeaveById(id as string);
        setLeave(result);
      } finally {
        setLoading(false);
      }
    };

    loadLeave();
  }, [id]);

  if (loading) {
    return <Text style={tw`p-4 text-gray-500`}>Loading...</Text>;
  }
  if (!leave) {
    return <Text style={tw`p-4 text-red-500`}>Leave not found</Text>;
  }
  const leaveDuration =
    leave.days_count < 1 ? `Half Day (${leave.day_type})` : "Full Day";

  return (
    <>
      <RejectedLeaveView leave={leave} leaveDuration={leaveDuration} />
    </>
  );
};

export default RejectedDetails;
