import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

import { apiClient } from "@/src/api/apiClient";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { fetchLeaveTypesService } from "@/src/services/leave.type.service";
import { useLeaveTypeStore } from "@/src/store/useLeaveTypeStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { TW } from "@/theme/twStyles";
import { Plus } from "lucide-react-native";
import tw from "twrnc";
import AddLeaveTypeModal from "./AddLeaveTypeModal";
import { BackButton } from "@/src/components/BackButton";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LeaveTypeSettings() {
  const { userProfile } = useUsersStore();
  const {
    leaveTypes,
    setLeaveTypes,
    addLeaveType,
    updateLeaveType,
    removeLeaveType,
  } = useLeaveTypeStore();

  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaveTypes = useCallback(async () => {
    if (!userProfile?.organization_id) return;

    try {
      setLoading(true);
      const result = await fetchLeaveTypesService(userProfile.organization_id);

      setLeaveTypes(result || []);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    loadLeaveTypes();
  }, [loadLeaveTypes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaveTypes();
    setRefreshing(false);
  };

  const handleAddLeaveType = async (name: string, limit: number) => {
    try {
      const res = await apiClient.post("/add-leave-type", {
        name,
        leave_limit: limit,
        organization_id: userProfile?.organization_id,
      });

      addLeaveType(res.data);
      setShowModal(false);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleEditLeaveType = async (
    id: string,
    name: string,
    limit: number,
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

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Leave Type", "Are you sure?", [
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
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={tw`flex-1 bg-white px-4`}
    >
      <View style={tw`pt-3`}>
        <BackButton />
      </View>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between mb-5`}>
        <Text style={tw`text-xl font-bold ${TW.textPrimary}`}>Leave Types</Text>

        <TouchableOpacity
          onPress={() => {
            setSelectedType(null);
            setShowModal(true);
          }}
          activeOpacity={0.8}
          style={tw`h-12 w-12 rounded-full ${TW.bgAction} items-center justify-center`}
        >
          <Plus size={22} color="white" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingIndicator />
      ) : (
        <FlatList
          data={leaveTypes}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={tw`items-center mt-20`}>
              <Text style={tw`${TW.textSecondary}`}>No leave types found</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View
              style={tw`bg-white rounded-2xl p-4 mb-3 border ${TW.BORDER} flex-row justify-between items-center`}
            >
              {/* Leave Info */}
              <View>
                <Text style={tw`text-base font-semibold ${TW.textPrimary}`}>
                  {item.name}
                </Text>

                <Text style={tw`text-sm ${TW.textSecondary}`}>
                  {item.leave_limit} days allowed
                </Text>
              </View>

              {/* Actions */}
              <View style={tw`flex-row`}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedType(item);
                    setShowModal(true);
                  }}
                  style={tw`bg-[#E6F1F3] px-3 py-2 rounded-lg mr-2`}
                >
                  <Text style={tw`${TW.textSecondary} font-medium`}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleDelete(item.id)}
                  style={tw`bg-red-50 px-3 py-2 rounded-lg`}
                >
                  <Text style={tw`text-red-600 font-medium`}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    </SafeAreaView>
  );
}
