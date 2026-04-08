import type { Metric } from "@/lib/utils/analytics";
import { metricLabel } from "@/lib/utils/analytics";
import { ScrollView, Text, TouchableOpacity } from "react-native";

const METRICS: Metric[] = ["volume", "sets", "reps", "weight_per_rep"];

interface MetricSelectorProps {
  value: Metric;
  onChange: (metric: Metric) => void;
}

export function MetricSelector({ value, onChange }: MetricSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row gap-2 px-4 py-2"
    >
      {METRICS.map((m) => {
        const active = m === value;
        return (
          <TouchableOpacity
            key={m}
            onPress={() => onChange(m)}
            className={`px-4 py-2 rounded-full border ${
              active
                ? "bg-primary border-primary"
                : "bg-card border-border"
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Metric ${metricLabel(m)}`}
          >
            <Text
              className={`text-sm font-semibold ${
                active ? "text-white" : "text-muted-foreground"
              }`}
            >
              {metricLabel(m)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
