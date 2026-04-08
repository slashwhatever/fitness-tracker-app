import { FilterPicker } from "@/components/analytics/FilterPicker";
import type { FilterOption } from "@/components/analytics/FilterPicker";
import { MetricSelector } from "@/components/analytics/MetricSelector";
import { TimeRangeSelector } from "@/components/analytics/TimeRangeSelector";
import { useBottomPadding } from "@hooks/useBottomPadding";
import { useHeaderPadding } from "@hooks/useHeaderPadding";
import { useWorkoutMovements } from "@hooks/useMovements";
import { useSets } from "@hooks/useSets";
import { useThemeColors } from "@hooks/useThemeColors";
import { useUserProfile } from "@hooks/useUserProfile";
import { useWorkouts } from "@hooks/useWorkouts";
import {
  type Metric,
  type TimeRange,
  aggregateSets,
  computeTrendLine,
  formatMetricValue,
  getSummaryStats,
  metricLabel,
} from "@/lib/utils/analytics";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import Svg, { Line as SvgLine } from "react-native-svg";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function AnalyticsScreen() {
  const headerPadding = useHeaderPadding();
  const bottomPadding = useBottomPadding();
  const colors = useThemeColors();

  // ── Filters ────────────────────────────────────────────────────────────────
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");
  const [metric, setMetric] = useState<Metric>("volume");
  const [workoutIds, setWorkoutIds] = useState<string[]>([]);
  const [movementIds, setMovementIds] = useState<string[]>([]);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data: allSets, isLoading: setsLoading } = useSets();
  const { workouts, isLoading: workoutsLoading } = useWorkouts();
  const { data: profile } = useUserProfile();

  // Load movements assigned to the selected workout (only useful when exactly 1 workout chosen).
  // Always called at the top level — isSafeForQueries("") disables the query when nothing selected.
  const { data: assignedMovements } = useWorkoutMovements(workoutIds[0] ?? "");

  const weightUnit = (profile?.weight_unit as "kg" | "lbs") ?? "kg";
  const isLoading = setsLoading || workoutsLoading;

  // ── Derived filter options + aggregated chart data ─────────────────────────
  const { chartPoints, summaryStats, movementOptions, effectiveMovementIds } = useMemo(() => {
    if (!allSets) {
      return { chartPoints: [], summaryStats: { total: 0, avg: 0, peak: 0 }, movementOptions: [], effectiveMovementIds: [] };
    }

    // Step 1: filter by selected workouts
    const byWorkout = workoutIds.length > 0
      ? allSets.filter((s) => workoutIds.includes(s.workout_id ?? ""))
      : allSets;

    // Step 2: derive movement options
    let movementOptions: FilterOption[];
    if (workoutIds.length === 0) {
      // No workout selected → all historically logged movements
      const movementMap = new Map<string, string>();
      for (const s of allSets) {
        if (s.user_movement_id && s.user_movement?.name) {
          movementMap.set(s.user_movement_id, s.user_movement.name);
        }
      }
      movementOptions = Array.from(movementMap.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } else if (workoutIds.length === 1 && assignedMovements) {
      // Single workout → use the workout's current template movements (clean, no one-offs)
      movementOptions = assignedMovements
        .flatMap((wm) =>
          wm.user_movement ? [{ id: wm.user_movement.id, name: wm.user_movement.name }] : []
        )
        .sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Multiple workouts → union of set-history movements for those workouts
      const movementMap = new Map<string, string>();
      for (const s of byWorkout) {
        if (s.user_movement_id && s.user_movement?.name) {
          movementMap.set(s.user_movement_id, s.user_movement.name);
        }
      }
      movementOptions = Array.from(movementMap.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    // Step 3: drop selected movements that are no longer in the options list
    const validIds = new Set(movementOptions.map((o) => o.id));
    const effectiveMovementIds = movementIds.filter((id) => validIds.has(id));

    // Step 4: filter by selected movements
    const filtered = effectiveMovementIds.length > 0
      ? byWorkout.filter((s) => effectiveMovementIds.includes(s.user_movement_id ?? ""))
      : byWorkout;

    // Step 5: aggregate into chart points
    const points = aggregateSets(filtered, metric, timeRange, weightUnit);
    const stats = getSummaryStats(points);

    return { chartPoints: points, summaryStats: stats, movementOptions, effectiveMovementIds };
  }, [allSets, assignedMovements, workoutIds, movementIds, metric, timeRange, weightUnit]);

  const workoutOptions: FilterOption[] = useMemo(
    () =>
      (workouts ?? [])
        .filter((w) => !w.archived)
        .map((w) => ({ id: w.id, name: w.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [workouts]
  );

  // ── Chart config ───────────────────────────────────────────────────────────
  const Y_AXIS_WIDTH = 48;
  const CARD_SPACING = 64;
  const plotWidth = SCREEN_WIDTH - CARD_SPACING - Y_AXIS_WIDTH;

  const CHART_HEIGHT = 180;
  const hasData = chartPoints.length > 0;
  const numPoints = chartPoints.length;

  const spacing = numPoints > 1
    ? Math.max(8, Math.floor((plotWidth - 16) / (numPoints - 1)))
    : plotWidth;

  const maxLabels = 6;
  const labelStep = Math.max(1, Math.ceil(numPoints / maxLabels));
  const chartData = chartPoints.map((p, i) => ({
    value: p.value,
    label: i % labelStep === 0 ? p.label : "",
    dataPointText: "",
  }));

  // ── Trend line (SVG overlay, pixel-space) ─────────────────────────────────
  const trendOverlay = useMemo(() => {
    if (chartPoints.length < 2) return null;
    const trend = computeTrendLine(chartPoints);
    if (!trend) return null;

    const maxDataValue = Math.max(...chartPoints.map((p) => p.value));
    const stepValue = Math.ceil(maxDataValue / 4) || 1;
    const maxDisplayed = stepValue * 4;

    const toY = (v: number) =>
      CHART_HEIGHT * (1 - Math.max(0, Math.min(1, v / maxDisplayed)));

    const x1 = 8;
    const x2 = 8 + (numPoints - 1) * spacing;

    return {
      x1,
      y1: toY(trend.startValue),
      x2,
      y2: toY(trend.endValue),
    };
  }, [chartPoints, spacing, numPoints]);

  // ── Subtitle ───────────────────────────────────────────────────────────────
  const subtitle = useMemo(() => {
    const parts: string[] = [
      timeRange === "All" ? "All time" : `Last ${timeRange}`,
    ];
    if (workoutIds.length > 0) {
      const names = workoutIds
        .map((id) => workoutOptions.find((w) => w.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      if (names) parts.push(names);
    }
    if (effectiveMovementIds.length > 0) {
      const names = effectiveMovementIds
        .map((id) => movementOptions.find((m) => m.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      if (names) parts.push(names);
    }
    return parts.join(" · ");
  }, [timeRange, workoutIds, workoutOptions, effectiveMovementIds, movementOptions]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerPadding + 8,
          paddingBottom: bottomPadding + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Time range */}
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />

        {/* Filters row */}
        <View className="flex-row gap-2 px-4 pb-2 flex-wrap">
          <FilterPicker
            label="Workout"
            multiSelect
            value={workoutIds}
            options={workoutOptions}
            onChange={(ids) => {
              setWorkoutIds(ids);
              setMovementIds([]);
            }}
          />
          <FilterPicker
            label="Movement"
            multiSelect
            value={effectiveMovementIds}
            options={movementOptions}
            onChange={setMovementIds}
          />
        </View>

        {/* Metric selector */}
        <MetricSelector value={metric} onChange={setMetric} />

        {/* Chart card */}
        <View className="mx-4 mt-2 bg-card rounded-2xl border border-border p-4">
          {/* Card title */}
          <Text className="text-foreground font-semibold text-base mb-1">
            {metricLabel(metric)}
          </Text>
          <Text className="text-muted-foreground text-xs mb-4">
            {subtitle}
          </Text>

          {/* Loading */}
          {isLoading && (
            <View className="h-48 items-center justify-center">
              <ActivityIndicator color={colors.tint} />
            </View>
          )}

          {/* Empty state */}
          {!isLoading && !hasData && (
            <View className="h-48 items-center justify-center gap-2">
              <Text className="text-muted-foreground text-sm text-center">
                No data for this period.{"\n"}Log some sets to see your progress.
              </Text>
            </View>
          )}

          {/* Chart + trend line overlay */}
          {!isLoading && hasData && (
            <View style={{ position: "relative" }}>
            <LineChart
              data={chartData}
              width={plotWidth}
              height={180}
              areaChart
              curved
              color={colors.tint}
              startFillColor={colors.tint}
              endFillColor={colors.tint}
              startOpacity={0.3}
              endOpacity={0.02}
              thickness={2}
              hideDataPoints
              noOfSections={4}
              yAxisColor="transparent"
              xAxisColor={colors.border}
              rulesColor={colors.border}
              rulesType="solid"
              yAxisTextStyle={{
                color: colors.textSecondary,
                fontSize: 10,
              }}
              xAxisLabelTextStyle={{
                color: colors.textSecondary,
                fontSize: 10,
              }}
              yAxisLabelWidth={Y_AXIS_WIDTH}
              formatYLabel={(v) => {
                const n = parseFloat(v);
                if (n >= 1000) return `${Math.round(n / 100) / 10}k`;
                return String(Math.round(n));
              }}
              spacing={spacing}
              initialSpacing={8}
              endSpacing={8}
              disableScroll
              isAnimated
            />
            {trendOverlay && (
              <View
                style={{
                  position: "absolute",
                  left: Y_AXIS_WIDTH,
                  top: 0,
                  width: plotWidth,
                  height: CHART_HEIGHT,
                }}
                pointerEvents="none"
              >
                <Svg width={plotWidth} height={CHART_HEIGHT}>
                  <SvgLine
                    x1={trendOverlay.x1}
                    y1={trendOverlay.y1}
                    x2={trendOverlay.x2}
                    y2={trendOverlay.y2}
                    stroke={colors.textSecondary}
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    strokeOpacity={0.7}
                  />
                </Svg>
              </View>
            )}
            </View>
          )}

          {/* Summary stats */}
          {!isLoading && hasData && (
            <View className="flex-row mt-4 pt-4 border-t border-border">
              {[
                {
                  label: metric === "sets" ? "Total Sets" : metric === "reps" ? "Total Reps" : "Total",
                  value: formatMetricValue(summaryStats.total, metric, weightUnit),
                },
                {
                  label: "Avg / Session",
                  value: formatMetricValue(summaryStats.avg, metric, weightUnit),
                },
                {
                  label: "Peak",
                  value: formatMetricValue(summaryStats.peak, metric, weightUnit),
                },
              ].map(({ label, value }) => (
                <View key={label} className="flex-1 items-center">
                  <Text className="text-foreground font-semibold text-sm">
                    {value}
                  </Text>
                  <Text className="text-muted-foreground text-xs mt-0.5">
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
