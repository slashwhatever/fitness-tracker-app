import { Minus, Plus } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface SetAdjusterProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  // Legacy single-step handlers
  onIncrement?: () => void;
  onDecrement?: () => void;
  // Multi-step handler
  onAdjust?: (amount: number) => void;
  steps?: number[];
  variant?: "primary" | "secondary";
}

export function SetAdjuster({
  label,
  value,
  onChangeText,
  onIncrement,
  onDecrement,
  onAdjust,
  steps = [1],
  variant = "primary",
}: SetAdjusterProps) {
  const handleIncrement = (step: number) => {
    if (onAdjust) {
      onAdjust(step);
    } else if (onIncrement) {
      onIncrement();
    }
  };

  const handleDecrement = (step: number) => {
    if (onAdjust) {
      onAdjust(-step);
    } else if (onDecrement) {
      onDecrement();
    }
  };

  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#ffffff" : "#94a3b8"; // white : slate-400

  return (
    <View className="items-center gap-4">
      <View>
        <TextInput
          className="text-slate-900 dark:text-white text-7xl font-light text-center p-0"
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          selectTextOnFocus
          returnKeyType="done"
          textAlign="center"
          placeholder="0"
          placeholderTextColor="#9ca3af"
        />
        <Text className="text-slate-500 dark:text-gray-500 text-center text-lg">
          {label}
        </Text>
      </View>

      <View
        className="items-center gap-2 justify-center"
        style={{ minHeight: 88 }}
      >
        {variant === "primary" ? (
          // Primary Variant: Large Buttons, Single Step
          <View className="flex-row items-center gap-6">
            <TouchableOpacity
              className="w-16 h-16 rounded-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border items-center justify-center active:bg-slate-50 dark:active:bg-dark-border"
              onPress={() => handleDecrement(steps[0] || 1)}
            >
              <Minus size={32} color={iconColor} />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-16 h-16 rounded-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border items-center justify-center active:bg-slate-50 dark:active:bg-dark-border"
              onPress={() => handleIncrement(steps[0] || 1)}
            >
              <Plus size={32} color={iconColor} />
            </TouchableOpacity>
          </View>
        ) : (
          // Secondary Variant: Multiple Rows, Smaller Buttons
          steps.map((step) => (
            <View key={step} className="flex-row items-center gap-4">
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border items-center justify-center active:bg-slate-50 dark:active:bg-dark-border"
                onPress={() => handleDecrement(step)}
              >
                <Minus size={20} color={iconColor} />
              </TouchableOpacity>

              <Text className="text-slate-900 dark:text-white text-lg font-medium w-8 text-center">
                {step}
              </Text>

              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border items-center justify-center active:bg-slate-50 dark:active:bg-dark-border"
                onPress={() => handleIncrement(step)}
              >
                <Plus size={20} color={iconColor} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
