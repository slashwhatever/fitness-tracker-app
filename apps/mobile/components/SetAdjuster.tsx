import { Minus, Plus } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface SetAdjusterProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  incrementValue?: number;
  decrementValue?: number;
}

export function SetAdjuster({
  label,
  value,
  onChangeText,
  onIncrement,
  onDecrement,
  incrementValue = 1,
  decrementValue = 1,
}: SetAdjusterProps) {
  return (
    <View className="items-center gap-4">
      <View>
        <Text className="text-white text-7xl font-light text-center">
          {value || "0"}
        </Text>
        <Text className="text-gray-500 text-center text-lg">{label}</Text>
      </View>

      <View className="flex-row items-center gap-6">
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-dark-card border border-dark-border items-center justify-center active:bg-dark-border"
          onPress={onDecrement}
        >
          <Minus size={32} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-dark-card border border-dark-border items-center justify-center active:bg-dark-border"
          onPress={onIncrement}
        >
          <Plus size={32} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
