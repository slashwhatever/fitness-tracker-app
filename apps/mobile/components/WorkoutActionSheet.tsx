import { Archive, Copy, Pencil, Undo2 } from "lucide-react-native";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <View className="bg-dark-card rounded-t-3xl overflow-hidden pb-8 border-t border-dark-border">
          <View className="p-4 border-b border-dark-border">
            <Text className="text-lg font-semibold text-white text-center">
              {workoutName}
            </Text>
          </View>
          <View className="p-4 gap-2">
            <TouchableOpacity
              className="flex-row items-center p-4 bg-dark-bg/50 rounded-xl gap-4"
              onPress={() => {
                onSelect("edit");
                onClose();
              }}
            >
              <Pencil size={20} color="green" />
              <Text className="text-white font-medium text-lg">
                Edit Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 bg-dark-bg/50 rounded-xl gap-4"
              onPress={() => {
                onSelect("duplicate");
                onClose();
              }}
            >
              <Copy size={20} color="#6366f1" />
              <Text className="text-white font-medium text-lg">Duplicate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 bg-dark-bg/50 rounded-xl gap-4"
              onPress={() => {
                onSelect("archive");
                onClose();
              }}
            >
              {isArchived ? (
                <Undo2 size={20} color="#eab308" />
              ) : (
                <Archive size={20} color="#eab308" />
              )}
              <Text className="text-white font-medium text-lg">
                {isArchived ? "Unarchive" : "Archive"}
              </Text>
            </TouchableOpacity>

            <TimedConfirmDeleteButton
              onConfirm={() => {
                onSelect("delete");
                onClose();
              }}
            />
          </View>
          <TouchableOpacity
            className="mx-4 p-4 bg-dark-bg rounded-xl items-center"
            onPress={onClose}
          >
            <Text className="text-white font-semibold text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}
