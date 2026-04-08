import { useThemeColors } from "@hooks/useThemeColors";
import { Check, ChevronDown, X } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
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

  // Normalise to an array for internal logic
  const selectedIds: string[] = isMulti
    ? (props as FilterPickerMultiProps).value
    : (props as FilterPickerSingleProps).value
      ? [(props as FilterPickerSingleProps).value as string]
      : [];

  const hasSelection = selectedIds.length > 0;

  // Chip label text
  const chipLabel = (() => {
    if (selectedIds.length === 0) return label;
    if (selectedIds.length === 1) {
      return options.find((o) => o.id === selectedIds[0])?.name ?? label;
    }
    return `${label} (${selectedIds.length})`;
  })();

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleClose = () => {
    setOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    if (isMulti) {
      (props as FilterPickerMultiProps).onChange([]);
    } else {
      (props as FilterPickerSingleProps).onChange(null);
    }
    handleClose();
  };

  const handleSelect = (id: string) => {
    if (isMulti) {
      const current = (props as FilterPickerMultiProps).value;
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      (props as FilterPickerMultiProps).onChange(next);
      // Stay open in multi-select mode
    } else {
      (props as FilterPickerSingleProps).onChange(id);
      handleClose();
    }
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  return (
    <>
      {/* Chip trigger */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
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
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Clear ${label} filter`}
          >
            <X size={12} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <ChevronDown size={12} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      {/* Modal sheet */}
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <SafeAreaView className="flex-1 bg-background">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
            <Text className="text-foreground text-lg font-semibold">
              {label}
            </Text>
            {isMulti ? (
              <TouchableOpacity
                onPress={handleClose}
                className="px-3 py-1"
                accessibilityLabel="Done"
              >
                <Text className="text-primary font-semibold text-base">Done</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleClose}
                className="p-1"
                accessibilityLabel="Close"
              >
                <X size={20} color={colors.icon} />
              </TouchableOpacity>
            )}
          </View>

          {/* Search */}
          {options.length > 8 && (
            <View className="px-4 py-2 border-b border-border">
              <TextInput
                className="bg-input text-foreground rounded-lg px-3 py-2"
                placeholder={`Search ${label.toLowerCase()}…`}
                placeholderTextColor={colors.textSecondary}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>
          )}

          {/* Options */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <TouchableOpacity
                onPress={handleClear}
                className={`flex-row items-center px-4 py-3 border-b border-border ${
                  selectedIds.length === 0 ? "bg-primary/10" : ""
                }`}
              >
                <Text
                  className={`text-base flex-1 ${
                    selectedIds.length === 0
                      ? "text-primary font-semibold"
                      : "text-foreground"
                  }`}
                >
                  All {label}s
                </Text>
              </TouchableOpacity>
            }
            renderItem={({ item }) => {
              const selected = isSelected(item.id);
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item.id)}
                  className={`flex-row items-center px-4 py-3 border-b border-border ${
                    selected ? "bg-primary/10" : ""
                  }`}
                >
                  <Text
                    className={`text-base flex-1 ${
                      selected ? "text-primary font-semibold" : "text-foreground"
                    }`}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {isMulti && selected && (
                    <Check size={18} color={colors.iconActive} />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View className="px-4 py-8 items-center">
                <Text className="text-muted-foreground">No results</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}
