import { useMovementTemplates, useUserMovements } from "@hooks/useMovements";
import { useThemeColors } from "@hooks/useThemeColors";
import { Search, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MovementIcon } from "./MovementIcon";

interface AddMovementSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddMovements: (movementIds: string[]) => void;
  workoutId: string;
  existingMovementIds: string[];
}

type MovementItem = {
  id: string;
  name: string;
  muscle_groups: string[];
  tracking_type: string;
  isTemplate: boolean;
  isExisting: boolean;
};

type ListItem =
  | { type: "header"; key: string }
  | { type: "item"; data: MovementItem };

export function AddMovementSheet({
  visible,
  onClose,
  onAddMovements,
  existingMovementIds,
}: AddMovementSheetProps) {
  const colors = useThemeColors();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: templates = [], isLoading: templatesLoading } =
    useMovementTemplates();
  const { data: userMovements = [], isLoading: userMovementsLoading } =
    useUserMovements();

  const isLoading = templatesLoading || userMovementsLoading;

  // Combine templates and user movements into a single list
  const allMovements = useMemo((): MovementItem[] => {
    const items: MovementItem[] = [];

    // Add user movements first
    userMovements.forEach((movement) => {
      items.push({
        id: movement.id,
        name: movement.name,
        muscle_groups: movement.muscle_groups || [],
        tracking_type: movement.tracking_type,
        isTemplate: false,
        isExisting: existingMovementIds.includes(movement.id),
      });
    });

    // Add templates (only if not already in user movements)
    const userMovementTemplateIds = new Set(
      userMovements
        .filter((um) => um.template_id)
        .map((um) => um.template_id as string)
    );

    templates.forEach((template) => {
      // Skip if user already has this template
      if (userMovementTemplateIds.has(template.id)) return;

      items.push({
        id: template.id,
        name: template.name,
        muscle_groups: template.muscle_groups || [],
        tracking_type: template.tracking_type,
        isTemplate: true,
        isExisting: false,
      });
    });

    return items;
  }, [templates, userMovements, existingMovementIds]);

  // Filter movements based on search
  const filteredMovements = useMemo(() => {
    if (!searchTerm.trim()) return allMovements;

    const search = searchTerm.toLowerCase();
    return allMovements.filter(
      (movement) =>
        movement.name.toLowerCase().includes(search) ||
        movement.muscle_groups.some((group) =>
          group.toLowerCase().includes(search)
        )
    );
  }, [allMovements, searchTerm]);

  // Separate into sections
  const { userMovementsList, templatesList } = useMemo(() => {
    const user: MovementItem[] = [];
    const template: MovementItem[] = [];

    filteredMovements.forEach((movement) => {
      if (movement.isTemplate) {
        template.push(movement);
      } else {
        user.push(movement);
      }
    });

    // Sort: existing movements first, then alphabetically
    const sortFn = (a: MovementItem, b: MovementItem) => {
      if (a.isExisting && !b.isExisting) return -1;
      if (!a.isExisting && b.isExisting) return 1;
      return a.name.localeCompare(b.name);
    };

    return {
      userMovementsList: user.sort(sortFn),
      templatesList: template.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [filteredMovements]);

  const handleToggleMovement = (id: string, isExisting: boolean) => {
    if (isExisting) return; // Can't deselect existing movements

    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDone = () => {
    const idsToAdd = Array.from(selectedIds);
    if (idsToAdd.length > 0) {
      onAddMovements(idsToAdd);
    }
    setSelectedIds(new Set());
    setSearchTerm("");
    onClose();
  };

  const handleCancel = () => {
    setSelectedIds(new Set());
    setSearchTerm("");
    onClose();
  };

  const renderMovementItem = ({ item }: { item: MovementItem }) => {
    const isSelected = selectedIds.has(item.id) || item.isExisting;
    const isDisabled = item.isExisting;

    return (
      <TouchableOpacity
        className={`p-4 rounded-xl mb-2 flex-row items-center ${
          isDisabled
            ? "bg-background/30 opacity-50"
            : isSelected
              ? "bg-primary-500/20"
              : "bg-background/50"
        }`}
        style={
          !isDisabled && isSelected
            ? {
                boxShadow: `${colors.tint} 0px 0px 1px 1px`,
              }
            : undefined
        }
        onPress={() => handleToggleMovement(item.id, item.isExisting)}
        disabled={isDisabled}
      >
        <View className="h-10 w-10 rounded-full bg-primary-500/20 items-center justify-center mr-3">
          <MovementIcon trackingType={item.tracking_type} size={20} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-foreground font-semibold text-base">
              {item.name}
            </Text>
            {item.isExisting && (
              <View className="bg-green-500/20 px-2 py-0.5 rounded-full">
                <Text className="text-green-600 dark:text-green-400 text-xs font-medium">
                  Added
                </Text>
              </View>
            )}
          </View>
          <Text className="text-slate-500 dark:text-gray-400 text-sm">
            {item.muscle_groups.join(", ") || item.tracking_type}
          </Text>
        </View>
        <View
          className={`h-6 w-6 rounded-full border-2 items-center justify-center ${
            isSelected
              ? "bg-primary-500 border-primary-500"
              : "border-slate-300 dark:border-gray-600"
          }`}
        >
          {isSelected && <View className="h-3 w-3 rounded-full bg-white" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (title: string, count: number) => (
    <View className="py-2">
      <Text className="text-slate-500 dark:text-gray-400 text-sm font-semibold uppercase">
        {title} ({count})
      </Text>
    </View>
  );

  // Build list data with proper typing
  const listData: ListItem[] = [
    ...(userMovementsList.length > 0
      ? [{ type: "header" as const, key: "user-header" }]
      : []),
    ...userMovementsList.map((m) => ({ type: "item" as const, data: m })),
    ...(templatesList.length > 0
      ? [{ type: "header" as const, key: "template-header" }]
      : []),
    ...templatesList.map((m) => ({ type: "item" as const, data: m })),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 bg-black/50">
        <Pressable className="flex-1" onPress={handleCancel} />
        <View className="bg-card rounded-t-3xl max-h-[85%] border-t border-border">
          {/* Header */}
          <View className="p-4 border-b border-border">
            <View className="w-12 h-1 bg-gray-400 dark:bg-gray-600 rounded-full mb-4 self-center" />
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">
                Add Movements
              </Text>
              <TouchableOpacity onPress={handleCancel} className="p-2">
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-background rounded-xl px-4 py-3 gap-3">
              <Search size={20} color={colors.textSecondary} />
              <TextInput
                className="flex-1 text-foreground text-base"
                placeholder="Search movements..."
                placeholderTextColor={colors.textSecondary}
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm("")}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Content */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center p-8">
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : (
            <FlatList
              data={listData}
              renderItem={({ item }) => {
                if (item.type === "header") {
                  if (item.key === "user-header") {
                    return renderSectionHeader(
                      "My Movements",
                      userMovementsList.length
                    );
                  } else {
                    return renderSectionHeader(
                      "Movement Library",
                      templatesList.length
                    );
                  }
                }
                return renderMovementItem({ item: item.data });
              }}
              keyExtractor={(item, index) =>
                item.type === "header" ? item.key : `${item.data.id}-${index}`
              }
              contentContainerStyle={{ padding: 16 }}
              ListEmptyComponent={
                <View className="items-center justify-center py-12">
                  <Text className="text-slate-500 dark:text-gray-400 text-base">
                    No movements found
                  </Text>
                </View>
              }
            />
          )}

          {/* Footer */}
          <View className="p-4 pb-12 border-t border-border bg-card">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-slate-500 dark:text-gray-400 text-sm">
                {selectedIds.size} movement{selectedIds.size !== 1 ? "s" : ""}{" "}
                selected
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedIds(new Set())}
                disabled={selectedIds.size === 0}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedIds.size === 0
                      ? "text-slate-400 dark:text-gray-600"
                      : "text-primary-500"
                  }`}
                >
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-4 items-center"
                onPress={handleCancel}
              >
                <Text className="text-foreground font-semibold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-xl p-4 items-center ${
                  selectedIds.size === 0
                    ? "bg-slate-300 dark:bg-gray-700"
                    : "bg-primary-500"
                }`}
                onPress={handleDone}
                disabled={selectedIds.size === 0}
              >
                <Text
                  className={`font-semibold text-base ${
                    selectedIds.size === 0
                      ? "text-slate-500 dark:text-gray-500"
                      : "text-white"
                  }`}
                >
                  Add ({selectedIds.size})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
