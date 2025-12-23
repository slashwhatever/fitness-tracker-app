import { useWorkout, useWorkoutMovements } from "@fitness/shared";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Dumbbell, MoreVertical } from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: workout, isLoading: workoutLoading } = useWorkout(id);
  const { data: movements, isLoading: movementsLoading } =
    useWorkoutMovements(id);

  const loading = workoutLoading || movementsLoading;

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

  const renderMovement = ({ item }: { item: any }) => (
    <View className="bg-dark-card p-4 rounded-xl border border-dark-border mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View className="h-10 w-10 rounded-full bg-secondary-500/20 items-center justify-center mr-3">
            <Dumbbell size={20} color="#ec4899" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base">
              {item.user_movement?.name}
            </Text>
            <Text className="text-gray-400 text-xs uppercase">
              {item.user_movement?.tracking_type}
            </Text>
          </View>
        </View>
      </View>
      {/* Placeholder for sets - can be expanded later */}
      <View className="mt-2 bg-dark-bg/50 p-2 rounded-lg">
        <Text className="text-gray-500 text-xs text-center">
          Tap to log sets (Coming Soon)
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-bg p-4 pb-0">
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
          <Text className="text-gray-400 text-base">{workout.description}</Text>
        )}
        <Text className="text-gray-500 text-sm mt-2">
          Created {format(new Date(workout.created_at), "MMM d, yyyy")}
        </Text>
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
    </SafeAreaView>
  );
}
