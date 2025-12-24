import { Tables } from "../types/database.types";

export type MetricData = {
  current: number;
  previous: number;
  diff: number;
  percent: number;
  label: string;
  color: string;
  backgroundColor: string;
};

type Set = Tables<"sets">;
type UserMovement = Tables<"user_movements"> & {
  tracking_types?: { name: string } | null;
  tracking_type?: string;
};

export const calculateMetrics = (
  currentSets: Set[],
  previousSets: Set[] | undefined,
  movement: UserMovement
): MetricData[] => {
  if (!previousSets) return [];

  // Sets count - universal for all movement types
  const currentSetCount = currentSets.length;
  const previousSetCount = previousSets.length;
  const setsDiff = currentSetCount - previousSetCount;
  const setsPercent =
    previousSetCount > 0 ? (setsDiff / previousSetCount) * 100 : 0;

  const metrics: MetricData[] = [
    {
      current: currentSetCount,
      previous: previousSetCount,
      diff: setsDiff,
      percent: setsPercent,
      label: "sets",
      color: "bg-red-500",
      backgroundColor: "bg-red-900/40",
    },
  ];

  const trackingType =
    movement.tracking_type || movement.tracking_types?.name || "weight";

  // Add movement-type specific metrics
  switch (trackingType) {
    case "weight":
      // Total reps
      const currentReps = currentSets.reduce(
        (sum, set) => sum + (set.reps || 0),
        0
      );
      const previousReps = previousSets.reduce(
        (sum, set) => sum + (set.reps || 0),
        0
      );
      const repsDiff = currentReps - previousReps;
      const repsPercent =
        previousReps > 0 ? (repsDiff / previousReps) * 100 : 0;

      // Total volume (reps × weight)
      const currentVolume = currentSets.reduce(
        (sum, set) => sum + (set.reps || 0) * (set.weight || 0),
        0
      );
      const previousVolume = previousSets.reduce(
        (sum, set) => sum + (set.reps || 0) * (set.weight || 0),
        0
      );
      const volumeDiff = currentVolume - previousVolume;
      const volumePercent =
        previousVolume > 0 ? (volumeDiff / previousVolume) * 100 : 0;

      // Weight per rep (total weight / total reps)
      const currentWeightPerRep =
        currentReps > 0
          ? currentSets.reduce((sum, set) => sum + (set.weight || 0), 0) /
            currentReps
          : 0;
      const previousWeightPerRep =
        previousReps > 0
          ? previousSets.reduce((sum, set) => sum + (set.weight || 0), 0) /
            previousReps
          : 0;
      const weightPerRepDiff = currentWeightPerRep - previousWeightPerRep;
      const weightPerRepPercent =
        previousWeightPerRep > 0
          ? (weightPerRepDiff / previousWeightPerRep) * 100
          : 0;

      metrics.push(
        {
          current: currentReps,
          previous: previousReps,
          diff: repsDiff,
          percent: repsPercent,
          label: "reps",
          color: "bg-green-500",
          backgroundColor: "bg-green-900/40",
        },
        {
          current: Math.round(currentVolume),
          previous: Math.round(previousVolume),
          diff: Math.round(volumeDiff),
          percent: volumePercent,
          label: "volume",
          color: "bg-blue-500",
          backgroundColor: "bg-blue-900/40",
        },
        {
          current: Math.round(currentWeightPerRep * 10) / 10, // Round to 1 decimal
          previous: Math.round(previousWeightPerRep * 10) / 10,
          diff: Math.round(weightPerRepDiff * 10) / 10,
          percent: weightPerRepPercent,
          label: "weight/rep",
          color: "bg-orange-500",
          backgroundColor: "bg-orange-900/40",
        }
      );
      break;

    case "bodyweight":
    case "reps":
      // Total reps
      const currentBodyweightReps = currentSets.reduce(
        (sum, set) => sum + (set.reps || 0),
        0
      );
      const previousBodyweightReps = previousSets.reduce(
        (sum, set) => sum + (set.reps || 0),
        0
      );
      const bodyweightRepsDiff = currentBodyweightReps - previousBodyweightReps;
      const bodyweightRepsPercent =
        previousBodyweightReps > 0
          ? (bodyweightRepsDiff / previousBodyweightReps) * 100
          : 0;

      metrics.push({
        current: currentBodyweightReps,
        previous: previousBodyweightReps,
        diff: bodyweightRepsDiff,
        percent: bodyweightRepsPercent,
        label: "Reps",
        color: "bg-green-500",
        backgroundColor: "bg-green-900/40",
      });
      break;

    case "duration":
      // Total time
      const currentTotalTime = currentSets.reduce(
        (sum, set) => sum + (set.duration || 0),
        0
      );
      const previousTotalTime = previousSets.reduce(
        (sum, set) => sum + (set.duration || 0),
        0
      );
      const totalTimeDiff = currentTotalTime - previousTotalTime;
      const totalTimePercent =
        previousTotalTime > 0 ? (totalTimeDiff / previousTotalTime) * 100 : 0;

      // Average time per set
      const currentAvgTime =
        currentSetCount > 0 ? currentTotalTime / currentSetCount : 0;
      const previousAvgTime =
        previousSetCount > 0 ? previousTotalTime / previousSetCount : 0;
      const avgTimeDiff = currentAvgTime - previousAvgTime;
      const avgTimePercent =
        previousAvgTime > 0 ? (avgTimeDiff / previousAvgTime) * 100 : 0;

      metrics.push(
        {
          current: Math.round(currentTotalTime),
          previous: Math.round(previousTotalTime),
          diff: Math.round(totalTimeDiff),
          percent: totalTimePercent,
          label: "Total Duration",
          color: "bg-purple-500",
          backgroundColor: "bg-purple-900/40",
        },
        {
          current: Math.round(currentAvgTime * 10) / 10, // Round to 1 decimal
          previous: Math.round(previousAvgTime * 10) / 10,
          diff: Math.round(avgTimeDiff * 10) / 10,
          percent: avgTimePercent,
          label: "Avg Duration/Set",
          color: "bg-purple-500",
          backgroundColor: "bg-purple-900/40",
        }
      );
      break;

    case "distance":
      // Total distance
      const currentTotalDistance = currentSets.reduce(
        (sum, set) => sum + (set.distance || 0),
        0
      );
      const previousTotalDistance = previousSets.reduce(
        (sum, set) => sum + (set.distance || 0),
        0
      );
      const totalDistanceDiff = currentTotalDistance - previousTotalDistance;
      const totalDistancePercent =
        previousTotalDistance > 0
          ? (totalDistanceDiff / previousTotalDistance) * 100
          : 0;

      // Average distance per set
      const currentAvgDistance =
        currentSetCount > 0 ? currentTotalDistance / currentSetCount : 0;
      const previousAvgDistance =
        previousSetCount > 0 ? previousTotalDistance / previousSetCount : 0;
      const avgDistanceDiff = currentAvgDistance - previousAvgDistance;
      const avgDistancePercent =
        previousAvgDistance > 0
          ? (avgDistanceDiff / previousAvgDistance) * 100
          : 0;

      metrics.push(
        {
          current: Math.round(currentTotalDistance),
          previous: Math.round(previousTotalDistance),
          diff: Math.round(totalDistanceDiff),
          percent: totalDistancePercent,
          label: "Total Distance",
          color: "bg-teal-500",
          backgroundColor: "bg-teal-900/40",
        },
        {
          current: Math.round(currentAvgDistance * 10) / 10, // Round to 1 decimal
          previous: Math.round(previousAvgDistance * 10) / 10,
          diff: Math.round(avgDistanceDiff * 10) / 10,
          percent: avgDistancePercent,
          label: "Avg Dist/Set",
          color: "bg-teal-500",
          backgroundColor: "bg-teal-900/40",
        }
      );
      break;

    default:
      break;
  }

  return metrics;
};

