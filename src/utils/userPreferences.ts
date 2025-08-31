import { HybridStorageManager } from "@/lib/storage/HybridStorageManager";
import { DistanceUnit, UserProfile, WeightUnit } from "@/models/types";

/**
 * Get the user's preferred weight unit from storage
 */
export async function getUserWeightUnit(): Promise<WeightUnit> {
  const profiles = await HybridStorageManager.getLocalRecords<UserProfile>("user_profiles");
  const profile = profiles[0]; // Assuming single user
  return profile?.weight_unit || "lbs";
}

/**
 * Get the user's preferred distance unit from storage
 */
export async function getUserDistanceUnit(): Promise<DistanceUnit> {
  const profiles = await HybridStorageManager.getLocalRecords<UserProfile>("user_profiles");
  const profile = profiles[0]; // Assuming single user
  return profile?.distance_unit || "miles";
}

/**
 * Get the user's default rest timer from storage
 */
export async function getUserDefaultRestTimer(): Promise<number> {
  const profiles = await HybridStorageManager.getLocalRecords<UserProfile>("user_profiles");
  const profile = profiles[0]; // Assuming single user
  return profile?.default_rest_timer || 60;
}

/**
 * Format weight with user's preferred unit
 */
export async function formatWeight(weight: number): Promise<string> {
  const unit = await getUserWeightUnit();
  return `${weight} ${unit}`;
}

/**
 * Format distance with user's preferred unit
 */
export async function formatDistance(distance: number): Promise<string> {
  const unit = await getUserDistanceUnit();
  return `${distance} ${unit}`;
}

/**
 * Get weight unit label for forms
 */
export async function getWeightUnitLabel(): Promise<string> {
  const unit = await getUserWeightUnit();
  return unit === "lbs" ? "Weight (lbs)" : "Weight (kg)";
}
