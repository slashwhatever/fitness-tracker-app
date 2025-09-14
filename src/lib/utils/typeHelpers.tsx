import { ExperienceLevel, TrackingTypeName } from "@/models/types";
import { Weight, BicepsFlexed, Timer, Footprints, Hash, BarChart3 } from "lucide-react";
import { ReactElement } from "react";

/**
 * Get the appropriate icon for a tracking type
 */
export function getTrackingTypeIcon(type: TrackingTypeName, size?: number): ReactElement {
  const iconSize = size || 16;
  switch (type) {
    case "weight":
      return <Weight size={iconSize} />;
    case "bodyweight":
      return <BicepsFlexed size={iconSize} />;
    case "duration":
      return <Timer size={iconSize} />;
    case "distance":
      return <Footprints size={iconSize} />;
    case "reps_only":
      return <Hash size={iconSize} />;
    default:
      return <BarChart3 size={iconSize} />;
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
export function formatTrackingType(type: TrackingTypeName): string {
  return (
    type.replace("_", " ").charAt(0).toUpperCase() +
    type.replace("_", " ").slice(1)
  );
}

/**
 * Type guard to check if a string is a valid TrackingType
 */
export function isValidTrackingType(value: string): value is TrackingTypeName {
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
