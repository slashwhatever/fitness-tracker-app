import { WorkoutActionSheet } from "@/components/WorkoutActionSheet";
import type { Workout } from "@fitness/shared";
import { useBottomPadding } from "@hooks/useBottomPadding";
import { useHeaderPadding } from "@hooks/useHeaderPadding";
import { useThemeColors } from "@hooks/useThemeColors";
import { useWorkoutGroups } from "@hooks/useWorkoutGroups";
import {
  useArchiveWorkout,
  useDeleteWorkout,
  useDuplicateWorkout,
  useWorkouts,
} from "@hooks/useWorkouts";
import { useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronRight,
  Dumbbell,
  MoreVertical,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WorkoutsScreen() {
  const { workouts, isLoading, error, refetch, isRefetching } = useWorkouts();
  const { groups } = useWorkoutGroups();
  const router = useRouter();
  const colors = useThemeColors();

  const archiveMutation = useArchiveWorkout();
  const duplicateMutation = useDuplicateWorkout();
  const deleteMutation = useDeleteWorkout();

  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({ archived: true });

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sections = useMemo(() => {
    if (!workouts) return [];

    const activeWorkouts = workouts.filter((w) => !w.archived);
    const archivedWorkouts = workouts.filter((w) => w.archived);

    const grouped = new Map<
      string,
      { id: string; title: string; data: Workout[] }
    >();
    // Initialize with known groups to preserve order
    groups.forEach((g) => {
      grouped.set(g.id, { id: g.id, title: g.name, data: [] });
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
      result.push({ id: "other", title: "Other Workouts", data: ungrouped });
    }

    if (archivedWorkouts.length > 0) {
      result.push({
        id: "archived",
        title: "Archived",
        data: archivedWorkouts,
      });
    }

    return result;
  }, [workouts, groups]);

  const displaySections = useMemo(() => {
    return sections.map((section) => ({
      ...section,
      data: collapsedSections[section.id] ? [] : section.data,
    }));
  }, [sections, collapsedSections]);

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
          try {
            await deleteMutation.mutateAsync(selectedWorkout.id);
          } catch (error) {
            Alert.alert("Error", "Failed to delete workout");
          }
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
          ? "bg-slate-100 dark:bg-background border-border opacity-60"
          : "bg-card border-border"
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
        <Text className="text-foreground font-bold text-base">{item.name}</Text>
        {item.description && (
          <Text className="text-slate-500 dark:text-gray-400 text-sm">
            {item.description}
          </Text>
        )}
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
        <MoreVertical size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({
    section: { id, title },
  }: {
    section: { id: string; title: string };
  }) => {
    const isCollapsed = collapsedSections[id];
    return (
      <TouchableOpacity
        onPress={() => toggleSection(id)}
        className="bg-background py-2 mb-2 flex-row items-center justify-between"
      >
        <Text className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
          {title}
        </Text>
        {isCollapsed ? (
          <ChevronRight size={16} color={colors.icon} />
        ) : (
          <ChevronDown size={16} color={colors.icon} />
        )}
      </TouchableOpacity>
    );
  };

  const headerPadding = useHeaderPadding();
  const bottomPadding = useBottomPadding();

  return (
    <View className="flex-1 bg-background">
      <SectionList
        sections={displaySections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingTop: headerPadding + 16,
          paddingBottom: bottomPadding,
          gap: 4,
        }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View className="flex-row items-center justify-end gap-4">
            <TouchableOpacity
              className="bg-card border border-border px-4 py-2 rounded-full"
              onPress={() => router.push("/groups/modal")}
            >
              <Text className="text-foreground font-semibold">Groups</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-primary-500 px-4 py-2 rounded-full"
              onPress={() => router.push("/workout/new")}
            >
              <Text className="text-white font-semibold">+ New</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.tint}
            progressViewOffset={headerPadding}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-20">
              <Text className="text-gray-500 text-lg">No workouts found</Text>
            </View>
          ) : null
        }
      />

      <WorkoutActionSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleAction}
        workoutName={selectedWorkout?.name || ""}
        isArchived={selectedWorkout?.archived || false}
      />
    </View>
  );
}
