import { Pressable, ScrollView, Text, View } from "react-native";

import Capsule from "@/src/components/Capsule";
import { fetchLeaveRequests } from "@/src/services/leave.service";
import { useUsersStore } from "@/src/store/useAdminsStore";
import { useLeaveStore } from "@/src/store/useLeaveStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import tw from "twrnc";

export default function LeaveRequests() {
  const { adminProfile } = useUsersStore();
  const { setLeaves, leaves } = useLeaveStore();
  const router = useRouter();

  useEffect(() => {
    if (!adminProfile) return;
    const loadLeaves = async () => {
      const data = await fetchLeaveRequests(adminProfile.organization_id);
      setLeaves(data);
    };
    loadLeaves();
  }, [adminProfile, setLeaves]);

  const goToDetails = (leave: any) => {
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
    } else {
      router.push({
        pathname: "/(admin)/leave/rejected-details",
        params: { id: leave.id },
      });
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Top separator like a native list */}
      <View style={tw`h-px bg-gray-200`} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {(leaves ?? []).map((leave) => (
          <Pressable
            key={leave.id}
            onPress={() => goToDetails(leave)}
            style={({ pressed }) => [
              tw`px-4 py-4 bg-white`,
              pressed ? tw`bg-gray-50` : null,
            ]}
          >
            <View style={tw`flex-row items-center justify-between`}>
              {/* Left text block */}
              <View style={tw`flex-1 pr-3`}>
                <Text style={tw`text-base text-gray-900 font-medium`}>
                  {leave.first_name}
                </Text>
                <Text style={tw`text-sm text-gray-500 mt-1`}>
                  {leave.start_date}
                </Text>
              </View>

              {/* Right status */}
              <Capsule
                text={String(leave.status).toUpperCase()}
                color={
                  leave.status === "pending"
                    ? "yellow"
                    : leave.status === "approved"
                      ? "green"
                      : "red"
                }
              />
            </View>

            {/* Bottom separator (indented like native lists) */}
            <View style={tw`h-px bg-gray-200 mt-4 ml-0`} />
          </Pressable>
        ))}

        {(leaves ?? []).length === 0 && (
          <View style={tw`py-16 items-center`}>
            <Text style={tw`text-gray-500`}>No leave requests found.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
