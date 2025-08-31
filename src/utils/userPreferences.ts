import { DistanceUnit, WeightUnit } from "@/models/types";
import { HybridStorageManager } from "@/lib/storage/HybridStorageManager";

/**
 * Get the user's preferred weight unit, defaulting to 'lbs' (sync version for render logic)
 */
export function getUserWeightUnit(): WeightUnit {
  // Fallback to default for render logic - use async version for actual storage operations
  return "lbs";
}

/**
 * Get the user's preferred weight unit from storage (async version)
 */
export async function getUserWeightUnitFromStorage(): Promise<WeightUnit> {
  const profiles = await HybridStorageManager.getLocalRecords('user_profiles');
  const profile = profiles[0]; // Assuming single user
  return (profile as any)?.weight_unit || "lbs";
}

/**
 * Get the user's preferred distance unit, defaulting to 'miles' (sync version for render logic)
 */
export function getUserDistanceUnit(): DistanceUnit {
  // Fallback to default for render logic - use async version for actual storage operations
  return "miles";
}

/**
 * Get the user's preferred distance unit from storage (async version)
 */
export async function getUserDistanceUnitFromStorage(): Promise<DistanceUnit> {
  const profiles = await HybridStorageManager.getLocalRecords('user_profiles');
  const profile = profiles[0]; // Assuming single user
  return (profile as any)?.distance_unit || "miles";
}

/**
 * Get the user's default rest timer, defaulting to 60 seconds (sync version for render logic)
 */
export function getUserDefaultRestTimer(): number {
  // Fallback to default for render logic - use async version for actual storage operations  
  return 60;
}

/**
 * Get the user's default rest timer from storage (async version)
 */
export async function getUserDefaultRestTimerFromStorage(): Promise<number> {
  const profiles = await HybridStorageManager.getLocalRecords('user_profiles');
  const profile = profiles[0]; // Assuming single user
  return (profile as any)?.default_rest_timer || 60;
}

/**
 * Format weight with user's preferred unit (sync version for render logic)
 */
export function formatWeight(weight: number): string {
  const unit = getUserWeightUnit();
  return `${weight} ${unit}`;
}

/**
 * Format weight with user's preferred unit from storage (async version)
 */
export async function formatWeightFromStorage(weight: number): Promise<string> {
  const unit = await getUserWeightUnitFromStorage();
  return `${weight} ${unit}`;
}

/**
 * Format distance with user's preferred unit (sync version for render logic)
 */
export function formatDistance(distance: number): string {
  const unit = getUserDistanceUnit();
  return `${distance} ${unit}`;
}

/**
 * Format distance with user's preferred unit from storage (async version)
 */
export async function formatDistanceFromStorage(distance: number): Promise<string> {
  const unit = await getUserDistanceUnitFromStorage();
  return `${distance} ${unit}`;
}

/**
 * Get weight unit label for forms (sync version for render logic)
 */
export function getWeightUnitLabel(): string {
  const unit = getUserWeightUnit();
  return unit === "lbs" ? "Weight (lbs)" : "Weight (kg)";
}

/**
 * Get weight unit label for forms from storage (async version)
 */
export async function getWeightUnitLabelFromStorage(): Promise<string> {
  const unit = await getUserWeightUnitFromStorage();
  return unit === "lbs" ? "Weight (lbs)" : "Weight (kg)";
}
