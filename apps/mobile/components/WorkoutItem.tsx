import { Workout } from "@fitness/shared";
import { useThemeColors } from "@hooks/useThemeColors";
import { useRouter } from "expo-router";
import { Dumbbell, MoreVertical } from "lucide-react-native";
import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface WorkoutItemProps {
  item: Workout;
  onActionPress: (workout: Workout) => void;
}

export const WorkoutItem = memo(function WorkoutItem({
  item,
  onActionPress,
}: WorkoutItemProps) {
  const router = useRouter();
  const colors = useThemeColors();

  return (
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
          onActionPress(item);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MoreVertical size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});
