// Core TypeScript interfaces for the Logset Fitness Tracking App
// Based on generated Supabase types and extended for app-specific needs

import type {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";

// ============================================================================
// DATABASE TYPE IMPORTS
// ============================================================================

// Use generated types from Supabase as base
export type TrackingType = Tables<"tracking_types">;
export type MuscleGroup = Tables<"muscle_groups">;

// Derive tracking type names from the database table
export type TrackingTypeName = TrackingType["name"];

export type ExperienceLevel = Enums<"experience_level">;
export type SetType = Enums<"set_type">;
export type RecordType = Enums<"record_type">;

// ============================================================================
// DATABASE ROW TYPES
// ============================================================================

// Use generated types directly
export type UserProfile = Tables<"user_profiles">;
export type Workout = Tables<"workouts">;
export type WorkoutMovement = Tables<"workout_movements">;
export type Set = Tables<"sets">;
export type PersonalRecord = Tables<"personal_records">;
export type MovementLastSet = Tables<"movement_last_sets">;

// Junction table types
export type MovementTemplateMuscleGroup =
  Tables<"movement_template_muscle_groups">;
export type UserMovementMuscleGroup = Tables<"user_movement_muscle_groups">;

// QueryData types are now used in hooks for automatic type inference from Supabase queries

// Raw database row types
type MovementTemplateRow = Tables<"movement_templates">;
type UserMovementRow = Tables<"user_movements">;

// Extended movement template (adds muscle_groups and tracking_type populated by joins)
export interface MovementTemplate
  extends Omit<MovementTemplateRow, "muscle_groups"> {
  muscle_groups: string[]; // Will be populated by joins with muscle group names
  tracking_type: TrackingTypeName; // Will be populated by join with tracking_types table
}

// Extended user movement (adds muscle_groups and tracking_type populated by joins)
export interface UserMovement extends Omit<UserMovementRow, "muscle_groups"> {
  muscle_groups: string[]; // Will be populated by joins with muscle group names
  tracking_type: TrackingTypeName; // Will be populated by join with tracking_types table
}

export type WeightUnit = "lbs" | "kg";
export type DistanceUnit = "miles" | "km";

// ============================================================================
// SYNC AND OFFLINE SUPPORT
// ============================================================================

export interface SyncOperation {
  id: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  table_name: string;
  record_id: string;
  data: Record<string, unknown>;
  timestamp: string;
  retry_count: number;
  error?: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

// ============================================================================
// TIMER HIERARCHY SUPPORT
// ============================================================================

export interface TimerPreset {
  label: string;
  seconds: number;
}

export const TIMER_PRESETS: TimerPreset[] = [
  { label: "30s", seconds: 30 },
  { label: "1m", seconds: 60 },
  { label: "90s", seconds: 90 },
  { label: "2m", seconds: 120 },
  { label: "3m", seconds: 180 },
  { label: "5m", seconds: 300 },
];

export type TimerSource = "global" | "user" | "workout" | "movement";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Resolves the effective rest timer value based on hierarchy:
 * Movement > Workout > User > Global (180s default)
 */
export function getEffectiveRestTimer(
  userPreferences: { default_rest_timer?: number | null },
  workout?: { default_rest_timer?: number | null },
  movement?: { custom_rest_timer?: number | null }
): number {
  if (movement?.custom_rest_timer) return movement.custom_rest_timer;
  if (workout?.default_rest_timer) return workout.default_rest_timer;
  if (userPreferences.default_rest_timer)
    return userPreferences.default_rest_timer;
  return 180; // Default 3 minutes
}

/**
 * Determines the source of the timer value for display purposes
 */
export function getTimerSource(
  globalTimer: number | null,
  movementTimer: number | null
): TimerSource {
  if (movementTimer !== null) {
    return "movement";
  }
  if (globalTimer !== null) {
    return "global";
  }
  return "global"; // fallback to global when no timer is set
}

/**
 * Calculate 1RM using Brzycki formula
 */
export function calculateBrzycki(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (36 / (37 - reps)));
}

/**
 * Format weight for display (without unit)
 */
export function formatWeight(weight: number | null): string {
  if (weight === null) return "-";
  return weight.toString();
}

/**
 * Calculate and format volume (weight × reps, without unit)
 */
export function formatVolume(
  weight: number | null,
  reps: number | null
): string {
  if (weight === null || reps === null) return "-";
  return (weight * reps).toString();
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// API request types - extend database insert types
export interface CreateUserMovementRequest
  extends Omit<TablesInsert<"user_movements">, "user_id"> {
  muscle_groups: string[]; // Additional field for handling muscle groups
}

export type CreateWorkoutRequest = Omit<TablesInsert<"workouts">, "user_id">;

export type CreateSetRequest = TablesInsert<"sets">;

export type UpdateSetRequest = TablesUpdate<"sets">;
