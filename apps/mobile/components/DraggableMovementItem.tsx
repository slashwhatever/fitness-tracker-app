import { MovementIcon } from "@/components/MovementIcon";
import { type WorkoutMovementWithDetails } from "@hooks/useMovements";
import * as Haptics from "expo-haptics";
import { GripVertical, MoreVertical } from "lucide-react-native";
import { memo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ThemeColors {
  textSecondary: string;
  tint: string;
  card: string;
  border: string;
  text: string;
}

interface DraggableMovementItemProps {
  item: WorkoutMovementWithDetails;
  onPress: (item: WorkoutMovementWithDetails) => void;
  onActionPress: (item: WorkoutMovementWithDetails) => void;
  lastSetDate?: string;
  drag?: () => void; // Optional for drax - DraxListItem handles dragging
  isActive?: boolean; // Optional for drax
  colors: ThemeColors;
}

export const DraggableMovementItem = memo(function DraggableMovementItem({
  item,
  onPress,
  onActionPress,
  lastSetDate,
  drag,
  isActive = false,
  colors,
}: DraggableMovementItemProps) {
  const handleDragStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (drag) {
      drag();
    }
  };

  const containerStyle: ViewStyle = {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    ...(isActive ? { opacity: 0.9 } : {}),
  };

  return (
    <View>
      <TouchableOpacity
        style={containerStyle}
        onPress={() => onPress(item)}
        disabled={isActive}
      >
        <View style={styles.row}>
          {/* Drag Handle - only show if drag prop is provided */}
          {drag && (
            <TouchableOpacity
              onPressIn={handleDragStart}
              style={styles.dragHandle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 5 }}
            >
              <GripVertical size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {/* Always show grip icon for visual consistency when using drax */}
          {!drag && (
            <View style={styles.dragHandle}>
              <GripVertical size={20} color={colors.textSecondary} />
            </View>
          )}

          <View style={styles.content}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.tint + "33" },
              ]}
            >
              <MovementIcon
                trackingType={item.user_movement?.tracking_type}
                size={20}
                color={colors.tint}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>
                {item.user_movement?.name || "Unnamed Movement"}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {lastSetDate || "No sets"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onActionPress(item);
            }}
            style={styles.actionButton}
          >
            <MoreVertical size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dragHandle: {
    paddingRight: 12,
    paddingVertical: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
  },
  subtitle: {
    fontSize: 14,
  },
  actionButton: {
    padding: 8,
  },
});
