import { Pencil } from "lucide-react-native";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { TimedConfirmDeleteButton } from "./TimedConfirmDeleteButton";

interface MovementActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  title?: string;
}

export function MovementActionSheet({
  visible,
  onClose,
  onEdit,
  onDelete,
  title,
}: MovementActionSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose} />
      <View className="bg-card rounded-t-3xl overflow-hidden pb-8 border-t border-border">
        {/* Header */}
        <View className="p-4 border-b border-border items-center">
          <View className="w-12 h-1 bg-gray-400 dark:bg-gray-600 rounded-full mb-4" />
          {title && (
            <Text className="text-xl font-bold text-foreground text-center">
              {title}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View className="p-4 gap-2">
          <TouchableOpacity
            onPress={onEdit}
            className="flex-row items-center p-4 bg-background/50 rounded-xl gap-4"
          >
            <Pencil size={20} color="green" />
            <Text className="text-foreground text-lg font-medium">Edit</Text>
          </TouchableOpacity>

          <TimedConfirmDeleteButton
            onConfirm={() => {
              onDelete();
              onClose();
            }}
          />
        </View>

        {/* Cancel */}
        <TouchableOpacity
          onPress={onClose}
          className="mx-4 p-4 bg-background rounded-xl items-center"
        >
          <Text className="text-foreground font-semibold text-lg">Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
