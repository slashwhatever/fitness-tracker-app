import { Pencil } from "lucide-react-native";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { TimedConfirmDeleteButton } from "./TimedConfirmDeleteButton";

interface GroupActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: "rename" | "delete") => void;
  groupName: string;
}

export function GroupActionSheet({
  visible,
  onClose,
  onSelect,
  groupName,
}: GroupActionSheetProps) {
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
              {groupName}
            </Text>
          </View>
          <View className="p-4 gap-2">
            <TouchableOpacity
              className="flex-row items-center p-4 bg-background/50 rounded-xl gap-4"
              onPress={() => {
                onSelect("rename");
                onClose();
              }}
            >
              <Pencil size={20} color="green" />
              <Text className="text-foreground font-medium text-lg">
                Rename Group
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
            className="mx-4 p-4 bg-background rounded-xl items-center"
            onPress={onClose}
          >
            <Text className="text-foreground font-semibold text-lg">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}
