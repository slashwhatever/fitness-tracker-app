import { ExperienceLevel, TrackingType } from "@/models/types";

/**
 * Get the appropriate icon for a tracking type
 */
export function getTrackingTypeIcon(type: TrackingType): string {
  switch (type) {
    case "weight":
      return "🏋️";
    case "bodyweight":
      return "💪";
    case "duration":
      return "⏱️";
    case "distance":
      return "🏃";
    case "reps_only":
      return "🔢";
    default:
      return "📊";
  }
}

/**
 * Get the appropriate badge variant for an experience level
 */
export function getExperienceLevelVariant(
  level: ExperienceLevel
): "default" | "secondary" | "destructive" | "outline" {
  switch (level) {
    case "Beginner":
      return "secondary";
    case "Intermediate":
      return "default";
    case "Advanced":
      return "destructive";
    default:
      return "outline";
  }
}

/**
 * Format tracking type for display (handles underscore replacement)
 */
export function formatTrackingType(type: TrackingType): string {
  return (
    type.replace("_", " ").charAt(0).toUpperCase() +
    type.replace("_", " ").slice(1)
  );
}

/**
 * Type guard to check if a string is a valid TrackingType
 */
export function isValidTrackingType(value: string): value is TrackingType {
  return ["weight", "bodyweight", "duration", "distance", "reps_only"].includes(
    value
  );
}

/**
 * Type guard to check if a string is a valid ExperienceLevel
 */
export function isValidExperienceLevel(
  value: string
): value is ExperienceLevel {
  return ["Beginner", "Intermediate", "Advanced"].includes(value);
}
