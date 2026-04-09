import { useThemeColors } from "@hooks/useThemeColors";
import { ChevronDown, Search, X } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface FilterOption {
  id: string;
  name: string;
}

interface FilterPickerBaseProps {
  label: string;
  options: FilterOption[];
}

interface FilterPickerSingleProps extends FilterPickerBaseProps {
  multiSelect?: false;
  value: string | null;
  onChange: (id: string | null) => void;
}

interface FilterPickerMultiProps extends FilterPickerBaseProps {
  multiSelect: true;
  value: string[];
  onChange: (ids: string[]) => void;
}

type FilterPickerProps = FilterPickerSingleProps | FilterPickerMultiProps;

export function FilterPicker(props: FilterPickerProps) {
  const { label, options } = props;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const colors = useThemeColors();

  const isMulti = props.multiSelect === true;

  const selectedIds: string[] = isMulti
    ? (props as FilterPickerMultiProps).value
    : (props as FilterPickerSingleProps).value
      ? [(props as FilterPickerSingleProps).value as string]
      : [];

  // Staged selections — only committed when "Apply" is tapped in multi mode
  const [staged, setStaged] = useState<string[]>([]);

  const hasSelection = selectedIds.length > 0;

  const chipLabel = (() => {
    if (selectedIds.length === 0) return label;
    if (selectedIds.length === 1)
      return options.find((o) => o.id === selectedIds[0])?.name ?? label;
    return `${label} (${selectedIds.length})`;
  })();

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = () => {
    setStaged(selectedIds);
    setSearch("");
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    setSearch("");
  };

  const handleClearChip = () => {
    if (isMulti) {
      (props as FilterPickerMultiProps).onChange([]);
    } else {
      (props as FilterPickerSingleProps).onChange(null);
    }
  };

  const handleApply = () => {
    (props as FilterPickerMultiProps).onChange(staged);
    setOpen(false);
    setSearch("");
  };

  const handleClearStaged = () => {
    setStaged([]);
  };

  const handleSelect = (id: string) => {
    if (isMulti) {
      setStaged((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      (props as FilterPickerSingleProps).onChange(id);
      setOpen(false);
      setSearch("");
    }
  };

  const handleSelectAll = () => {
    if (isMulti) {
      setStaged([]);
    } else {
      (props as FilterPickerSingleProps).onChange(null);
      setOpen(false);
      setSearch("");
    }
  };

  const isStaged = (id: string) =>
    isMulti ? staged.includes(id) : selectedIds.includes(id);

  const allSelected = isMulti
    ? staged.length === 0
    : selectedIds.length === 0;

  return (
    <>
      {/* Chip trigger */}
      <TouchableOpacity
        onPress={handleOpen}
        className={`flex-row items-center gap-1 px-4 py-2 rounded-full border ${
          hasSelection ? "bg-primary border-primary" : "bg-card border-border"
        }`}
        accessibilityRole="button"
        accessibilityLabel={`Filter by ${label}: ${hasSelection ? chipLabel : "All"}`}
      >
        <Text
          className={`text-sm font-semibold ${
            hasSelection ? "text-white" : "text-muted-foreground"
          }`}
          numberOfLines={1}
        >
          {chipLabel}
        </Text>
        {hasSelection ? (
          <TouchableOpacity
            onPress={handleClearChip}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Clear ${label} filter`}
          >
            <X size={12} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <ChevronDown size={12} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      {/* Bottom sheet modal */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View className="flex-1 bg-black/50">
          {/* Tap outside to dismiss */}
          <Pressable className="flex-1" onPress={handleCancel} />

          <View className="bg-card rounded-t-3xl border-t border-border h-[85%] flex flex-col">
            {/* Drag handle */}
            <View className="w-12 h-1 bg-gray-400 dark:bg-gray-600 rounded-full mt-3 mb-0 self-center" />

            {/* Header */}
            <View className="px-4 pt-3 pb-3 border-b border-border">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xl font-bold text-foreground">
                  {label}
                </Text>
                <TouchableOpacity onPress={handleCancel} className="p-2">
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Search bar */}
              <View className="flex-row items-center bg-background rounded-xl px-4 py-3 gap-3">
                <Search size={20} color={colors.textSecondary} />
                <TextInput
                  className="flex-1 text-foreground text-base"
                  placeholder={`Search ${label.toLowerCase()}…`}
                  placeholderTextColor={colors.textSecondary}
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 12 }}
              ListHeaderComponent={
                /* "All" row — clears selection */
                <View className="px-4">
                  <TouchableOpacity
                    className={`p-4 rounded-xl mb-2 flex-row items-center ${
                      allSelected ? "bg-primary-500/20" : "bg-background/50"
                    }`}
                    style={
                      allSelected
                        ? { boxShadow: `${colors.tint} 0px 0px 1px 1px` }
                        : undefined
                    }
                    onPress={handleSelectAll}
                  >
                    <Text
                      className={`flex-1 text-base font-semibold ${
                        allSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      All {label}s
                    </Text>
                    <View
                      className={`h-6 w-6 rounded-full border-2 items-center justify-center ${
                        allSelected
                          ? "bg-primary-500 border-primary-500"
                          : "border-slate-300 dark:border-gray-600"
                      }`}
                    >
                      {allSelected && (
                        <View className="h-3 w-3 rounded-full bg-white" />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({ item }) => {
                const selected = isStaged(item.id);
                return (
                  <View className="px-4">
                    <TouchableOpacity
                      className={`p-4 rounded-xl mb-2 flex-row items-center ${
                        selected ? "bg-primary-500/20" : "bg-background/50"
                      }`}
                      style={
                        selected
                          ? { boxShadow: `${colors.tint} 0px 0px 1px 1px` }
                          : undefined
                      }
                      onPress={() => handleSelect(item.id)}
                    >
                      <Text
                        className={`flex-1 text-base font-semibold ${
                          selected ? "text-primary" : "text-foreground"
                        }`}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <View
                        className={`h-6 w-6 rounded-full border-2 items-center justify-center ${
                          selected
                            ? "bg-primary-500 border-primary-500"
                            : "border-slate-300 dark:border-gray-600"
                        }`}
                      >
                        {selected && (
                          <View className="h-3 w-3 rounded-full bg-white" />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View className="items-center justify-center py-12">
                  <Text className="text-slate-500 dark:text-gray-400 text-base">
                    No results
                  </Text>
                </View>
              }
            />

            {/* Footer — only in multi-select mode */}
            {isMulti && (
              <View className="px-4 pt-3 pb-8 border-t border-border bg-card">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-slate-500 dark:text-gray-400 text-sm">
                    {staged.length === 0
                      ? "All selected"
                      : `${staged.length} selected`}
                  </Text>
                  <TouchableOpacity
                    onPress={handleClearStaged}
                    disabled={staged.length === 0}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        staged.length === 0
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
                    className="flex-1 bg-primary-500 rounded-xl p-4 items-center"
                    onPress={handleApply}
                  >
                    <Text className="text-white font-semibold text-base">
                      Apply
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
