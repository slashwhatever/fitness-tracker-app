import { useThemeColors } from "@hooks/useThemeColors";
import { MoreVertical } from "lucide-react-native";
import { memo } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface GroupItemProps {
  item: any;
  isEditing: boolean;
  editingName: string;
  onEditChange: (text: string) => void;
  onRenameSubmit: (id: string) => void;
  onActionPress: (item: any) => void;
}

export const GroupItem = memo(function GroupItem({
  item,
  isEditing,
  editingName,
  onEditChange,
  onRenameSubmit,
  onActionPress,
}: GroupItemProps) {
  const colors = useThemeColors();

  return (
    <View className="bg-card border border-border rounded-xl p-4 mb-3">
      <View className="flex-row items-center">
        <View className="flex-1">
          {isEditing ? (
            <TextInput
              className="text-foreground font-semibold text-lg bg-input border border-border rounded-lg px-3 py-2"
              value={editingName}
              onChangeText={onEditChange}
              onSubmitEditing={() => onRenameSubmit(item.id)}
              onBlur={() => onRenameSubmit(item.id)}
              autoFocus
              returnKeyType="done"
            />
          ) : (
            <>
              <Text className="text-foreground font-semibold text-lg">
                {item.name}
              </Text>
              <Text className="text-muted-foreground text-sm mt-0.5">
                {item.workout_count}{" "}
                {item.workout_count === 1 ? "workout" : "workouts"}
              </Text>
            </>
          )}
        </View>
        {!isEditing && (
          <TouchableOpacity
            onPress={() => onActionPress(item)}
            className="p-2 -mr-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});
