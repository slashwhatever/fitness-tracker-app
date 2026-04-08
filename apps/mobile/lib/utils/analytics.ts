import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  format,
  subDays,
  subMonths,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from "date-fns";
import type { SetWithMovement } from "@fitness/shared";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y" | "All";
export type Metric = "volume" | "sets" | "reps" | "weight_per_rep";
export type BucketPeriod = "day" | "week" | "month";

export type ChartPoint = {
  value: number;
  label: string;
  date: Date;
};

export type SummaryStats = {
  total: number;
  avg: number;
  peak: number;
};

// ─── Time range helpers ───────────────────────────────────────────────────────

export function getBucketPeriod(range: TimeRange): BucketPeriod {
  switch (range) {
    case "1W":
    case "1M":
      return "day";
    case "3M":
    case "6M":
      return "week";
    case "1Y":
    case "All":
      return "month";
  }
}

export function getRangeStart(range: TimeRange, now = new Date()): Date {
  switch (range) {
    case "1W":
      return startOfDay(subDays(now, 6));
    case "1M":
      return startOfDay(subDays(now, 29));
    case "3M":
      return startOfDay(subDays(now, 89));
    case "6M":
      return startOfDay(subDays(now, 179));
    case "1Y":
      return startOfDay(subMonths(now, 11));
    case "All":
      return new Date(0); // epoch
  }
}

// ─── Bucket key helpers ───────────────────────────────────────────────────────

function bucketKey(date: Date, period: BucketPeriod): string {
  switch (period) {
    case "day":
      return format(startOfDay(date), "yyyy-MM-dd");
    case "week":
      return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
    case "month":
      return format(startOfMonth(date), "yyyy-MM");
  }
}

function bucketLabel(date: Date, period: BucketPeriod): string {
  switch (period) {
    case "day":
      return format(date, "MMM d");
    case "week":
      return format(date, "MMM d");
    case "month":
      return format(date, "MMM yy");
  }
}

// ─── Core aggregation ────────────────────────────────────────────────────────

/**
 * Aggregates a (pre-filtered) array of sets into chart points for the
 * given time range and metric. Every bucket in the range is emitted — buckets
 * with no data get value 0 so the chart line is always continuous.
 */
export function aggregateSets(
  sets: SetWithMovement[],
  metric: Metric,
  range: TimeRange,
  weightUnit: "kg" | "lbs" = "kg"
): ChartPoint[] {
  const now = new Date();
  const rangeStart = getRangeStart(range, now);
  const period = getBucketPeriod(range);

  // Build a map of bucketKey → accumulated numerator + denominator
  type Accum = { numerator: number; denominator: number };
  const buckets = new Map<string, Accum>();

  // Only consider sets inside the range
  const inRange = sets.filter((s) => new Date(s.created_at) >= rangeStart);

  for (const set of inRange) {
    const key = bucketKey(new Date(set.created_at), period);
    const acc = buckets.get(key) ?? { numerator: 0, denominator: 0 };

    const w = set.weight ?? 0;
    const r = set.reps ?? 0;
    const lbsFactor = weightUnit === "lbs" ? 2.20462 : 1;

    switch (metric) {
      case "volume":
        acc.numerator += w * r * lbsFactor;
        break;
      case "sets":
        acc.numerator += 1;
        break;
      case "reps":
        acc.numerator += r;
        break;
      case "weight_per_rep":
        // Weighted average: accumulate total weight×reps and total reps
        acc.numerator += w * r * lbsFactor;
        acc.denominator += r;
        break;
    }
    buckets.set(key, acc);
  }

  // Generate all bucket boundaries in the range for a continuous x-axis
  const effectiveStart = range === "All" && inRange.length > 0
    ? (() => {
        const earliest = inRange.reduce((min, s) =>
          new Date(s.created_at) < min ? new Date(s.created_at) : min,
          new Date(inRange[0].created_at)
        );
        return period === "month" ? startOfMonth(earliest)
          : period === "week" ? startOfWeek(earliest, { weekStartsOn: 1 })
          : startOfDay(earliest);
      })()
    : rangeStart;

  let bucketDates: Date[];
  switch (period) {
    case "day":
      bucketDates = eachDayOfInterval({ start: effectiveStart, end: now });
      break;
    case "week":
      bucketDates = eachWeekOfInterval(
        { start: effectiveStart, end: now },
        { weekStartsOn: 1 }
      );
      break;
    case "month":
      bucketDates = eachMonthOfInterval({ start: effectiveStart, end: now });
      break;
  }

  // Only emit buckets that have actual data — zero-value buckets are rest days
  // and should not appear as dips in the chart line.
  return bucketDates
    .map((d) => {
      const key = bucketKey(d, period);
      const acc = buckets.get(key);
      if (!acc) return null;

      let value = 0;
      if (metric === "weight_per_rep") {
        value = acc.denominator > 0
          ? Math.round((acc.numerator / acc.denominator) * 10) / 10
          : 0;
      } else {
        value = Math.round(acc.numerator * 10) / 10;
      }

      if (value === 0) return null;
      return { value, label: bucketLabel(d, period), date: d };
    })
    .filter((p): p is ChartPoint => p !== null);
}

// ─── Summary stats ────────────────────────────────────────────────────────────

export function getSummaryStats(points: ChartPoint[]): SummaryStats {
  const nonZero = points.filter((p) => p.value > 0);
  if (nonZero.length === 0) return { total: 0, avg: 0, peak: 0 };

  const total = nonZero.reduce((s, p) => s + p.value, 0);
  const avg = Math.round((total / nonZero.length) * 10) / 10;
  const peak = Math.max(...nonZero.map((p) => p.value));

  return { total: Math.round(total * 10) / 10, avg, peak };
}

// ─── Trend line (linear regression) ─────────────────────────────────────────

export type TrendLine = {
  /** Regression value at the first data point (x = 0) */
  startValue: number;
  /** Regression value at the last data point (x = n-1) */
  endValue: number;
};

/**
 * Computes a least-squares linear regression over the chart points.
 * Returns null if there are fewer than 2 points or the data is constant.
 */
export function computeTrendLine(points: ChartPoint[]): TrendLine | null {
  const n = points.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    const y = points[i].value;
    sumX += i;
    sumY += y;
    sumXY += i * y;
    sumX2 += i * i;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return {
    startValue: intercept,
    endValue: slope * (n - 1) + intercept,
  };
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function formatMetricValue(
  value: number,
  metric: Metric,
  weightUnit: "kg" | "lbs"
): string {
  if (metric === "volume" || metric === "weight_per_rep") {
    return `${value.toLocaleString()} ${weightUnit}`;
  }
  return value.toLocaleString();
}

export function metricLabel(metric: Metric): string {
  switch (metric) {
    case "volume":
      return "Volume";
    case "sets":
      return "Sets";
    case "reps":
      return "Reps";
    case "weight_per_rep":
      return "Wt / Rep";
  }
}
