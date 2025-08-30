// Core TypeScript interfaces for the Fitness Tracking App
// Based on architecture specifications from docs/architecture/data-models.md

// ============================================================================
// CORE TYPE DEFINITIONS
// ============================================================================

export type TrackingType =
  | "weight"
  | "bodyweight"
  | "duration"
  | "distance"
  | "reps_only";
export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";

export interface MovementTemplate {
  id: string;
  name: string;
  muscle_group: string;
  tracking_type: TrackingType;
  experience_level: ExperienceLevel;
  instructions: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export interface User {
  id: string;
  created_at: string;
}

export interface UserProfile {
  id: string; // UUID from auth.users
  display_name?: string;
  default_rest_timer: number; // Global timer preference in seconds
  privacy_settings: {
    profile_visibility: "public" | "private";
    workout_sharing: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface UserMovement {
  id: string;
  user_id: string;
  template_id: string | null; // References MovementTemplate.id
  name: string;
  muscle_group: string;
  tracking_type: TrackingType;
  custom_rest_timer?: number; // Movement-specific timer override
  personal_notes?: string;
  manual_1rm?: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// WORKOUT MANAGEMENT
// ============================================================================

export type SetType = "warmup" | "working" | "drop" | "failure" | "rest_pause";

export interface Set {
  id: string;
  user_movement_id: string;
  workout_id: string | null;
  user_id: string;
  set_type: SetType;
  reps: number | null;
  weight: number | null; // For weight-based exercises
  duration: number | null; // For time-based exercises (seconds)
  distance: number | null; // For distance-based exercises
  notes: string | null;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  default_rest_timer: number | null; // Workout-specific timer override
  created_at: string;
  updated_at: string;
}

export interface WorkoutMovement {
  id: string;
  workout_id: string;
  user_movement_id: string;
  order_index: number;
  created_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id: string;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

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

export interface PersonalRecord {
  id: string;
  user_id: string;
  user_movement_id: string;
  record_type: "max_weight" | "max_reps" | "max_duration" | "max_volume";
  value: number;
  set_id: string; // Reference to the set that achieved this PR
  achieved_at: string;
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
  userPreferences: { default_rest_timer?: number },
  workout?: { default_rest_timer?: number },
  movement?: { custom_rest_timer?: number }
): number {
  if (movement?.custom_rest_timer) return movement.custom_rest_timer;
  if (workout?.default_rest_timer) return workout.default_rest_timer;
  if (userPreferences.default_rest_timer) return userPreferences.default_rest_timer;
  return 180; // Default 3 minutes
}

/**
 * Determines the source of the timer value for display purposes
 */
export function getTimerSource(
  userPreferences: { default_rest_timer?: number },
  workout?: { default_rest_timer?: number },
  movement?: { custom_rest_timer?: number }
): TimerSource {
  if (movement?.custom_rest_timer) return "movement";
  if (workout?.default_rest_timer) return "workout";
  if (userPreferences.default_rest_timer) return "user";
  return "global";
}

/**
 * Calculate 1RM using Brzycki formula
 */
export function calculateBrzycki(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (36 / (37 - reps)));
}

/**
 * Format weight for display
 */
export function formatWeight(weight: number | null): string {
  if (weight === null) return "-";
  return `${weight} lbs`;
}

/**
 * Calculate and format volume (weight × reps)
 */
export function formatVolume(weight: number | null, reps: number | null): string {
  if (weight === null || reps === null) return "-";
  return `${weight * reps} lbs`;
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

// Request types for API operations
export interface CreateWorkoutRequest {
  name: string;
  description?: string;
  default_rest_timer?: number;
}

export interface CreateUserMovementRequest {
  template_id?: string;
  name: string;
  muscle_group: string;
  tracking_type: TrackingType;
  custom_rest_timer?: number;
  personal_notes?: string;
}

export interface CreateSetRequest {
  user_movement_id: string;
  workout_id?: string;
  set_type?: SetType;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
}

export interface UpdateSetRequest {
  set_type?: SetType;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
}
