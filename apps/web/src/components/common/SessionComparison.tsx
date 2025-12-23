"use client";

import { Set, UserMovement } from "@/models/types";
import { CircleEqual, Play } from "lucide-react";
import { Typography } from "./Typography";

/**
 * SessionComparison Component
 *
 * Displays mini charts comparing current session to previous session based on movement type:
 *
 * Universal:
 * - Sets (red) - always shown
 *
 * Weight movements:
 * - Reps (green)
 * - Volume (blue) - reps × weight
 * - Weight/Rep (orange)
 *
 * Bodyweight & Reps Only movements:
 * - Reps (green)
 *
 * Duration movements:
 * - Total Duration (purple)
 * - Avg Duration/Set (purple)
 *
 * Distance movements:
 * - Total Distance (teal)
 * - Avg Distance/Set (teal)
 *
 * Each chart shows:
 * - Current value
 * - Absolute difference from previous (always positive numbers)
 * - Progress percentage towards previous session total
 * - Chevron direction (up/down) indicates improvement/decline
 * - Vertical progress bar with color coding
 *
 * To test in isolation, you can create mock data:
 * const mockCurrent = [
 *   { reps: 10, weight: 100, duration: 60, distance: 1000, ... },
 * ];
 * const mockPrevious = [
 *   { reps: 12, weight: 90, duration: 45, distance: 800, ... }
 * ];
 * const mockMovement = { tracking_type: 'weight' | 'bodyweight' | 'duration' | 'distance' | 'reps', ... };
 */

interface SessionComparisonProps {
  currentSets: Set[];
  previousSets: Set[] | undefined;
  movement: UserMovement;
}

interface MetricData {
  current: number;
  previous: number;
  diff: number;
  percent: number;
  label: string;
  color: string;
  backgroundColor: string;
}

