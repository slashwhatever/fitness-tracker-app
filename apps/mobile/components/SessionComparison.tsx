import {
  MetricData,
  UserMovement,
  calculateMetrics,
  formatDiff,
  formatValue,
} from "@fitness/shared";
import type { Tables } from "@fitness/shared";
import { useUserProfile } from "@hooks/useUserProfile";
import { CircleEqual, Play } from "lucide-react-native";
import { useMemo } from "react";
import { Text, View } from "react-native";

interface SessionComparisonProps {
  currentSets: Tables<"sets">[];
  previousSets: Tables<"sets">[] | undefined;
  movement: UserMovement;
}

function getBarColors(metric: MetricData): { fg: string; bg: string } {
  if (metric.previous === 0 || metric.current === metric.previous) {
    return { fg: "hsl(210, 80%, 55%)", bg: "hsla(210, 80%, 30%, 0.4)" };
  }
  const ratio = metric.current / metric.previous;
  const effectiveRatio = metric.invertImprovement && ratio > 0 ? 1 / ratio : ratio;
  if (effectiveRatio > 1) {
    return { fg: "hsl(120, 75%, 50%)", bg: "hsla(120, 75%, 25%, 0.4)" };
  }
  // Below 100%: red (hue 0) → amber (hue 50) — never enters green
  const hue = Math.round(Math.max(0, effectiveRatio) * 50);
  return {
    fg: `hsl(${hue}, 75%, 50%)`,
    bg: `hsla(${hue}, 75%, 25%, 0.4)`,
  };
}

export function SessionComparison({
  currentSets,
  previousSets,
  movement,
}: SessionComparisonProps) {
  const { data: userProfile } = useUserProfile();
  const weightUnit = userProfile?.weight_unit || "kg";

  const metrics = useMemo(() => {
    if (!previousSets || previousSets.length === 0) return [];
    return calculateMetrics(currentSets, previousSets, movement);
  }, [currentSets, previousSets, movement]);

  if (!previousSets || previousSets.length === 0 || metrics.length === 0) {
    return null;
  }

  const renderProgressBar = (metric: MetricData) => {
    const ratio = metric.previous > 0 ? metric.current / metric.previous : 1;
    const effectiveRatio =
      metric.invertImprovement && ratio > 0 ? 1 / ratio : ratio;
    const height = Math.min(100, Math.max(5, effectiveRatio * 100));
    const { fg, bg } = getBarColors(metric);

    return (
      <View
        style={{ backgroundColor: bg }}
        className="w-2 h-10 rounded-full overflow-hidden mr-3 relative justify-end"
      >
        <View
          style={{ height: `${height}%`, backgroundColor: fg }}
          className="w-full rounded-full absolute bottom-0"
        />
      </View>
    );
  };

  return (
    <View className="mb-4">
      {/* Metrics Grid */}
      <View className="flex-row flex-wrap gap-y-4">
        {metrics.map((metric, _index) => {
          // Check if higher is better (default) or lower is better (reverse weight)
          const isImprovement = metric.invertImprovement
            ? metric.diff < 0
            : metric.diff > 0;
          const isDecline = metric.invertImprovement
            ? metric.diff > 0
            : metric.diff < 0;
          // Progress percent display
          const progressPercent =
            metric.previous > 0
              ? Math.round((metric.current / metric.previous) * 100)
              : 100;

          const { fg: accentColor } = getBarColors(metric);

          return (
            <View
              key={metric.label}
              className="w-1/2 flex-row items-center pr-2"
            >
              {renderProgressBar(metric)}

              <View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-foreground font-medium text-md">
                    {formatValue(metric.current, metric.label, weightUnit)}
                  </Text>
                  <Text className="text-slate-500 dark:text-gray-400 text-sm">
                    {metric.label}
                  </Text>
                </View>

                <View className="flex-row items-center gap-1">
                  {isImprovement ? (
                    <View style={{ transform: [{ rotate: "-90deg" }] }}>
                      <Play
                        size={16}
                        color={accentColor}
                        fill={accentColor}
                      />
                    </View>
                  ) : isDecline ? (
                    <View style={{ transform: [{ rotate: "90deg" }] }}>
                      <Play
                        size={16}
                        color={accentColor}
                        fill={accentColor}
                      />
                    </View>
                  ) : (
                    <CircleEqual size={16} color={accentColor} />
                  )}

                  <Text className="text-sm" style={{ color: accentColor }}>
                    {formatDiff(metric.diff, metric.label, weightUnit)} (
                    {progressPercent}%)
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
