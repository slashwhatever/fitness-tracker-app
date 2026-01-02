import { MovementIcon } from "@/components/MovementIcon";
import { useThemeColors } from "@hooks/useThemeColors";
import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface AddMovementItemProps {
  item: {
    id: string;
    name: string;
    muscle_groups: string[];
    tracking_type: string;
    isExisting: boolean;
  };
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (id: string, isExisting: boolean) => void;
}

export const AddMovementItem = memo(function AddMovementItem({
  item,
  isSelected,
  isDisabled,
  onToggle,
}: AddMovementItemProps) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      className={`p-4 rounded-xl mb-2 flex-row items-center ${
        isDisabled
          ? "bg-background/30 opacity-50"
          : isSelected
            ? "bg-primary-500/20"
            : "bg-background/50"
      }`}
      style={
        !isDisabled && isSelected
          ? {
              boxShadow: `${colors.tint} 0px 0px 1px 1px`,
            }
          : undefined
      }
      onPress={() => onToggle(item.id, item.isExisting)}
      disabled={isDisabled}
    >
      <View className="h-10 w-10 rounded-full bg-primary-500/20 items-center justify-center mr-3">
        <MovementIcon trackingType={item.tracking_type} size={20} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-foreground font-semibold text-base">
            {item.name}
          </Text>
          {item.isExisting && (
            <View className="bg-green-500/20 px-2 py-0.5 rounded-full">
              <Text className="text-green-600 dark:text-green-400 text-xs font-medium">
                Added
              </Text>
            </View>
          )}
        </View>
        <Text className="text-slate-500 dark:text-gray-400 text-sm">
          {item.muscle_groups.join(", ") || item.tracking_type}
        </Text>
      </View>
      <View
        className={`h-6 w-6 rounded-full border-2 items-center justify-center ${
          isSelected
            ? "bg-primary-500 border-primary-500"
            : "border-slate-300 dark:border-gray-600"
        }`}
      >
        {isSelected && <View className="h-3 w-3 rounded-full bg-white" />}
      </View>
    </TouchableOpacity>
  );
});