export default function SessionComparison({
  currentSets,
  previousSets,
  movement,
}: SessionComparisonProps) {
  if (!previousSets || previousSets.length === 0) {
    return null;
  }

  // Calculate metrics
  const calculateMetrics = (): MetricData[] => {
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
        label: "Sets",
        color: "bg-red-500",
        backgroundColor: "bg-red-800",
      },
    ];

    // Add movement-type specific metrics
    switch (movement.tracking_type) {
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
            label: "Reps",
            color: "bg-green-500",
            backgroundColor: "bg-green-800",
          },
          {
            current: Math.round(currentVolume),
            previous: Math.round(previousVolume),
            diff: Math.round(volumeDiff),
            percent: volumePercent,
            label: "Volume",
            color: "bg-blue-500",
            backgroundColor: "bg-blue-800",
          },
          {
            current: Math.round(currentWeightPerRep * 10) / 10, // Round to 1 decimal
            previous: Math.round(previousWeightPerRep * 10) / 10,
            diff: Math.round(weightPerRepDiff * 10) / 10,
            percent: weightPerRepPercent,
            label: "Weight/Rep",
            color: "bg-orange-500",
            backgroundColor: "bg-orange-800",
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
        const bodyweightRepsDiff =
          currentBodyweightReps - previousBodyweightReps;
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
          backgroundColor: "bg-green-800",
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
            backgroundColor: "bg-purple-800",
          },
          {
            current: Math.round(currentAvgTime * 10) / 10, // Round to 1 decimal
            previous: Math.round(previousAvgTime * 10) / 10,
            diff: Math.round(avgTimeDiff * 10) / 10,
            percent: avgTimePercent,
            label: "Avg Duration/Set",
            color: "bg-purple-500",
            backgroundColor: "bg-purple-800",
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
            backgroundColor: "bg-teal-800",
          },
          {
            current: Math.round(currentAvgDistance * 10) / 10, // Round to 1 decimal
            previous: Math.round(previousAvgDistance * 10) / 10,
            diff: Math.round(avgDistanceDiff * 10) / 10,
            percent: avgDistancePercent,
            label: "Avg Dist/Set",
            color: "bg-teal-500",
            backgroundColor: "bg-teal-800",
          }
        );
        break;

      default:
        // For unknown movement types, we'll just show sets
        break;
    }

    return metrics;
  };

  const metrics = calculateMetrics();

  const renderProgressBar = (metric: MetricData) => {
    // Calculate what percentage of previous value the current value represents
    const currentAsPercentOfPrevious =
      metric.previous > 0 ? (metric.current / metric.previous) * 100 : 100;

    // Clamp to reasonable visual range
    const height = Math.min(100, Math.max(5, currentAsPercentOfPrevious));

    return (
      <div className="relative w-2 h-10 rounded-full overflow-hidden">
        {/* Background */}
        <div
          className={`absolute inset-0 ${metric.backgroundColor} rounded-full`}
        />
        {/* Progress - shows current as percentage of previous */}
        <div
          className={`absolute bottom-0 left-0 right-0 ${metric.color} rounded-full transition-all duration-300`}
          style={{ height: `${height}%` }}
        />
      </div>
    );
  };

  const formatValue = (value: number, label: string) => {
    switch (label) {
      case "Weight/Rep":
        return `${value}kg`;
      case "Total Duration":
        // Convert seconds to mm:ss format
        const minutes = Math.floor(value / 60);
        const seconds = Math.round(value % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      case "Avg Duration/Set":
        // Show seconds with 1 decimal for averages
        return `${value}s`;
      case "Total Distance":
        return `${Math.round(value)}m`;
      case "Avg Dist/Set":
        return `${value}m`;
      case "Volume":
        return `${Math.round(value)}kg`;
      default:
        return Math.round(value).toString();
    }
  };

  return (
    <div className="space-y-2">
      {/* Title row */}
      <Typography variant="caption">Compared to previous</Typography>

      {/* Metrics grid - single row on desktop, 2 rows on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center space-x-2">
            {/* Progress bar */}
            {renderProgressBar(metric)}

            {/* Data */}
            <div>
              <div className="flex items-center space-x-1">
                <Typography
                  variant="caption"
                  className="font-medium whitespace-nowrap"
                >
                  {formatValue(metric.current, metric.label)}
                </Typography>
                <Typography
                  variant="caption"
                  className="text-muted-foreground whitespace-nowrap"
                >
                  {metric.label}
                </Typography>
              </div>
              <div
                className={`flex items-center space-x-1 ${
                  metric.diff > 0
                    ? "text-green-600"
                    : metric.diff < 0
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {metric.diff > 0 ? (
                  <Play className="w-5 h-5 font-bold rotate-270" fill="green" />
                ) : metric.diff < 0 ? (
                  <Play className="w-5 h-5 font-bold rotate-90" fill="red" />
                ) : (
                  <CircleEqual className="w-5 h-5 font-bold text-blue-500" />
                )}
                <Typography variant="caption" className="whitespace-nowrap">
                  {(() => {
                    const absDiff = Math.abs(metric.diff);

                    // Calculate progress towards previous session (current as % of previous)
                    const progressPercent =
                      metric.previous > 0
                        ? Math.round((metric.current / metric.previous) * 100)
                        : 100;

                    // Format the difference value with appropriate units
                    let formattedDiff = "";
                    switch (metric.label) {
                      case "Sets":
                      case "Reps":
                        formattedDiff = absDiff.toString();
                        break;
                      case "Volume":
                        formattedDiff = `${Math.round(absDiff)}kg`;
                        break;
                      case "Weight/Rep":
                        formattedDiff = `${Math.round(absDiff * 10) / 10}kg`;
                        break;
                      case "Total Duration":
                        const minutes = Math.floor(absDiff / 60);
                        const seconds = Math.round(absDiff % 60);
                        formattedDiff = `${minutes}:${seconds
                          .toString()
                          .padStart(2, "0")}`;
                        break;
                      case "Avg Duration/Set":
                        formattedDiff = `${Math.round(absDiff * 10) / 10}s`;
                        break;
                      case "Total Distance":
                      case "Avg Dist/Set":
                        formattedDiff = `${Math.round(absDiff * 10) / 10}m`;
                        break;
                      default:
                        formattedDiff = Math.round(absDiff).toString();
                        break;
                    }

                    return `${formattedDiff} (${progressPercent}%)`;
                  })()}
                </Typography>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