// Conversion logic removed per user request

export const formatValue = (
  value: number,
  label: string,
  weightUnit = "kg"
) => {
  const isLbs = weightUnit === "lbs";
  const unitLabel = isLbs ? "lbs" : "kg";

  switch (label.toLowerCase()) {
    case "weight/rep":
      return `${Math.round(value * 10) / 10}${unitLabel}`;
    case "total duration":
      const minutes = Math.floor(value / 60);
      const seconds = Math.round(value % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    case "avg duration/set":
      return `${value}s`;
    case "total distance":
    case "avg dist/set":
      return `${Math.round(value)}m`;
    case "volume":
      return `${Math.round(value)}${unitLabel}`;
    default:
      return Math.round(value).toString();
  }
};

export const formatDiff = (value: number, label: string, weightUnit = "kg") => {
  const isLbs = weightUnit === "lbs";
  const unitLabel = isLbs ? "lbs" : "kg";
  // Convert before absolute value to handle signs correctly if needed,
  // but for Diff we ususally take Abs, so:
  const absDiff = Math.abs(value);

  switch (label.toLowerCase()) {
    case "sets":
    case "reps":
      return absDiff.toString();
    case "volume":
      return `${Math.round(absDiff)}${unitLabel}`;
    case "weight/rep":
      return `${Math.round(absDiff * 10) / 10}${unitLabel}`;
    case "total duration":
      const minutes = Math.floor(absDiff / 60);
      const seconds = Math.round(absDiff % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    case "avg duration/set":
      return `${Math.round(absDiff * 10) / 10}s`;
    case "total distance":
    case "avg dist/set":
      return `${Math.round(absDiff * 10) / 10}m`;
    default:
      return Math.round(absDiff).toString();
  }
};
