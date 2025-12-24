import {
  useUpdateUserMovement,
  useUpdateWorkoutMovementNotes,
  useUserMovement,
  useWorkoutMovements,
} from "@fitness/shared";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Clock, Save, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
        <View className="bg-dark-card rounded-t-3xl overflow-hidden max-h-[70%] border-t border-dark-border">
          <View className="p-4 border-b border-dark-border flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-white">
              Default Rest Timer
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
              <X size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <ScrollView className="p-4">
            {REST_TIMER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.label}
                className={`p-4 rounded-xl mb-2 flex-row justify-between items-center ${
                  currentValue === option.value
                    ? "bg-primary-500/20 border border-primary-500"
                    : "bg-dark-bg/50 border border-transparent"
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
                      : "text-white"
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
  const router = useRouter();

  const { data: movement, isLoading: movementLoading } =
    useUserMovement(movementId);
  const { data: workoutMovements } = useWorkoutMovements(workoutId);

  const updateUserMovementMutation = useUpdateUserMovement();
  const updateWorkoutNotesMutation = useUpdateWorkoutMovementNotes();

  const [name, setName] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [restTimer, setRestTimer] = useState<number | null>(null);

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
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-bg">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-dark-border">
        <TouchableOpacity
          onPress={() =>
            router.replace(`/workout/${workoutId}/movement/${movementId}`)
          }
          className="flex-row items-center p-2 -ml-2"
        >
          <ChevronLeft size={24} color="#fff" />
          <Text className="text-white text-lg font-semibold ml-1">Back</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Movement Settings</Text>
        <View className="w-16" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-6">
          <View className="gap-6">
            <View>
              <Text className="text-sm font-medium text-gray-400 mb-2">
                Movement Name
              </Text>
              <TextInput
                className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-base text-white placeholder:text-gray-600"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Back Squat"
                placeholderTextColor="#64748b"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-400 mb-2">
                Custom Rest Timer
              </Text>
              <TouchableOpacity
                className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowRestTimerModal(true)}
              >
                <View className="flex-row items-center gap-2">
                  <Clock size={20} color="#94a3b8" />
                  <Text className="text-white text-base">
                    {formatDuration(restTimer)}
                  </Text>
                </View>
                <ChevronRight size={20} color="#64748b" />
              </TouchableOpacity>
              <Text className="text-xs text-gray-500 mt-1">
                Overrides workout default for this movement
              </Text>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-400 mb-2">
                Personal Notes
              </Text>
              <TextInput
                className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-base text-white placeholder:text-gray-600 min-h-[100px]"
                value={personalNotes}
                onChangeText={setPersonalNotes}
                placeholder="Technique cues, setup details, etc."
                placeholderTextColor="#64748b"
                multiline
                textAlignVertical="top"
              />
            </View>

            {workoutMovement && (
              <View>
                <Text className="text-sm font-medium text-gray-400 mb-2">
                  Workout Notes
                </Text>
                <TextInput
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-base text-white placeholder:text-gray-600 min-h-[100px]"
                  value={workoutNotes}
                  onChangeText={setWorkoutNotes}
                  placeholder="Notes specific to this workout..."
                  placeholderTextColor="#64748b"
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
    </SafeAreaView>
  );
}
