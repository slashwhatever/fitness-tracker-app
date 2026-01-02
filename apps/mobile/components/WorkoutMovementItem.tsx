import { MovementIcon } from "@/components/MovementIcon";
import { useThemeColors } from "@hooks/useThemeColors";
import { MoreVertical } from "lucide-react-native";
import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface WorkoutMovementItemProps {
  item: any;
  onPress: (item: any) => void;
  onActionPress: (item: any) => void;
  lastSetDate?: string;
}

export const WorkoutMovementItem = memo(function WorkoutMovementItem({
  item,
  onPress,
  onActionPress,
  lastSetDate,
}: WorkoutMovementItemProps) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      className="bg-card p-4 rounded-2xl border border-border mb-3"
      onPress={() => onPress(item)}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="h-10 w-10 rounded-full bg-primary-500/20 items-center justify-center mr-3">
            <MovementIcon
              trackingType={item.user_movement?.tracking_type}
              size={20}
            />
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-bold text-base">
              {item.user_movement?.name}
            </Text>
            <Text className="text-slate-500 dark:text-gray-400 text-sm">
              {lastSetDate || "No sets"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onActionPress(item);
          }}
          className="p-2"
        >
          <MoreVertical size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});
