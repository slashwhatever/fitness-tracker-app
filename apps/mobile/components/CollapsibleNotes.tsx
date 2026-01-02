import { useThemeColors } from "@hooks/useThemeColors";
import { ChevronDown, ChevronUp, FileText } from "lucide-react-native";
import { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleNotesProps {
  personalNotes?: string | null;
  workoutNotes?: string | null;
}

export function CollapsibleNotes({
  personalNotes,
  workoutNotes,
}: CollapsibleNotesProps) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(false);

  // Don't render if no notes available
  if (!personalNotes && !workoutNotes) {
    return null;
  }

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const hasNotes =
    (personalNotes && personalNotes.trim()) ||
    (workoutNotes && workoutNotes.trim());

  if (!hasNotes) {
    return null;
  }

  return (
    <View className="px-4 mb-4">
      <TouchableOpacity
        onPress={toggleExpanded}
        className="flex-row items-center justify-between bg-card border border-border rounded-xl px-4 py-3"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center gap-2">
          <FileText size={18} color={colors.textSecondary} />
          <Text className="text-foreground font-medium">Notes</Text>
        </View>
        {expanded ? (
          <ChevronUp size={20} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      {expanded && (
        <View className="bg-card border border-t-0 border-border rounded-b-xl -mt-1 px-4 py-3 gap-4">
          {personalNotes && personalNotes.trim() && (
            <View className="gap-1">
              <Text className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wide">
                Personal Notes
              </Text>
              <Text className="text-foreground text-sm leading-5">
                {personalNotes}
              </Text>
            </View>
          )}

          {workoutNotes && workoutNotes.trim() && (
            <View className="gap-1">
              <Text className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wide">
                Workout Notes
              </Text>
              <Text className="text-foreground text-sm leading-5">
                {workoutNotes}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
