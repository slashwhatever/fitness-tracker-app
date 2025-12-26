import { useUpdateWorkout, useWorkout } from "@fitness/shared";
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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GlassHeader } from "../../../components/GlassHeader";
import { useBottomPadding } from "../../../hooks/useBottomPadding";
import { useHeaderPadding } from "../../../hooks/useHeaderPadding";

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
        <View className="bg-white dark:bg-dark-card rounded-t-3xl overflow-hidden max-h-[70%] border-t border-slate-200 dark:border-dark-border">
          <View className="p-4 border-b border-slate-200 dark:border-dark-border flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-slate-900 dark:text-white">
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
                    : "bg-slate-50 dark:bg-dark-bg/50 border border-transparent"
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

export default function WorkoutSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const headerPadding = useHeaderPadding();
  const bottomPadding = useBottomPadding();
  const router = useRouter();
  const { data: workout, isLoading } = useWorkout(id);
  const updateMutation = useUpdateWorkout();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultRestTimer, setDefaultRestTimer] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);

  useEffect(() => {
    if (workout) {
      setName(workout.name);
      setDescription(workout.description || "");
      setDefaultRestTimer(workout.default_rest_timer || null);
    }
  }, [workout]);

  const handleSave = async () => {
    if (!workout || !name.trim()) return;

    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        id: workout.id,
        updates: {
          name: name.trim(),
          description: description.trim() || null,
          default_rest_timer: defaultRestTimer,
        },
      });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update workout");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-dark-bg items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-dark-bg">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          header: () => (
            <GlassHeader
              title="Workout Settings"
              backPath={`/workouts/${id}`}
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
          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
                Workout Name
              </Text>
              <TextInput
                className="w-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Upper Body Power"
                placeholderTextColor="#64748b"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
                Description (Optional)
              </Text>
              <TextInput
                className="w-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 min-h-[100px]"
                value={description}
                onChangeText={setDescription}
                placeholder="Add notes about this workout..."
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
                Default Rest Timer
              </Text>
              <TouchableOpacity
                className="w-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowRestTimerModal(true)}
              >
                <View className="flex-row items-center gap-2">
                  <Clock
                    size={20}
                    className="text-slate-400 dark:text-slate-500"
                  />
                  <Text className="text-slate-900 dark:text-white text-base">
                    {formatDuration(defaultRestTimer)}
                  </Text>
                </View>
                <ChevronRight
                  size={20}
                  className="text-slate-400 dark:text-slate-500"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className={`w-full p-4 rounded-xl items-center flex-row justify-center gap-2 ${
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <RestTimerSelectModal
        visible={showRestTimerModal}
        onClose={() => setShowRestTimerModal(false)}
        onSelect={setDefaultRestTimer}
        currentValue={defaultRestTimer}
      />
    </View>
  );
}
