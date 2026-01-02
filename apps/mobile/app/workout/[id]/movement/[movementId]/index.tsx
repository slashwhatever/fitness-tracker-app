import { Button } from "@/components/Button";
import { CollapsibleNotes } from "@/components/CollapsibleNotes";
import { EditSetSheet } from "@/components/EditSetSheet";
import { GlassHeader } from "@/components/GlassHeader";
import { MovementActionSheet } from "@/components/MovementActionSheet";
import { MovementIcon } from "@/components/MovementIcon";
import { SessionComparison } from "@/components/SessionComparison";
import { SetAdjuster } from "@/components/SetAdjuster";
import { TimedConfirmDeleteButton } from "@/components/TimedConfirmDeleteButton";
import { useBottomPadding } from "@hooks/useBottomPadding";
import { useHeaderPadding } from "@hooks/useHeaderPadding";
import {
  useDeleteWorkoutMovement,
  useUserMovement,
  useWorkoutMovements,
} from "@hooks/useMovements";
import { useCreateSet, useDeleteSet, useSetsByMovement } from "@hooks/useSets";
import { useThemeColors } from "@hooks/useThemeColors";
import { useUserProfile } from "@hooks/useUserProfile";
import { useWorkout } from "@hooks/useWorkouts";
import { format } from "date-fns";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  Check,
  Copy,
  MoreVertical,
  Pencil,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SetActionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: "duplicate" | "edit" | "delete") => void;
  setDetails: string;
}

function SetActionModal({
  visible,
  onClose,
  onSelect,
  setDetails,
}: SetActionModalProps) {
  const colors = useThemeColors();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <View className="bg-card rounded-t-3xl overflow-hidden pb-8 border-t border-border">
          <View className="p-4 border-b border-border">
            <Text className="text-lg font-semibold text-foreground text-center">
              {setDetails}
            </Text>
          </View>
          <View className="p-4 gap-2">
            <Button
              size="lg"
              variant="outline"
              className="flex-row items-center gap-2 justify-start"
              onPress={() => {
                onSelect("edit");
                onClose();
              }}
              icon={<Pencil size={20} color="green" />}
            >
              Edit
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="flex-row items-center gap-2 justify-start"
              onPress={() => {
                onSelect("duplicate");
                onClose();
              }}
              icon={<Copy size={20} color={colors.tint} />}
            >
              Duplicate
            </Button>

            <TimedConfirmDeleteButton
              onConfirm={() => {
                onSelect("delete");
                onClose();
              }}
            />
          </View>
          <Button size="lg" variant="outline" onPress={onClose}>
            Cancel
          </Button>
        </View>
      </Pressable>
    </Modal>
  );
}

