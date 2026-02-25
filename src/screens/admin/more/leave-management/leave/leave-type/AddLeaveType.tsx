// app/(admin)/settings/leave/index.tsx

import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

import { apiClient } from "@/src/api/apiClient";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { fetchLeaveTypesService } from "@/src/services/leave.type.service";
import { useUsersStore } from "@/src/store/useAdminsStore";
import { useLeaveTypeStore } from "@/src/store/useLeaveTypeStore";
import tw from "twrnc";
import AddLeaveTypeModal from "./AddLeaveTypeModal";

export default function LeaveTypeSettings() {
  const { adminProfile } = useUsersStore();
  const {
    leaveTypes,
    setLeaveTypes,
    addLeaveType,
    updateLeaveType,
    removeLeaveType,
  } = useLeaveTypeStore();

  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadLeaveTypes = useCallback(async () => {
    if (!adminProfile?.organization_id) return;
    try {
      setLoading(true);
      console.log(loading);
      const result = await fetchLeaveTypesService(
        adminProfile.organization_id
      );
      setLeaveTypes(result || []);
      setLoading(false);
      console.log(loading)
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }, [adminProfile])
  // Load leave types
  useEffect(() => {
    loadLeaveTypes();
  }, [loadLeaveTypes]);
  const onRefresh = async () => {
    setRefreshing(true)
    await loadLeaveTypes();
    setRefreshing(false)
  }
  // ADD
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

  // EDIT
  const handleEditLeaveType = async (
    id: string,
    name: string,
    limit: number
  ) => {
    try {
      const res = await apiClient.put("/edit-leave-type", {
        id,
        name,
        leave_limit: limit,
      });

      updateLeaveType(res.data);
      setShowModal(false);
      setSelectedType(null);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    Alert.alert("Confirm", "Delete this leave type?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete("/delete-leave-type", {
              data: { id },
            });
            removeLeaveType(id);
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={tw`flex-1 bg-white p-4`}>
      {/* Header */}
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw`text-xl font-bold`}>Leave Types</Text>
        <TouchableOpacity
          onPress={() => {
            setSelectedType(null);
            setShowModal(true);
          }}
          style={tw`bg-green-600 px-4 py-2 rounded`}
        >
          <Text style={tw`text-white`}>Add</Text>
        </TouchableOpacity>
      </View>
      {/* List */}
      {loading ?
        (<LoadingIndicator message="Loading Leave Types" />)
        : (
          <FlatList
            data={leaveTypes}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={onRefresh}
            renderItem={({ item }) => (
              <View style={tw`p-3 border rounded mb-2 flex-row justify-between items-center`}>
                <View>
                  <Text style={tw`font-semibold`}>{item.name}</Text>
                  <Text style={tw`text-gray-500`}>
                    {item.leave_limit} days
                  </Text>
                </View>
                <View style={tw`flex-row`}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedType(item);
                      setShowModal(true);
                    }}
                    style={tw`bg-blue-500 px-3 py-1 rounded mr-2`}
                  >
                    <Text style={tw`text-white`}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={tw`bg-red-500 px-3 py-1 rounded`}
                  >
                    <Text style={tw`text-white`}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
            }
          />
        )}
      {/* Modal */}
      <AddLeaveTypeModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedType(null);
        }}
        onSubmit={
          selectedType
            ? (name: string, limit: number) =>
              handleEditLeaveType(selectedType.id, name, limit)
            : handleAddLeaveType
        }
      />
    </View >
  );
}
