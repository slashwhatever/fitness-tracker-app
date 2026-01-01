import { Button } from "@/components/Button";
import { Pencil } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
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
            <Button
              size="lg"
              variant="outline"
              className="flex-row items-center gap-2 justify-start"
              onPress={() => {
                onSelect("rename");
                onClose();
              }}
              icon={<Pencil size={20} color="green" />}
            >
              Rename Group
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
