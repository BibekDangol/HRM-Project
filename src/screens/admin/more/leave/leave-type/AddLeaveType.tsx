import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { apiClient } from "@/src/api/apiClient";
import { BackButton } from "@/src/components/BackButton";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { fetchLeaveTypesService } from "@/src/services/leave.type.service";
import { useLeaveTypeStore } from "@/src/store/useLeaveTypeStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { TW } from "@/theme/twStyles";
import { Pencil, Plus, Trash2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import AddLeaveTypeModal from "./AddLeaveTypeModal";

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
    if (loading) return;
    Alert.alert("Delete Leave Type", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await apiClient.delete("/delete-leave-type", {
              data: { id },
            });
            removeLeaveType(id);
          } catch (err: any) {
            Alert.alert("Error", err.message);
          } finally {
            setLoading(false);
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

        <Pressable
          onPress={() => {
            setSelectedType(null);
            setShowModal(true);
          }}
          style={tw`h-12 w-12 rounded-full ${TW.bgAction}/90 items-center justify-center`}
        >
          <Plus size={22} color="white" strokeWidth={2.5} />
        </Pressable>
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
              <View style={tw`flex-row gap-2`}>
                <Pressable
                  onPress={() => {
                    setSelectedType(item);
                    setShowModal(true);
                  }}
                  hitSlop={12}
                  style={({ pressed }) => [
                    tw`w-10 h-10 rounded-full items-center justify-center ${TW.bgAction}/90`,
                    pressed && tw`opacity-70`,
                  ]}
                >
                  <Pencil size={18} color={TW.bgPrimary} />
                </Pressable>

                <Pressable
                  onPress={() => handleDelete(item.id)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    tw`w-10 h-10 rounded-full items-center justify-center bg-red-400`,
                    pressed && tw`opacity-70`,
                  ]}
                >
                  <Trash2 size={18} color={TW.bgPrimary} />
                </Pressable>
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
        initialName={selectedType?.name}
        initialLimit={selectedType?.leave_limit}
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
