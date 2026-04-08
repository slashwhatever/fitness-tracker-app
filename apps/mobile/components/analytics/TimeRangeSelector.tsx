import type { TimeRange } from "@/lib/utils/analytics";
import { ScrollView, Text, TouchableOpacity } from "react-native";

const RANGES: TimeRange[] = ["1W", "1M", "3M", "6M", "1Y", "All"];

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row gap-2 px-4 py-2"
    >
      {RANGES.map((range) => {
        const active = range === value;
        return (
          <TouchableOpacity
            key={range}
            onPress={() => onChange(range)}
            className={`px-4 py-2 rounded-full border ${
              active
                ? "bg-primary border-primary"
                : "bg-card border-border"
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Time range ${range}`}
          >
            <Text
              className={`text-sm font-semibold ${
                active ? "text-white" : "text-muted-foreground"
              }`}
            >
              {range}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
