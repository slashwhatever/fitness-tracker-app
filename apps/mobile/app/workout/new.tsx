import { REST_TIMER_HEIGHT } from "@/components/RestTimer";
import { useRestTimer } from "@fitness/shared";
import { useBottomPadding } from "@hooks/useBottomPadding";
import { useThemeColors } from "@hooks/useThemeColors";
import { useWorkoutGroups } from "@hooks/useWorkoutGroups";
import { useCreateWorkout } from "@hooks/useWorkouts";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NewWorkoutScreen() {
  const router = useRouter();
  const createWorkout = useCreateWorkout();
  const { groups } = useWorkoutGroups();
  const colors = useThemeColors();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a workout name");
      return;
    }

    try {
      await createWorkout.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        group_id: selectedGroupId,
        archived: false,
      });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to create workout");
    }
  };

  const bottomPadding = useBottomPadding();
  const insets = useSafeAreaInsets();
  const { isActive, isCompleted } = useRestTimer();
  const timerHeight = isActive || isCompleted ? REST_TIMER_HEIGHT : 0;

  return (
    <View
      className="flex-1 bg-background px-4"
      style={{ paddingTop: insets.top + timerHeight + 16 }}
    >
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center p-2"
        >
          <ChevronLeft size={24} color={colors.text} />
          <Text className="text-foreground text-lg font-semibold ml-1">
            Cancel
          </Text>
        </TouchableOpacity>
        <Text className="text-foreground text-lg font-bold">New Workout</Text>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={createWorkout.isPending}
          className="bg-primary-500 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottomPadding }}
      >
        <View className="mb-6">
          <Text className="text-slate-500 dark:text-gray-400 mb-2 ml-1">
            Name
          </Text>
          <TextInput
            className="bg-card text-foreground p-4 rounded-xl border border-border"
            placeholder="e.g., Upper Body Power"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        <View className="mb-6">
          <Text className="text-slate-500 dark:text-gray-400 mb-2 ml-1">
            Group (Optional)
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            <TouchableOpacity
              onPress={() => setSelectedGroupId(null)}
              className={`mr-3 px-4 py-2 rounded-full border ${
                selectedGroupId === null
                  ? "bg-primary-500 border-primary-500"
                  : "bg-transparent border-slate-300 dark:border-gray-600"
              }`}
            >
              <Text
                className={
                  selectedGroupId === null
                    ? "text-white"
                    : "text-slate-500 dark:text-gray-400"
                }
              >
                None
              </Text>
            </TouchableOpacity>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                onPress={() => setSelectedGroupId(group.id)}
                className={`mr-3 px-4 py-2 rounded-full border ${
                  selectedGroupId === group.id
                    ? "bg-primary-500 border-primary-500"
                    : "bg-transparent border-slate-300 dark:border-gray-600"
                }`}
              >
                <Text
                  className={
                    selectedGroupId === group.id
                      ? "text-white"
                      : "text-slate-500 dark:text-gray-400"
                  }
                >
                  {group.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="mb-6">
          <Text className="text-slate-500 dark:text-gray-400 mb-2 ml-1">
            Description (Optional)
          </Text>
          <TextInput
            className="bg-card text-foreground p-4 rounded-xl border border-border min-h-[100]"
            placeholder="Notes regarding this workout..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </View>
  );
}
