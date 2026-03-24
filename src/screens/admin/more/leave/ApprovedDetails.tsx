import { Leave, fetchLeaveById } from "@/src/services/leave.service";
import { useEffect, useState } from "react";

import ApprovedLeaveView from "@/src/components/Leave/ApprovedLeaveView";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function LeaveApprovedDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadLeave = async () => {
      const data = await fetchLeaveById(id as string);
      setLeave(data);
      setLoading(false);
    };

    loadLeave();
  }, [id]);

  if (loading) return <LoadingIndicator message="Loading..." />;

  if (!leave) return <View>No Leave Detail Found</View>;

  return <ApprovedLeaveView leave={leave} />;
}
