import { useCreateWorkout, useWorkoutGroups } from "@fitness/shared";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewWorkoutScreen() {
  const router = useRouter();
  const createWorkout = useCreateWorkout();
  const { groups } = useWorkoutGroups();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a workout name");
      return;
    }

    try {
      await createCreate.mutateAsync({
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

  // Fix naming confusion: hook returns mutation object directly?
  // Checking useWorkouts.ts: export function useCreateWorkout() { return useMutation(...) }
  // So createWorkout IS the mutation object.
  const createCreate = createWorkout;

  return (
    <SafeAreaView
      className="flex-1 bg-slate-50 dark:bg-dark-bg p-4"
      edges={["bottom", "left", "right"]}
    >
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center p-2"
        >
          <ChevronLeft size={24} className="text-slate-900 dark:text-white" />
          <Text className="text-slate-900 dark:text-white text-lg font-semibold ml-1">
            Cancel
          </Text>
        </TouchableOpacity>
        <Text className="text-slate-900 dark:text-white text-lg font-bold">
          New Workout
        </Text>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={createCreate.isPending}
          className="bg-primary-500 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className="mb-6">
          <Text className="text-slate-500 dark:text-gray-400 mb-2 ml-1">
            Name
          </Text>
          <TextInput
            className="bg-white dark:bg-dark-card text-slate-900 dark:text-white p-4 rounded-xl border border-slate-200 dark:border-dark-border"
            placeholder="e.g., Upper Body Power"
            placeholderTextColor="#94a3b8"
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
            className="bg-white dark:bg-dark-card text-slate-900 dark:text-white p-4 rounded-xl border border-slate-200 dark:border-dark-border min-h-[100]"
            placeholder="Notes regarding this workout..."
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
