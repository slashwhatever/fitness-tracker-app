import { useWorkoutGroups } from "@fitness/shared";
import { useRouter } from "expo-router";
import { GripVertical, Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageGroupsScreen() {
  const { groups, createGroup, deleteGroup, loading } = useWorkoutGroups();
  const router = useRouter();
  const [newGroupName, setNewGroupName] = useState("");

  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    try {
      await createGroup.mutateAsync(newGroupName.trim());
      setNewGroupName("");
    } catch (error) {
      Alert.alert("Error", "Failed to create group");
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Group",
      `Are you sure you want to delete "${name}"? Workouts in this group will be ungrouped.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteGroup.mutate(id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center bg-dark-card p-4 rounded-xl border border-dark-border mb-3">
      <GripVertical size={20} color="#64748b" className="mr-3" />
      <Text className="flex-1 text-white font-medium text-lg">{item.name}</Text>
      <TouchableOpacity
        onPress={() => handleDelete(item.id, item.name)}
        className="p-2"
      >
        <Trash2 size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-dark-bg p-4"
      edges={["bottom", "left", "right"]}
    >
      {/* Header handled by Stack usually, but we want custom control or if it's a modal */}
      {/* Using standard presentation 'modal' implies we might want a custom close button if header is hidden, 
          but usually standard header is fine. Let's assume standard header is shown or we render one. */}

      <View className="flex-1">
        <FlatList
          data={groups}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <Text className="text-gray-400 mb-4">
              Create groups to organize your workouts (e.g., "Push/Pull/Legs",
              "Cardio").
            </Text>
          }
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
          className="absolute bottom-4 left-4 right-4"
        >
          <View className="flex-row items-center space-x-2">
            <TextInput
              className="flex-1 bg-dark-card text-white p-4 rounded-xl border border-dark-border"
              placeholder="New Group Name"
              placeholderTextColor="#64748b"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <TouchableOpacity
              className={`p-4 rounded-xl ${
                !newGroupName.trim() ? "bg-gray-700" : "bg-primary-500"
              }`}
              disabled={!newGroupName.trim() || loading}
              onPress={handleCreate}
            >
              <Plus
                size={24}
                color={!newGroupName.trim() ? "#94a3b8" : "white"}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
