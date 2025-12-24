import {
  formatLastSetDate,
  useDeleteWorkoutMovement,
  useMovementLastSets,
  useWorkout,
  useWorkoutMovements,
} from "@fitness/shared";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Dumbbell, MoreVertical } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MovementActionSheet } from "../../../components/MovementActionSheet";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: workout, isLoading: workoutLoading } = useWorkout(id);
  const { data: movements, isLoading: movementsLoading } =
    useWorkoutMovements(id);
  const deleteMovementMutation = useDeleteWorkoutMovement();

  // Get movement IDs for efficient last set date lookup
  const movementIds = movements?.map((m) => m.user_movement_id) || [];
  const { data: lastSetsData = [] } = useMovementLastSets(movementIds);

  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const loading = workoutLoading || movementsLoading;

  const handleOpenActionSheet = (movement: any) => {
    setSelectedMovement(movement);
    setActionSheetVisible(true);
  };

  const handleDeleteMovement = () => {
    if (!selectedMovement) return;

    Alert.alert(
      "Remove Exercise",
      "Are you sure you want to remove this exercise from the workout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            deleteMovementMutation.mutate(
              {
                workoutMovementId: selectedMovement.id,
                workoutId: id,
              },
              {
                onSuccess: () => {
                  setActionSheetVisible(false);
                  setSelectedMovement(null);
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleEditMovement = () => {
    setActionSheetVisible(false);
    // Determine target route based on navigation structure
    // For now, we can perhaps just close it as "Edit" might imply reordering or changing settings
    // which might not be implemented yet. Or navigate to movement detail?
    // User requested "Edit" button but didn't specify action details.
    // Assuming placeholder for now or navigate to detail.
    if (selectedMovement) {
      router.push(
        `/workout/${id}/movement/${selectedMovement.user_movement.id}`
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center">
        <Text className="text-white text-lg">Workout not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary-500 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const getLastSetDate = (userMovementId: string) => {
    const lastSetData = lastSetsData.find(
      (data) => data.user_movement_id === userMovementId
    );

    if (!lastSetData?.last_set_date) {
      return "No sets";
    }

    return formatLastSetDate([{ created_at: lastSetData.last_set_date }]);
  };

  const renderMovement = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-dark-card p-4 rounded-xl border border-dark-border mb-3"
      onPress={() =>
        router.push(`/workout/${id}/movement/${item.user_movement.id}`)
      }
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="h-10 w-10 rounded-full bg-secondary-500/20 items-center justify-center mr-3">
            <Dumbbell size={20} color="#ec4899" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base">
              {item.user_movement?.name}
            </Text>
            <Text className="text-gray-400 text-sm">
              {getLastSetDate(item.user_movement.id)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleOpenActionSheet(item);
          }}
          className="p-2"
        >
          <MoreVertical size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-bg">
      <View className="flex-1 p-4 pb-0">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center p-2 -ml-2"
          >
            <ChevronLeft size={24} color="#fff" />
            <Text className="text-white text-lg font-semibold ml-1">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity className="p-2 -mr-2">
            <MoreVertical size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <Text className="text-3xl font-bold text-white mb-1">
            {workout.name}
          </Text>
          {workout.description && (
            <Text className="text-gray-400 text-base">
              {workout.description}
            </Text>
          )}
        </View>

        <FlatList
          data={movements}
          renderItem={renderMovement}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 bg-dark-card rounded-2xl border border-dashed border-gray-700">
              <Text className="text-gray-500 text-lg mb-2">
                No exercises added
              </Text>
              <TouchableOpacity className="bg-primary-500 px-4 py-2 rounded-full mt-2">
                <Text className="text-white font-semibold">
                  + Add Exercise (Coming Soon)
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      <MovementActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        onEdit={handleEditMovement}
        onDelete={handleDeleteMovement}
        title={selectedMovement?.user_movement?.name}
      />
    </SafeAreaView>
  );
}
