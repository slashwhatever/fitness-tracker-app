import {
  useCreateSet,
  useDeleteSet,
  useDeleteWorkoutMovement,
  useSetsByMovement,
  useUserMovement,
  useUserProfile,
  useWorkout,
  useWorkoutMovements,
} from "@fitness/shared";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  Check,
  Copy,
  MoreVertical,
  Pencil,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
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
import { EditSetSheet } from "../../../../components/EditSetSheet";
import { GlassHeader } from "../../../../components/GlassHeader";
import { MovementActionSheet } from "../../../../components/MovementActionSheet";
import { SessionComparison } from "../../../../components/SessionComparison";
import { SetAdjuster } from "../../../../components/SetAdjuster";
import { TimedConfirmDeleteButton } from "../../../../components/TimedConfirmDeleteButton";

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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <View className="bg-white dark:bg-dark-card rounded-t-3xl overflow-hidden pb-8 border-t border-slate-200 dark:border-dark-border">
          <View className="p-4 border-b border-slate-200 dark:border-dark-border">
            <Text className="text-lg font-semibold text-slate-900 dark:text-white text-center">
              {setDetails}
            </Text>
          </View>
          <View className="p-4 gap-2">
            <TouchableOpacity
              className="flex-row items-center p-4 bg-slate-50 dark:bg-dark-bg/50 rounded-xl gap-4"
              onPress={() => {
                onSelect("edit");
                onClose();
              }}
            >
              <Pencil size={20} color="green" />
              <Text className="text-slate-900 dark:text-white font-medium text-lg">
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 bg-slate-50 dark:bg-dark-bg/50 rounded-xl gap-4"
              onPress={() => {
                onSelect("duplicate");
                onClose();
              }}
            >
              <Copy size={20} color="#6366f1" />
              <Text className="text-slate-900 dark:text-white font-medium text-lg">
                Duplicate
              </Text>
            </TouchableOpacity>

            <TimedConfirmDeleteButton
              onConfirm={() => {
                onSelect("delete");
                onClose();
              }}
            />
          </View>
          <TouchableOpacity
            className="mx-4 p-4 bg-slate-50 dark:bg-dark-bg rounded-xl items-center"
            onPress={onClose}
          >
            <Text className="text-slate-900 dark:text-white font-semibold text-lg">
              Cancel
            </Text>
          </TouchableOpacity>
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#ffffff" : "#94a3b8"; // white : slate-400
  const headerIconColor = isDark ? "#ffffff" : "#0f172a"; // white : slate-900
  const calendarIconColor = isDark ? "#ffffff" : "#0f172a"; // white : slate-900 Note: text-slate-900 is 0f172a

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
  const [rpe, setRpe] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const [selectedSet, setSelectedSet] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editSheetVisible, setEditSheetVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const deleteMovementMutation = useDeleteWorkoutMovement();

  // Initialize with values from the most recent set if available
  useEffect(() => {
    if (sets && sets.length > 0) {
      const lastSet = sets[0];
      setWeight(lastSet.weight?.toString() || "0");
      setReps(lastSet.reps?.toString() || "0");
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

  const handleLogSet = async () => {
    if (!workoutId || !movementId) return;

    try {
      await createSetMutation.mutateAsync({
        workout_id: workoutId,
        user_movement_id: movementId,
        weight: parseFloat(weight) || 0,
        reps: parseInt(reps) || 0,
        rpe: rpe,
        notes: notes.trim() || undefined,
      });
      // Optional: Give feedback or clear inputs
    } catch (error) {
      Alert.alert("Error", "Failed to log set");
    }
  };

  const handleSetAction = async (action: "duplicate" | "edit" | "delete") => {
    if (!selectedSet) return;

    try {
      switch (action) {
        case "delete":
          await deleteSetMutation.mutateAsync(selectedSet.id);
          break;
        case "duplicate":
          await createSetMutation.mutateAsync({
            workout_id: workoutId,
            user_movement_id: movementId,
            weight: selectedSet.weight,
            reps: selectedSet.reps,
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
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-dark-bg items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  if (!movement) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-dark-bg items-center justify-center">
        <Text className="text-slate-900 dark:text-white text-lg">
          Movement not found
        </Text>
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
    <View className="flex-1 bg-slate-50 dark:bg-dark-bg">
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
            <MoreVertical size={24} color={headerIconColor} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 120 }}
      >
        <View className="px-4 mb-6">
          <Text className="text-3xl font-bold text-slate-900 dark:text-white text-left">
            {movement.name}
          </Text>
        </View>
        {/* Input Section */}
        <View className="p-4 gap-6">
          <View className="flex-row gap-4 justify-between">
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
          </View>

          <TouchableOpacity
            className="bg-green-600 rounded-full py-4 items-center flex-row justify-center gap-2 active:bg-green-700"
            onPress={handleLogSet}
            disabled={createSetMutation.isPending}
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

          <View className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-3">
            <TextInput
              placeholder="Add note..."
              placeholderTextColor="#9ca3af"
              className="text-slate-900 dark:text-white text-base"
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
            <Calendar size={24} color={calendarIconColor} />
            <Text className="text-lg font-bold text-slate-900 dark:text-white">
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
                  className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border mb-4 overflow-hidden"
                >
                  <View className="bg-slate-50/50 dark:bg-dark-bg/50 p-3 border-b border-slate-200 dark:border-dark-border gap-1">
                    <Text className="text-slate-700 dark:text-gray-300 font-semibold text-base">
                      {date}
                    </Text>
                    {showComparison && (
                      <>
                        <Text className="text-xs text-gray-500">
                          Compared to previous
                        </Text>

                        {/* Use SessionComparison Component */}
                        <View className="border-slate-200/50 dark:border-dark-border/50">
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
                            ? "border-b border-slate-100 dark:border-dark-border/30"
                            : ""
                        }`}
                      >
                        <View className="flex-row items-center gap-2">
                          <Text className="text-slate-900 dark:text-white font-bold text-xl text-center">
                            {set.reps}
                          </Text>
                          <Text className="text-slate-500 dark:text-gray-500 text-sm">
                            reps x
                          </Text>
                          <Text className="text-slate-900 dark:text-white font-bold text-xl text-center">
                            {set.weight}
                          </Text>
                          <Text className="text-slate-500 dark:text-gray-500 text-sm">
                            {profile?.weight_unit || "kg"}
                          </Text>
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
                          <MoreVertical size={20} color={iconColor} />
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
            ? `${selectedSet.reps} reps x ${selectedSet.weight} ${
                profile?.weight_unit || "kg"
              }`
            : ""
        }
      />
      <EditSetSheet
        visible={editSheetVisible}
        onClose={() => setEditSheetVisible(false)}
        set={selectedSet}
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
