import { DistanceUnit, WeightUnit } from "@/models/types";
import { HybridStorageManager } from "@/lib/storage/HybridStorageManager";

/**
 * Get the user's preferred weight unit, defaulting to 'lbs'
 */
export function getUserWeightUnit(): WeightUnit {
  const profile = persistenceService.getUserProfile();
  return profile?.weight_unit || "lbs";
}

/**
 * Get the user's preferred distance unit, defaulting to 'miles'
 */
export function getUserDistanceUnit(): DistanceUnit {
  const profile = persistenceService.getUserProfile();
  return profile?.distance_unit || "miles";
}

/**
 * Get the user's default rest timer, defaulting to 60 seconds
 */
export function getUserDefaultRestTimer(): number {
  const profile = persistenceService.getUserProfile();
  return profile?.default_rest_timer || 60;
}

/**
 * Format weight with user's preferred unit
 */
export function formatWeight(weight: number): string {
  const unit = getUserWeightUnit();
  return `${weight} ${unit}`;
}

/**
 * Format distance with user's preferred unit
 */
export function formatDistance(distance: number): string {
  const unit = getUserDistanceUnit();
  return `${distance} ${unit}`;
}

/**
 * Get weight unit label for forms
 */
export function getWeightUnitLabel(): string {
  const unit = getUserWeightUnit();
  return unit === "lbs" ? "Weight (lbs)" : "Weight (kg)";
}
