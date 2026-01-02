import { useThemeColors } from "@hooks/useThemeColors";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import React, { memo } from "react";
import { Text, TouchableOpacity } from "react-native";

interface WorkoutSectionHeaderProps {
  id: string;
  title: string;
  isCollapsed: boolean;
  onToggle: (id: string) => void;
}

export const WorkoutSectionHeader = memo(function WorkoutSectionHeader({
  id,
  title,
  isCollapsed,
  onToggle,
}: WorkoutSectionHeaderProps) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      onPress={() => onToggle(id)}
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
});
