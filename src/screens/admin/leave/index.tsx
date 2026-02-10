import { Pressable, Text, View } from "react-native";

import Capsule from "@/src/components/Capsule";
import { fetchLeaveRequests } from "@/src/services/leave.service";
import { useUsersStore } from "@/src/store/useAdminsStore";
import { useLeaveStore } from "@/src/store/useLeaveStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import tw from 'twrnc';

export default function LeaveRequests() {
  const { adminProfile } = useUsersStore();
  const { setLeaves, leaves } = useLeaveStore();
  useEffect(() => {
    if (!adminProfile) return;
    const loadLeaves = async () => {
      const data = await fetchLeaveRequests(adminProfile.organization_id);
      setLeaves(data);
    };
    loadLeaves();
  }, [adminProfile]);
  const router = useRouter();
  return (
    <View>
      {(leaves ?? []).map((leave) => (
        <Pressable
          key={leave.id}
          onPress={() => {
            if (leave.status === "approved") {
              router.push({
                pathname: "/(admin)/leave/approved-details",
                params: { id: leave.id },
              });
            } else if (leave.status === "pending") {
              router.push({
                pathname: "/(admin)/leave/leave-details",
                params: { id: leave.id },
              });
            }
            else {
              router.push({
                pathname: "/(admin)/leave/rejected-details",
                params: { id: leave.id },
              });
            }
          }}
          style={{ padding: 12, borderBottomWidth: 1, borderColor: "#ddd" }}
        >
          <View style={tw`flex-row justify-between items-center `}>
            <View style={tw`flex-col gap-2`}>
              <Text>{leave.first_name}</Text>
              <Text>{leave.start_date}</Text>
            </View>

            <Capsule
              text={leave.status.toUpperCase()}
              color={
                leave.status === "pending"
                  ? "yellow"
                  : leave.status === "approved"
                    ? "green"
                    : "red"
              }
            />
          </View>
        </Pressable>
      ))
      }

    </View >
  );
}
