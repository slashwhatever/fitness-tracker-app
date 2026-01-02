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
import { useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, Text, View } from "react-native";

import { WorkoutItem } from "@/components/WorkoutItem";
import { WorkoutSectionHeader } from "@/components/WorkoutSectionHeader";
import { FlashList } from "@shopify/flash-list";
import { useCallback } from "react";

type ListItem =
  | { type: "header"; id: string; title: string }
  | { type: "item"; data: Workout };

export default function WorkoutsScreen() {
  const { workouts, isLoading, refetch } = useWorkouts();
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

  const toggleSection = useCallback((id: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

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
        grouped.get(w.group_id)!.data.push(w);
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

  const flatListData = useMemo(() => {
    const data: ListItem[] = [];
    sections.forEach((section) => {
      data.push({
        type: "header",
        id: section.id,
        title: section.title,
      });
      if (!collapsedSections[section.id]) {
        section.data.forEach((workout) => {
          data.push({ type: "item", data: workout });
        });
      }
    });
    return data;
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

  const openActionSheet = useCallback((workout: Workout) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "header") {
        return (
          <WorkoutSectionHeader
            id={item.id}
            title={item.title}
            isCollapsed={!!collapsedSections[item.id]}
            onToggle={toggleSection}
          />
        );
      }
      return <WorkoutItem item={item.data} onActionPress={openActionSheet} />;
    },
    [collapsedSections, toggleSection, openActionSheet]
  );

  const headerPadding = useHeaderPadding();
  const bottomPadding = useBottomPadding();

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={flatListData}
        renderItem={renderItem}
        getItemType={(item) => item.type}
        // @ts-expect-error - FlashList types might be incompatible with React 19
        estimatedItemSize={88}
        contentContainerStyle={{
          padding: 16,
          paddingTop: headerPadding + 16,
          paddingBottom: bottomPadding,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="flex-row items-center justify-end gap-4 mb-4">
            <Pressable
              className="bg-card border border-border px-4 py-2 rounded-full"
              onPress={() => router.push("/groups/modal")}
            >
              <Text className="text-foreground font-semibold">Groups</Text>
            </Pressable>
            <Pressable
              className="bg-primary-500 px-4 py-2 rounded-full"
              onPress={() => router.push("/workout/new")}
            >
              <Text className="text-white font-semibold">+ New</Text>
            </Pressable>
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
