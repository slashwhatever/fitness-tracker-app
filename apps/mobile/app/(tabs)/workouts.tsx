import { useWorkoutGroups, useWorkouts } from "@fitness/shared";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { ChevronRight, Dumbbell } from "lucide-react-native";
import { useMemo } from "react";
import {
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutsScreen() {
  const { workouts, loading, refetch } = useWorkouts();
  const { groups } = useWorkoutGroups();
  const router = useRouter();

  const sections = useMemo(() => {
    if (!workouts) return [];

    const grouped = new Map();
    // Initialize with known groups to preserve order
    groups.forEach((g) => {
      grouped.set(g.id, { title: g.name, data: [] });
    });

    const ungrouped: typeof workouts = [];

    workouts.forEach((w) => {
      if (w.group_id && grouped.has(w.group_id)) {
        grouped.get(w.group_id).data.push(w);
      } else {
        ungrouped.push(w);
      }
    });

    const result = Array.from(grouped.values()).filter(
      (g) => g.data.length > 0
    );

    if (ungrouped.length > 0) {
      result.push({ title: "Other Workouts", data: ungrouped });
    }

    return result;
  }, [workouts, groups]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-dark-card p-4 rounded-2xl border border-dark-border mb-3 flex-row items-center"
      onPress={() => router.push(`/workout/${item.id}`)}
    >
      <View className="h-12 w-12 rounded-full bg-primary-500/20 items-center justify-center mr-4">
        <Dumbbell size={24} color="#6366f1" />
      </View>
      <View className="flex-1">
        <Text className="text-white font-bold text-base">{item.name}</Text>
        <Text className="text-gray-400 text-sm">
          {item.created_at
            ? format(new Date(item.created_at), "MMM d, yyyy")
            : "No date"}
        </Text>
      </View>
      <ChevronRight size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => (
    <View className="bg-dark-bg py-2 mb-2">
      <Text className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
        {title}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-bg">
      <View className="flex-1 p-4 pb-0">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-white">Workouts</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="bg-dark-card border border-dark-border px-4 py-2 rounded-full"
              onPress={() => router.push("/groups/modal")}
            >
              <Text className="text-white font-semibold">Groups</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-primary-500 px-4 py-2 rounded-full"
              onPress={() => router.push("/workout/new")}
            >
              <Text className="text-white font-semibold">+ New</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor="#fff"
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View className="items-center justify-center py-20">
                <Text className="text-gray-500 text-lg">No workouts found</Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
