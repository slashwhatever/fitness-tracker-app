import { GlassHeader } from "@/components/GlassHeader";
import { useBottomPadding } from "@hooks/useBottomPadding";
import { useHeaderPadding } from "@hooks/useHeaderPadding";
import {
  useUpdateUserMovement,
  useUpdateWorkoutMovementNotes,
  useUserMovement,
  useWorkoutMovements,
} from "@hooks/useMovements";
import { useThemeColors } from "@hooks/useThemeColors";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Clock, Save, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const REST_TIMER_OPTIONS = [
  { label: "None", value: null },
  { label: "30 sec", value: 30 },
  { label: "45 sec", value: 45 },
  { label: "1 min", value: 60 },
  { label: "1 min 30 sec", value: 90 },
  { label: "2 min", value: 120 },
  { label: "2 min 30 sec", value: 150 },
  { label: "3 min", value: 180 },
  { label: "4 min", value: 240 },
  { label: "5 min", value: 300 },
];

function formatDuration(seconds: number | null) {
  if (!seconds) return "None";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0 && secs > 0) return `${mins} min ${secs} sec`;
  if (mins > 0) return `${mins} min`;
  return `${secs} sec`;
}

interface RestTimerSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: number | null) => void;
  currentValue: number | null;
}

function RestTimerSelectModal({
  visible,
  onClose,
  onSelect,
  currentValue,
}: RestTimerSelectModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <View className="bg-card rounded-t-3xl overflow-hidden max-h-[70%] border-t border-border">
          <View className="p-4 border-b border-border flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-foreground">
              Default Rest Timer
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
              <X size={24} className="text-slate-400 dark:text-slate-500" />
            </TouchableOpacity>
          </View>
          <ScrollView className="p-4">
            {REST_TIMER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.label}
                className={`p-4 rounded-xl mb-2 flex-row justify-between items-center ${
                  currentValue === option.value
                    ? "bg-primary-500/20 border border-primary-500"
                    : "bg-background/50 border border-transparent"
                }`}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text
                  className={`font-medium text-lg ${
                    currentValue === option.value
                      ? "text-primary-500 font-bold"
                      : "text-foreground"
                  }`}
                >
                  {option.label}
                </Text>
                {currentValue === option.value && (
                  <View className="w-4 h-4 rounded-full bg-primary-500" />
                )}
              </TouchableOpacity>
            ))}
            <View className="h-8" />
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

export default function MovementSettingsScreen() {
  const { id: workoutId, movementId } = useLocalSearchParams<{
    id: string;
    movementId: string;
  }>();
  const headerPadding = useHeaderPadding();
  const bottomPadding = useBottomPadding();
  const router = useRouter();
  const colors = useThemeColors();

  const { data: movement, isLoading: movementLoading } =
    useUserMovement(movementId);
  const { data: workoutMovements } = useWorkoutMovements(workoutId);

  const updateUserMovementMutation = useUpdateUserMovement();
  const updateWorkoutNotesMutation = useUpdateWorkoutMovementNotes();

  const [name, setName] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [isReverseWeight, setIsReverseWeight] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);

  // Find workout movement context
  const workoutMovement = workoutMovements?.find(
    (wm) => wm.user_movement_id === movementId
  );

  useEffect(() => {
    if (movement) {
      setName(movement.name);
      setPersonalNotes(movement.personal_notes || "");
      setRestTimer(movement.custom_rest_timer || null);
      setIsReverseWeight(movement.is_reverse_weight || false);
    }
  }, [movement]);

  useEffect(() => {
    if (workoutMovement) {
      setWorkoutNotes(workoutMovement.workout_notes || "");
    }
  }, [workoutMovement]);

  const handleSave = async () => {
    if (!movement || !name.trim()) return;

    setIsSaving(true);
    try {
      // Update movement details
      await updateUserMovementMutation.mutateAsync({
        id: movement.id,
        updates: {
          name: name.trim(),
          personal_notes: personalNotes.trim() || null,
          custom_rest_timer: restTimer,
          is_reverse_weight: isReverseWeight,
        },
      });

      // Update workout-specific notes
      if (workoutMovement) {
        await updateWorkoutNotesMutation.mutateAsync({
          workoutMovementId: workoutMovement.id,
          workout_notes: workoutNotes.trim() || null,
        });
      }

      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update movement settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (movementLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          header: () => (
            <GlassHeader
              title="Movement Settings"
              onBack={() => router.back()}
            />
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            padding: 24,
            paddingTop: headerPadding + 24,
            paddingBottom: bottomPadding,
          }}
        >
          <View className="gap-6">
            <View>
              <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
                Movement Name
              </Text>
              <TextInput
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-gray-400 dark:placeholder:text-gray-600"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Back Squat"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
                Custom Rest Timer
              </Text>
              <TouchableOpacity
                className="w-full bg-card border border-border rounded-xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowRestTimerModal(true)}
              >
                <View className="flex-row items-center gap-2">
                  <Clock size={20} color={colors.textSecondary} />
                  <Text className="text-foreground text-base">
                    {formatDuration(restTimer)}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text className="text-xs text-gray-500 mt-1">
                Overrides workout default for this movement
              </Text>
            </View>

            <View>
              <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
                Reverse Weight Tracking
              </Text>
              <View className="w-full bg-card border border-border rounded-xl px-4 py-3 flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-foreground text-base font-medium">
                    Less weight is better
                  </Text>
                  <Text className="text-slate-500 dark:text-gray-400 text-xs mt-1">
                    Enable for assisted exercises where reducing weight
                    indicates progress
                  </Text>
                </View>
                <Switch
                  value={isReverseWeight}
                  onValueChange={setIsReverseWeight}
                  trackColor={{
                    false: colors.border,
                    true: colors["muted-foreground"],
                  }}
                  thumbColor="white"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
                Personal Notes
              </Text>
              <TextInput
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-gray-400 dark:placeholder:text-gray-600 min-h-[100px]"
                value={personalNotes}
                onChangeText={setPersonalNotes}
                placeholder="Technique cues, setup details, etc."
                placeholderTextColor={colors.textSecondary}
                multiline
                textAlignVertical="top"
              />
            </View>

            {workoutMovement && (
              <View>
                <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
                  Workout Notes
                </Text>
                <TextInput
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-gray-400 dark:placeholder:text-gray-600 min-h-[100px]"
                  value={workoutNotes}
                  onChangeText={setWorkoutNotes}
                  placeholder="Notes specific to this workout..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  textAlignVertical="top"
                />
                <Text className="text-xs text-gray-500 mt-1">
                  Only applies to this movement within this specific workout
                </Text>
              </View>
            )}

            <TouchableOpacity
              className={`w-full p-4 rounded-xl items-center flex-row justify-center gap-2 mt-4 ${
                !name.trim() || isSaving
                  ? "bg-primary-500/50"
                  : "bg-primary-500"
              }`}
              onPress={handleSave}
              disabled={!name.trim() || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Save size={20} color="white" />
              )}
              <Text className="text-white font-bold text-lg">
                {isSaving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>

            <View className="h-20" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <RestTimerSelectModal
        visible={showRestTimerModal}
        onClose={() => setShowRestTimerModal(false)}
        onSelect={setRestTimer}
        currentValue={restTimer}
      />
    </View>
  );
}
