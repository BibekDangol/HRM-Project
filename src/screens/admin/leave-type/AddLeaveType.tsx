// app/(admin)/settings/leave/index.tsx

import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";

import AddLeaveTypeModal from "./AddLeaveTypeModal";
import { apiClient } from "@/src/api/apiClient";
import { fetchLeaveTypesService } from "@/src/services/leave.type.service";
import tw from "twrnc";
import { useLeaveTypeStore } from "@/src/store/useLeaveTypeStore";
import { useUsersStore } from "@/src/store/useAdminsStore";

export default function AddLeaveType() {
  const { adminProfile } = useUsersStore();
  const { leaveTypes, setLeaveTypes, addLeaveType } = useLeaveTypeStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!adminProfile) return;
    const loadLeaveTypes = async () => {
      const result = await fetchLeaveTypesService(adminProfile.organization_id)
      setLeaveTypes(result);
      if (!result) {
      }
    }
    loadLeaveTypes();
  }, [adminProfile]);

  const handleAddLeaveType = async (name: string, limit: number) => {
    try {
      const res = await apiClient.post("/add-leave-type", {
        name,
        leave_limit: limit,
        organization_id: adminProfile?.organization_id,
      });
      addLeaveType(res.data);
      setShowModal(false);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={tw`flex-1 bg-white p-4`}>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw`text-xl font-bold`}>Leave Types</Text>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={tw`bg-green-600 px-4 py-2 rounded`}
        >
          <Text style={tw`text-white`}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={leaveTypes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={tw`p-3 border rounded mb-2 flex-row justify-between`}>
            <Text>{item.name}</Text>
            <Text>{item.leave_limit} days</Text>
          </View>
        )}
      />

      <AddLeaveTypeModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddLeaveType}
      />
    </View>
  );
}
