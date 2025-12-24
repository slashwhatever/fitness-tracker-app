import {
  useArchiveWorkout,
  useDeleteWorkout,
  useDuplicateWorkout,
  useWorkoutGroups,
  useWorkouts,
  type Workout,
} from "@fitness/shared";
import { useRouter } from "expo-router";
import {
  Archive,
  Copy,
  Dumbbell,
  MoreVertical,
  Pencil,
  Trash,
  Undo2,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WorkoutActionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: "duplicate" | "archive" | "delete" | "edit") => void;
  workoutName: string;
  isArchived: boolean;
}

function WorkoutActionModal({
  visible,
  onClose,
  onSelect,
  workoutName,
  isArchived,
}: WorkoutActionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/80 justify-end" onPress={onClose}>
        <View className="bg-dark-card rounded-t-3xl overflow-hidden pb-8 border-t border-dark-border">
          <View className="p-4 border-b border-dark-border">
            <Text className="text-lg font-semibold text-white text-center">
              {workoutName}
            </Text>
          </View>
          <View className="p-4 gap-2">
            <TouchableOpacity
              className="flex-row items-center p-4 bg-dark-bg/50 rounded-xl gap-4"
              onPress={() => {
                onSelect("edit");
                onClose();
              }}
            >
              <Pencil size={20} color="green" />
              <Text className="text-white font-medium text-lg">
                Edit Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 bg-dark-bg/50 rounded-xl gap-4"
              onPress={() => {
                onSelect("duplicate");
                onClose();
              }}
            >
              <Copy size={20} color="#6366f1" />
              <Text className="text-white font-medium text-lg">Duplicate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 bg-dark-bg/50 rounded-xl gap-4"
              onPress={() => {
                onSelect("archive");
                onClose();
              }}
            >
              {isArchived ? (
                <Undo2 size={20} color="#eab308" />
              ) : (
                <Archive size={20} color="#eab308" />
              )}
              <Text className="text-white font-medium text-lg">
                {isArchived ? "Unarchive" : "Archive"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 bg-red-500/10 rounded-xl gap-4"
              onPress={() => {
                onSelect("delete");
                onClose();
              }}
            >
              <Trash size={20} color="#ef4444" />
              <Text className="text-red-500 font-medium text-lg">Delete</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="mx-4 p-4 bg-dark-bg rounded-xl items-center"
            onPress={onClose}
          >
            <Text className="text-white font-semibold text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

export default function WorkoutsScreen() {
  const { workouts, loading, refetch } = useWorkouts();
  const { groups } = useWorkoutGroups();
  const router = useRouter();

  const archiveMutation = useArchiveWorkout();
  const duplicateMutation = useDuplicateWorkout();
  const deleteMutation = useDeleteWorkout();

  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const sections = useMemo(() => {
    if (!workouts) return [];

    const activeWorkouts = workouts.filter((w) => !w.archived);
    const archivedWorkouts = workouts.filter((w) => w.archived);

    const grouped = new Map<string, { title: string; data: Workout[] }>();
    // Initialize with known groups to preserve order
    groups.forEach((g) => {
      grouped.set(g.id, { title: g.name, data: [] });
    });

    const ungrouped: Workout[] = [];

    activeWorkouts.forEach((w) => {
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

    if (archivedWorkouts.length > 0) {
      result.push({ title: "Archived", data: archivedWorkouts });
    }

    return result;
  }, [workouts, groups]);

  const handleAction = async (
    action: "duplicate" | "archive" | "delete" | "edit"
  ) => {
    if (!selectedWorkout) return;

    try {
      switch (action) {
        case "edit":
          router.push(`/workout/${selectedWorkout.id}/settings`);
          break;
        case "duplicate":
          await duplicateMutation.mutateAsync(selectedWorkout.id);
          break;
        case "archive":
          await archiveMutation.mutateAsync({
            workoutId: selectedWorkout.id,
            archived: !selectedWorkout.archived,
          });
          break;
        case "delete":
          Alert.alert(
            "Delete Workout",
            `Are you sure you want to delete "${selectedWorkout.name}"? This cannot be undone.`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  try {
                    await deleteMutation.mutateAsync(selectedWorkout.id);
                  } catch (error) {
                    Alert.alert("Error", "Failed to delete workout");
                  }
                },
              },
            ]
          );
          break;
      }
    } catch (error) {
      if (action !== "delete") {
        Alert.alert("Error", `Failed to ${action} workout`);
      }
    }
  };

  const renderItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      className={`p-4 rounded-2xl border mb-3 flex-row items-center ${
        item.archived
          ? "bg-dark-bg border-dark-border opacity-60"
          : "bg-dark-card border-dark-border"
      }`}
      onPress={() => router.push(`/workout/${item.id}`)}
    >
      <View
        className={`h-12 w-12 rounded-full items-center justify-center mr-4 ${
          item.archived ? "bg-gray-800" : "bg-primary-500/20"
        }`}
      >
        <Dumbbell size={24} color={item.archived ? "#94a3b8" : "#6366f1"} />
      </View>
      <View className="flex-1">
        <Text className="text-white font-bold text-base">{item.name}</Text>
        <Text className="text-gray-400 text-sm">{item.description}</Text>
      </View>

      <TouchableOpacity
        className="p-2 -mr-2"
        onPress={(e) => {
          e.stopPropagation();
          setSelectedWorkout(item);
          setModalVisible(true);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MoreVertical size={20} color="#94a3b8" />
      </TouchableOpacity>
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
          <View className="flex-row gap-4">
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

      <WorkoutActionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleAction}
        workoutName={selectedWorkout?.name || ""}
        isArchived={selectedWorkout?.archived || false}
      />
    </SafeAreaView>
  );
}
