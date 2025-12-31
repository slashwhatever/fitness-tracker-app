import { AddMovementSheet } from "@/components/AddMovementSheet";
import { GlassHeader } from "@/components/GlassHeader";
import { MovementActionSheet } from "@/components/MovementActionSheet";
import { MovementIcon } from "@/components/MovementIcon";
import { WorkoutActionSheet } from "@/components/WorkoutActionSheet";
import { createClient } from "@/lib/supabase/client";
import { formatLastSetDate } from "@fitness/shared";
import { useBottomPadding } from "@hooks/useBottomPadding";
import { useHeaderPadding } from "@hooks/useHeaderPadding";
import { useMovementLastSets } from "@hooks/useMovementLastSets";
import {
  useAddMovementsToWorkout,
  useCreateUserMovement,
  useDeleteWorkoutMovement,
  useWorkoutMovements,
} from "@hooks/useMovements";
import { useThemeColors } from "@hooks/useThemeColors";
import {
  useArchiveWorkout,
  useDeleteWorkout,
  useDuplicateWorkout,
  useWorkout,
} from "@hooks/useWorkouts";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MoreVertical, Plus } from "lucide-react-native";
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

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const headerPadding = useHeaderPadding();
  const bottomPadding = useBottomPadding();
  const colors = useThemeColors();

  const { data: workout, isLoading: workoutLoading } = useWorkout(id);
  const { data: movements, isLoading: movementsLoading } =
    useWorkoutMovements(id);
  const deleteMovementMutation = useDeleteWorkoutMovement();

  // Get movement IDs for efficient last set date lookup
  const movementIds = movements?.map((m) => m.user_movement_id) || [];
  const { data: lastSetsData = [] } = useMovementLastSets(movementIds);
  const archiveMutation = useArchiveWorkout();
  const duplicateMutation = useDuplicateWorkout();
  const deleteMutation = useDeleteWorkout();

  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [workoutActionSheetVisible, setWorkoutActionSheetVisible] =
    useState(false);
  const [addMovementSheetVisible, setAddMovementSheetVisible] = useState(false);

  const createUserMovementMutation = useCreateUserMovement();
  const addMovementsBatch = useAddMovementsToWorkout();

  const loading = workoutLoading || movementsLoading;

  const handleWorkoutAction = async (
    action: "duplicate" | "archive" | "delete" | "edit"
  ) => {
    if (!workout) return;

    try {
      switch (action) {
        case "edit":
          router.push(`/workout/${workout.id}/settings`);
          break;
        case "duplicate":
          await duplicateMutation.mutateAsync(workout.id);
          Alert.alert("Success", "Workout duplicated");
          break;
        case "archive":
          await archiveMutation.mutateAsync({
            workoutId: workout.id,
            archived: !workout.archived,
          });
          break;
        case "delete":
          try {
            await deleteMutation.mutateAsync(workout.id);
            router.replace("/workouts");
          } catch (error) {
            Alert.alert("Error", "Failed to delete workout");
          }
          break;
      }
    } catch (error) {
      if (action !== "delete") {
        Alert.alert("Error", `Failed to ${action} workout`);
      }
    }
  };

  const handleOpenActionSheet = (movement: any) => {
    setSelectedMovement(movement);
    setActionSheetVisible(true);
  };

  const handleDeleteMovement = () => {
    if (!selectedMovement) return;

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
        `/workout/${id}/movement/${selectedMovement.user_movement.id}/settings`
      );
    }
  };

  const handleAddMovements = async (movementIds: string[]) => {
    try {
      // Collect data for optimistic updates
      const userMovementIds: string[] = [];
      const userMovementsForOptimistic: any[] = [];
      const { data: templates } = await createClient()
        .from("movement_templates")
        .select(
          `
          id,
          name,
          instructions,
          tracking_type_id,
          experience_level,
          movement_template_muscle_groups(
            muscle_groups(display_name)
          ),
          tracking_types!inner(name)
        `
        )
        .in("id", movementIds);

      for (const movementId of movementIds) {
        // Check if this is already a user movement
        const existingUserMovement = movements?.find(
          (m) => m.user_movement_id === movementId
        );

        if (existingUserMovement) {
          userMovementIds.push(movementId);
          // Add existing user movement data for optimistic update
          if (existingUserMovement.user_movement) {
            userMovementsForOptimistic.push(existingUserMovement.user_movement);
          }
        } else {
          // It's a template - find the template data
          const template = templates?.find((t) => t.id === movementId);

          if (template) {
            // Create user movement with template link (Hybrid approach)
            const muscleGroups =
              template.movement_template_muscle_groups
                ?.map((mtmg: any) => mtmg.muscle_groups?.display_name)
                .filter(Boolean) || [];

            const newUserMovement =
              await createUserMovementMutation.mutateAsync({
                template_id: template.id, // HYBRID: Keep template link!
                original_template_id: template.id, // Track provenance
                name: template.name, // Required field - will be overridden by template data in queries
                tracking_type_id: template.tracking_type_id,
                muscle_groups: muscleGroups,
              });
            userMovementIds.push(newUserMovement.id);

            // Build optimistic user movement data from template
            userMovementsForOptimistic.push({
              id: newUserMovement.id,
              name: template.name, // Name is still needed for optimistic UI
              personal_notes: template.instructions, // Notes are still needed for optimistic UI
              tracking_type: template.tracking_types?.name || "weight",
              tracking_type_id: template.tracking_type_id,
              experience_level: template.experience_level,
              muscle_groups: muscleGroups,
              user_id: newUserMovement.user_id,
              created_at: newUserMovement.created_at,
              updated_at: newUserMovement.updated_at,
              template_id: template.id, // Keep link
              original_template_id: template.id,
              custom_rest_timer: null,
              last_used_at: null,
              manual_1rm: null,
              migrated_from_template: false,
              migration_date: null,
              tags: null,
            });
          } else {
            // It's a user movement not in the workout yet
            userMovementIds.push(movementId);
          }
        }
      }

      // Add all movements to workout
      if (userMovementIds.length > 0) {
        const startingOrderIndex = movements?.length || 0;
        const workoutMovements = userMovementIds.map((umId, index) => ({
          workout_id: id,
          user_movement_id: umId,
          order_index: startingOrderIndex + index,
        }));

        await addMovementsBatch.mutateAsync({
          workoutMovements,
          userMovementsForOptimistic,
        });
      }
    } catch (error) {
      console.error("Error adding movements:", error);
      Alert.alert("Error", "Failed to add movements to workout");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground text-lg">Workout not found</Text>
        <TouchableOpacity
          onPress={() => router.replace("/workouts")}
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
      className="bg-card p-4 rounded-2xl border border-border mb-3"
      onPress={() => {
        if (item.user_movement?.id) {
          router.push(`/workout/${id}/movement/${item.user_movement.id}`);
        }
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="h-10 w-10 rounded-full bg-primary-500/20 items-center justify-center mr-3">
            <MovementIcon
              trackingType={item.user_movement?.tracking_type}
              size={20}
            />
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-bold text-base">
              {item.user_movement?.name}
            </Text>
            <Text className="text-slate-500 dark:text-gray-400 text-sm">
              {item.user_movement?.id
                ? getLastSetDate(item.user_movement.id)
                : "No sets"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            if (item.user_movement) {
              handleOpenActionSheet(item);
            }
          }}
          className="p-2"
        >
          <MoreVertical size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          header: () => (
            <GlassHeader
              title="Workouts"
              onBack={() => {
                router.replace("/workouts");
              }}
            />
          ),
        }}
      />

      <View className="flex-1 pb-0">
        {/* Header Removed */}

        <FlatList
          data={movements}
          renderItem={renderMovement}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: bottomPadding,
            paddingTop: headerPadding + 16,
            paddingHorizontal: 16,
            gap: 4,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="mb-6">
              <Text className="text-3xl font-bold text-foreground mb-1">
                {workout.name}
              </Text>
              {workout.description && (
                <Text className="text-slate-500 dark:text-gray-400 text-base">
                  {workout.description}
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <TouchableOpacity
              className="bg-transparent p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-gray-600"
              onPress={() => setAddMovementSheetVisible(true)}
            >
              <View className="items-center">
                <View className="h-16 w-16 rounded-full bg-primary-500/10 items-center justify-center mb-4">
                  <Plus size={32} color={colors.tint} />
                </View>
                <Text className="text-slate-500 dark:text-gray-400 font-medium text-lg">
                  Add your first movement
                </Text>
              </View>
            </TouchableOpacity>
          }
          ListFooterComponent={
            movements && movements.length > 0 ? (
              <TouchableOpacity
                className="bg-transparent p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-gray-600 mb-3"
                onPress={() => setAddMovementSheetVisible(true)}
              >
                <View className="flex-row items-center">
                  <View className="h-10 w-10 rounded-full bg-primary-500/10 items-center justify-center mr-3">
                    <Plus size={20} color={colors.tint} />
                  </View>
                  <Text className="text-slate-500 dark:text-gray-400 font-medium text-base">
                    Add a movement
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null
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

      <WorkoutActionSheet
        visible={workoutActionSheetVisible}
        onClose={() => setWorkoutActionSheetVisible(false)}
        onSelect={handleWorkoutAction}
        workoutName={workout?.name || ""}
        isArchived={workout?.archived || false}
      />

      <AddMovementSheet
        visible={addMovementSheetVisible}
        onClose={() => setAddMovementSheetVisible(false)}
        onAddMovements={handleAddMovements}
        workoutId={id}
        existingMovementIds={movements?.map((m) => m.user_movement_id) || []}
      />
    </View>
  );
}
