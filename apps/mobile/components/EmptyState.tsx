import { useThemeColors } from "@hooks/useThemeColors";
import { Text, View } from "react-native";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <Text className="text-foreground font-semibold text-xl mt-4 text-center">
        {title}
      </Text>
      <Text className="text-muted-foreground text-center mt-2">
        {description}
      </Text>
    </View>
  );
}
