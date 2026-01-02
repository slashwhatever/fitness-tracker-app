import { memo } from "react";
import { Text, View } from "react-native";

interface AddMovementSectionHeaderProps {
  title: string;
  count: number;
}

export const AddMovementSectionHeader = memo(function AddMovementSectionHeader({
  title,
  count,
}: AddMovementSectionHeaderProps) {
  return (
    <View className="py-2 bg-card">
      <Text className="text-slate-500 dark:text-gray-400 text-sm font-semibold uppercase">
        {title} ({count})
      </Text>
    </View>
  );
});
