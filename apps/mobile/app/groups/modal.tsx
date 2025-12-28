import { GlassHeader } from "@components/GlassHeader";
import { GroupActionSheet } from "@components/GroupActionSheet";
import { useWorkoutGroups } from "@fitness/shared";
import { useBottomPadding } from "@hooks/useBottomPadding";
import { useHeaderPadding } from "@hooks/useHeaderPadding";
import { useThemeColors } from "@hooks/useThemeColors";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Folder, MoreVertical, Plus } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

  const renderItem = ({ item }: { item: any }) => {
    const isEditing = editingId === item.id;

    return (
      <View className="bg-card border border-border rounded-xl p-4 mb-3">
        <View className="flex-row items-center">
          <View className="flex-1">
            {isEditing ? (
              <TextInput
                className="text-foreground font-semibold text-lg bg-input border border-border rounded-lg px-3 py-2"
                value={editingName}
                onChangeText={setEditingName}
                onSubmitEditing={() => handleRename(item.id)}
                onBlur={() => handleRename(item.id)}
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
              onPress={() => {
                setSelectedGroup(item);
                setModalVisible(true);
              }}
              className="p-2 -mr-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreVertical size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Folder size={64} color={colors["muted-foreground"]} />
      <Text className="text-foreground font-semibold text-xl mt-4">
        No Groups Yet
      </Text>
      <Text className="text-muted-foreground text-center mt-2 px-8">
        Create groups to organize your workouts by muscle group, training style,
        or any way you prefer.
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <GlassHeader title="Manage Groups" showBack />

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
              renderEmptyState()
            ) : (
              <FlatList
                data={groups}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
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