export default function MovementDetailScreen() {
  const { id: workoutId, movementId } = useLocalSearchParams<{
    id: string;
    movementId: string;
  }>();
  const router = useRouter();
  const headerPadding = useHeaderPadding();
  const bottomPadding = useBottomPadding();
  const colors = useThemeColors();

  const { data: movement, isLoading: movementLoading } =
    useUserMovement(movementId);
  const { data: workout } = useWorkout(workoutId);
  const { data: sets, isLoading: setsLoading } = useSetsByMovement(movementId);
  const { data: profile } = useUserProfile();
  const { data: workoutMovements } = useWorkoutMovements(workoutId);

  const workoutMovement = workoutMovements?.find(
    (wm) => wm.user_movement_id === movementId
  );
  const createSetMutation = useCreateSet();
  const deleteSetMutation = useDeleteSet();

  const [weight, setWeight] = useState("0");
  const [reps, setReps] = useState("0");
  const [distance, setDistance] = useState("0");
  const [duration, setDuration] = useState("0");
  const [rpe, setRpe] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const [selectedSet, setSelectedSet] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editSheetVisible, setEditSheetVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const deleteMovementMutation = useDeleteWorkoutMovement();

  // Normalize tracking type with fallback
  const trackingType = movement?.tracking_type || "weight";

  // Initialize with values from the most recent set if available
  useEffect(() => {
    if (sets && sets.length > 0) {
      const lastSet = sets[0];
      setWeight(lastSet.weight?.toString() || "0");
      setReps(lastSet.reps?.toString() || "0");
      setDistance(lastSet.distance?.toString() || "0");
      setDuration(lastSet.duration?.toString() || "0");
      // Don't auto-fill RPE as that likely changes
    }
  }, [setsLoading]); // Only run once when sets load initially

  // Clear inputs after successful log
  useEffect(() => {
    if (createSetMutation.isSuccess) {
      setNotes("");
      createSetMutation.reset();
    }
  }, [createSetMutation.isSuccess]);

  const handleAdjust = (
    setter: (val: string) => void,
    current: string,
    delta: number
  ) => {
    const val = parseFloat(current) || 0;
    const newVal = Math.max(0, val + delta);
    // Remove decimal if whole number
    setter(newVal % 1 === 0 ? newVal.toString() : newVal.toFixed(1));
  };

  // Validation logic
  const isValidSet = (() => {
    switch (trackingType) {
      case "weight":
      case "bodyweight":
      case "reps":
        return (parseInt(reps) || 0) > 0;
      case "distance":
        return (parseFloat(distance) || 0) > 0;
      case "duration":
        return (parseFloat(duration) || 0) > 0;
      default:
        return true;
    }
  })();

  const handleLogSet = async () => {
    if (!workoutId || !movementId) return;

    try {
      const weightVal = parseFloat(weight);
      const repsVal = parseInt(reps);
      const distanceVal = parseFloat(distance);
      const durationVal = parseInt(duration);

      await createSetMutation.mutateAsync({
        workout_id: workoutId,
        user_movement_id: movementId,
        weight: isNaN(weightVal) ? null : weightVal,
        reps: isNaN(repsVal) || repsVal === 0 ? null : repsVal,
        distance: isNaN(distanceVal) || distanceVal === 0 ? null : distanceVal,
        duration: isNaN(durationVal) || durationVal === 0 ? null : durationVal,
        rpe: rpe,
        notes: notes.trim() || undefined,
      });
      // Optional: Give feedback or clear inputs
    } catch (error: any) {
      Alert.alert("Error", `Failed to log set: ${error.message}`);
    }
  };

  const handleSetAction = async (action: "duplicate" | "edit" | "delete") => {
    if (!selectedSet) return;

    try {
      switch (action) {
        case "delete":
          await deleteSetMutation.mutateAsync({
            id: selectedSet.id,
            user_movement_id: selectedSet.user_movement_id,
          });
          break;
        case "duplicate":
          await createSetMutation.mutateAsync({
            workout_id: workoutId,
            user_movement_id: movementId,
            weight: selectedSet.weight,
            reps: selectedSet.reps,
            distance: selectedSet.distance,
            duration: selectedSet.duration,
            rpe: selectedSet.rpe,
          });
          break;
        case "edit":
          setEditSheetVisible(true);
          break;
      }
    } catch (error) {
      Alert.alert("Error", `Failed to ${action} set`);
    }
  };

  const loading = movementLoading || setsLoading;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  if (!movement) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground text-lg">Movement not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary-500 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Group sets by date
  const groupedSets = (sets || []).reduce((acc: any, set) => {
    const date = format(new Date(set.created_at), "EEE, MMM d, yyyy");
    if (!acc[date]) acc[date] = [];
    acc[date].push(set);
    return acc;
  }, {});

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          header: () => (
            <GlassHeader
              title={workout?.name || "Back"}
              backPath={`/workout/${workoutId}`}
              rightAction={
                <TouchableOpacity
                  className="p-2 -mr-2"
                  onPress={() => {
                    setActionSheetVisible(true);
                  }}
                >
                  <MoreVertical size={24} color={colors.text} />
                </TouchableOpacity>
              }
            />
          ),
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: headerPadding + 16,
          paddingBottom: bottomPadding,
        }}
      >
        <View className="px-4 mb-6 flex-row items-center gap-3">
          <View className="h-12 w-12 rounded-full bg-primary-500/20 items-center justify-center">
            <MovementIcon trackingType={trackingType} size={24} />
          </View>
          <Text className="text-3xl font-bold text-foreground text-left flex-1">
            {movement.name}
          </Text>
        </View>

        {/* Collapsible Notes Section */}
        <CollapsibleNotes
          personalNotes={movement.personal_notes}
          workoutNotes={workoutMovement?.workout_notes}
        />

        {/* Input Section */}
        <View className="p-4 gap-6">
          <View className="flex-row gap-4 justify-between">
            {/* Dynamic Controls based on tracking_type */}
            {(trackingType === "weight" ||
              trackingType === "reps" ||
              trackingType === "bodyweight") && (
              <View className="flex-1">
                <SetAdjuster
                  label="REPS"
                  value={reps}
                  onChangeText={setReps}
                  onAdjust={(delta) => handleAdjust(setReps, reps, delta)}
                  steps={[1]}
                  variant="primary"
                />
              </View>
            )}

            {trackingType === "weight" && (
              <View className="flex-1">
                <SetAdjuster
                  label={profile?.weight_unit?.toUpperCase() || "KG"}
                  value={weight}
                  onChangeText={setWeight}
                  onAdjust={(delta) => handleAdjust(setWeight, weight, delta)}
                  steps={[1, 5]}
                  variant="secondary"
                />
              </View>
            )}

            {trackingType === "duration" && (
              <View className="flex-1">
                <SetAdjuster
                  label="SECONDS"
                  value={duration}
                  onChangeText={setDuration}
                  onAdjust={(delta) =>
                    handleAdjust(setDuration, duration, delta)
                  }
                  steps={[5, 15]}
                  variant="primary"
                />
              </View>
            )}

            {trackingType === "distance" && (
              <View className="flex-1">
                <SetAdjuster
                  label={profile?.distance_unit?.toUpperCase() || "KM"}
                  value={distance}
                  onChangeText={setDistance}
                  onAdjust={(delta) =>
                    handleAdjust(setDistance, distance, delta)
                  }
                  steps={[0.1, 0.5]}
                  variant="primary"
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            className={`bg-green-600 rounded-full py-4 items-center flex-row justify-center gap-2 active:bg-green-700 ${
              !isValidSet ? "opacity-50" : ""
            }`}
            onPress={handleLogSet}
            disabled={createSetMutation.isPending || !isValidSet}
          >
            {createSetMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Check size={24} color="white" />
                <Text className="text-white text-lg font-bold">Log Set</Text>
              </>
            )}
          </TouchableOpacity>

          <View className="bg-card rounded-xl border border-border p-3">
            <TextInput
              placeholder="Add note..."
              placeholderTextColor={colors.textSecondary}
              className="text-foreground text-base"
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={500}
            />
          </View>
        </View>

        {/* History Section */}
        <View className="px-4 pb-20">
          <View className="flex-row items-center flex-start mb-4 gap-2">
            <Calendar size={24} color={colors.text} />
            <Text className="text-lg font-bold text-foreground">
              Set history
            </Text>
          </View>

          {Object.entries(groupedSets)
            .sort(
              ([dateA], [dateB]) =>
                new Date(dateB).getTime() - new Date(dateA).getTime()
            )
            .map(([date, dateSets], index, array) => {
              const nextSession = array[index + 1];
              const previousSets = nextSession ? (nextSession[1] as any) : [];

              const showComparison =
                index === 0 && previousSets && previousSets.length > 0;

              return (
                <View
                  key={date}
                  className="bg-card rounded-xl border border-border mb-4 overflow-hidden"
                >
                  <View className="bg-slate-50/50 dark:bg-background/50 p-3 border-b border-border gap-1">
                    <Text className="text-slate-700 dark:text-gray-300 font-semibold text-base">
                      {date}
                    </Text>
                    {showComparison && (
                      <>
                        <Text className="text-xs text-gray-500">
                          Compared to previous
                        </Text>

                        {/* Use SessionComparison Component */}
                        <View className="border-slate-200/50 dark:border-border/50">
                          <SessionComparison
                            currentSets={dateSets as any[]}
                            previousSets={previousSets}
                            movement={movement}
                          />
                        </View>
                      </>
                    )}
                  </View>

                  <View>
                    {(dateSets as any[]).map((set, index) => (
                      <View
                        key={set.id}
                        className={`flex-row items-center justify-between p-3 ${
                          index !== (dateSets as any[]).length - 1
                            ? "border-b border-slate-100 dark:border-border/30"
                            : ""
                        }`}
                      >
                        <View className="flex-row items-center gap-2">
                          {(trackingType === "weight" ||
                            trackingType === "reps" ||
                            trackingType === "bodyweight") && (
                            <>
                              <Text className="text-foreground font-bold text-xl text-center">
                                {set.reps}
                              </Text>
                              <Text className="text-slate-500 dark:text-gray-500 text-sm">
                                reps
                              </Text>
                            </>
                          )}

                          {trackingType === "weight" && (
                            <>
                              <Text className="text-slate-500 dark:text-gray-500 text-sm">
                                x
                              </Text>
                              <Text className="text-foreground font-bold text-xl text-center">
                                {set.weight}
                              </Text>
                              <Text className="text-slate-500 dark:text-gray-500 text-sm">
                                {profile?.weight_unit || "kg"}
                              </Text>
                            </>
                          )}

                          {trackingType === "duration" && (
                            <>
                              <Text className="text-foreground font-bold text-xl text-center">
                                {set.duration}
                              </Text>
                              <Text className="text-slate-500 dark:text-gray-500 text-sm">
                                s
                              </Text>
                            </>
                          )}

                          {trackingType === "distance" && (
                            <>
                              <Text className="text-foreground font-bold text-xl text-center">
                                {set.distance}
                              </Text>
                              <Text className="text-slate-500 dark:text-gray-500 text-sm">
                                {profile?.distance_unit || "km"}
                              </Text>
                            </>
                          )}
                        </View>

                        <TouchableOpacity
                          className="p-2 -mr-2"
                          onPress={() => {
                            setSelectedSet(set);
                            setModalVisible(true);
                          }}
                          hitSlop={{
                            top: 10,
                            bottom: 10,
                            left: 10,
                            right: 10,
                          }}
                        >
                          <MoreVertical
                            size={20}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
        </View>
      </ScrollView>
      <SetActionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleSetAction}
        setDetails={
          selectedSet
            ? trackingType === "weight"
              ? `${selectedSet.reps} reps x ${selectedSet.weight} ${
                  profile?.weight_unit || "kg"
                }`
              : trackingType === "duration"
                ? `${selectedSet.duration}s`
                : trackingType === "distance"
                  ? `${selectedSet.distance} ${profile?.distance_unit || "km"}`
                  : `${selectedSet.reps} reps`
            : ""
        }
      />
      <EditSetSheet
        visible={editSheetVisible}
        onClose={() => setEditSheetVisible(false)}
        set={selectedSet}
        trackingType={trackingType}
        weightUnit={profile?.weight_unit || "kg"}
        distanceUnit={profile?.distance_unit || "km"}
      />

      <MovementActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        title={movement.name}
        onEdit={() => {
          setActionSheetVisible(false);
          router.push(`/workout/${workoutId}/movement/${movementId}/settings`);
        }}
        onDelete={() => {
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
                  if (!workoutMovement) return;
                  deleteMovementMutation.mutate(
                    {
                      workoutMovementId: workoutMovement.id,
                      workoutId: workoutId,
                    },
                    {
                      onSuccess: () => {
                        router.replace(`/workout/${workoutId}`);
                      },
                    }
                  );
                },
              },
            ]
          );
        }}
      />
    </View>
  );
}
