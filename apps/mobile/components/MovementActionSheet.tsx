import { Button } from "@/components/Button";
import { Pencil } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
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
          <Button
            size="lg"
            variant="outline"
            onPress={onEdit}
            className="flex-row items-center gap-2 justify-start"
            icon={<Pencil size={20} color="green" />}
          >
            Edit
          </Button>

          <TimedConfirmDeleteButton
            onConfirm={() => {
              onDelete();
              onClose();
            }}
          />
        </View>

        {/* Cancel */}
        <Button
          size="lg"
          className="mx-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl items-center"
          variant="outline"
          onPress={onClose}
        >
          Cancel
        </Button>
      </View>
    </Modal>
  );
}
