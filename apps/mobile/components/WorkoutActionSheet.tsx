import { Button } from "@/components/Button";
import { useThemeColors } from "@hooks/useThemeColors";
import { Archive, Copy, Pencil, Undo2 } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { TimedConfirmDeleteButton } from "./TimedConfirmDeleteButton";

interface WorkoutActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: "duplicate" | "archive" | "delete" | "edit") => void;
  workoutName: string;
  isArchived: boolean;
}

export function WorkoutActionSheet({
  visible,
  onClose,
  onSelect,
  workoutName,
  isArchived,
}: WorkoutActionSheetProps) {
  const colors = useThemeColors();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <View className="bg-card rounded-t-3xl overflow-hidden pb-8 border-t border-border">
          <View className="p-4 border-b border-border items-center">
            <View className="w-12 h-1 bg-gray-400 dark:bg-gray-600 rounded-full mb-4" />
            <Text className="text-lg font-semibold text-foreground text-center">
              {workoutName}
            </Text>
          </View>
          <View className="p-4 gap-2">
            <Button
              size="lg"
              variant="outline"
              className="flex-row items-center gap-2 justify-start"
              onPress={() => {
                onSelect("edit");
                onClose();
              }}
              icon={<Pencil size={20} color="green" />}
            >
              Edit Details
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="flex-row items-center gap-2 justify-start"
              onPress={() => {
                onSelect("duplicate");
                onClose();
              }}
              icon={<Copy size={20} color={colors.tint} />}
            >
              Duplicate
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="flex-row items-center gap-2 justify-start"
              onPress={() => {
                onSelect("archive");
                onClose();
              }}
              icon={
                isArchived ? (
                  <Undo2 size={20} color={colors.warning} />
                ) : (
                  <Archive size={20} color={colors.warning} />
                )
              }
            >
              {isArchived ? "Unarchive" : "Archive"}
            </Button>

            <TimedConfirmDeleteButton
              onConfirm={() => {
                onSelect("delete");
                onClose();
              }}
            />
          </View>
          <Button
            size="lg"
            variant="outline"
            className="mx-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl items-center"
            onPress={onClose}
          >
            Cancel
          </Button>
        </View>
      </Pressable>
    </Modal>
  );
}
