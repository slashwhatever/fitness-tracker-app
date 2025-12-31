import {
  MetricData,
  calculateMetrics,
  formatDiff,
  formatValue,
} from "@fitness/shared";
import { useThemeColors } from "@hooks/useThemeColors";
import { useUserProfile } from "@hooks/useUserProfile";
import { CircleEqual, Play } from "lucide-react-native";
import { useMemo } from "react";
import { Text, View } from "react-native";

interface SessionComparisonProps {
  currentSets: any[]; // Using any because shared types might be slightly incompatible with local inferred types
  previousSets: any[] | undefined;
  movement: any; // Using any for flexibility
}

export function SessionComparison({
  currentSets,
  previousSets,
  movement,
}: SessionComparisonProps) {
  const { data: userProfile } = useUserProfile();
  const colors = useThemeColors();
  const weightUnit = userProfile?.weight_unit || "kg";

  const metrics = useMemo(() => {
    if (!previousSets || previousSets.length === 0) return [];
    return calculateMetrics(currentSets, previousSets, movement);
  }, [currentSets, previousSets, movement]);

  if (!previousSets || previousSets.length === 0 || metrics.length === 0) {
    return null;
  }

  const renderProgressBar = (metric: MetricData) => {
    const currentAsPercentOfPrevious =
      metric.previous > 0 ? (metric.current / metric.previous) * 100 : 100;

    const height = Math.min(100, Math.max(5, currentAsPercentOfPrevious));

    return (
      <View
        className={`w-2 h-10 rounded-full overflow-hidden ${metric.backgroundColor} mr-3 relative justify-end`}
      >
        <View
          style={{ height: `${height}%` }}
          className={`w-full ${metric.color} rounded-full absolute bottom-0`}
        />
      </View>
    );
  };

  return (
    <View className="mb-4">
      {/* Metrics Grid */}
      <View className="flex-row flex-wrap gap-y-4">
        {metrics.map((metric, index) => {
          const isImprovement = metric.diff > 0;
          const isDecline = metric.diff < 0;
          const isNeutral = metric.diff === 0;

          // Progress percent display
          const progressPercent =
            metric.previous > 0
              ? Math.round((metric.current / metric.previous) * 100)
              : 100;

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
                        color={colors.success}
                        fill={colors.success}
                      />
                    </View>
                  ) : isDecline ? (
                    <View style={{ transform: [{ rotate: "90deg" }] }}>
                      <Play
                        size={16}
                        color={colors.danger}
                        fill={colors.danger}
                      />
                    </View>
                  ) : (
                    <CircleEqual size={16} color={colors.info} />
                  )}

                  <Text
                    className={`text-sm ${
                      isImprovement
                        ? "text-green-500"
                        : isDecline
                          ? "text-red-500"
                          : "text-blue-500"
                    }`}
                  >
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
