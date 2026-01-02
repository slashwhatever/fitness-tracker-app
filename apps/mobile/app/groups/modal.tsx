import { EmptyState } from "@/components/EmptyState";
import { GlassHeader } from "@/components/GlassHeader";
import { GroupActionSheet } from "@/components/GroupActionSheet";
import { GroupItem } from "@/components/GroupItem";
import { useBottomPadding } from "@hooks/useBottomPadding";
import { useHeaderPadding } from "@hooks/useHeaderPadding";
import { useThemeColors } from "@hooks/useThemeColors";
import { useWorkoutGroups } from "@hooks/useWorkoutGroups";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageGroupsScreen() {
  const { groups, createGroup, deleteGroup, updateGroup, loading } =
    useWorkoutGroups();
  const router = useRouter();
  const colors = useThemeColors();
  const headerPadding = useHeaderPadding();
  const bottomPadding = useBottomPadding();
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const canCreate = newGroupName.trim().length > 0 && !createGroup.isPending;

  const handleCreate = async () => {
    if (!canCreate) return;

    try {
      await createGroup.mutateAsync(newGroupName.trim());
      setNewGroupName("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to create group");
    }
  };

  const handleActionSelect = (action: "rename" | "delete") => {
    if (!selectedGroup) return;

    if (action === "rename") {
      setEditingId(selectedGroup.id);
      setEditingName(selectedGroup.name);
    } else if (action === "delete") {
      handleDelete(selectedGroup.id);
    }
  };

  const handleRename = async (id: string) => {
    if (!editingName.trim() || editingName === selectedGroup?.name) {
      setEditingId(null);
      return;
    }

    try {
      await updateGroup.mutateAsync({
        id,
        updates: { name: editingName.trim() },
      });
      setEditingId(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to rename group");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGroup.mutateAsync(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      Alert.alert("Error", "Failed to delete group");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <GlassHeader title="Manage Groups" showBack backPath="/(tabs)/workouts" />

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: headerPadding + 16,
            paddingBottom: bottomPadding,
          }}
        >
          <View className="px-4">
            <Text className="text-muted-foreground mb-4">
              Organize your workouts into groups for better management
            </Text>

            {groups.length === 0 ? (
              <EmptyState
                title="No Groups Yet"
                description="Create groups to organize your workouts by muscle group, training style, or any way you prefer."
              />
            ) : (
              <FlashList
                data={groups}
                renderItem={({ item }) => (
                  <GroupItem
                    item={item}
                    isEditing={editingId === item.id}
                    editingName={editingName}
                    onEditChange={setEditingName}
                    onRenameSubmit={handleRename}
                    onActionPress={(group) => {
                      setSelectedGroup(group);
                      setModalVisible(true);
                    }}
                  />
                )}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                // @ts-expect-error - FlashList types might be incompatible with React 19
                estimatedItemSize={76}
              />
            )}
          </View>
        </ScrollView>

        {/* Sticky Bottom Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View className="border-t border-border bg-card p-4">
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="New group name..."
                placeholderTextColor={colors.textSecondary}
                value={newGroupName}
                onChangeText={setNewGroupName}
                onSubmitEditing={handleCreate}
                returnKeyType="done"
                editable={!createGroup.isPending}
              />
              <TouchableOpacity
                className={`p-3 rounded-xl ${
                  canCreate ? "bg-primary-500" : "bg-muted"
                }`}
                disabled={!canCreate}
                onPress={handleCreate}
              >
                {createGroup.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Plus size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      <GroupActionSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleActionSelect}
        groupName={selectedGroup?.name || ""}
      />
    </SafeAreaView>
  );
}
