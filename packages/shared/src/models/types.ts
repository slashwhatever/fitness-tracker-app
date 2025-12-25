import type { Tables } from "../types/database.types";

import type { Enums } from "../types/database.types";

export type UserProfile = Tables<"user_profiles">;
export type MuscleGroup = Tables<"muscle_groups">;
export type MovementTemplate = Tables<"movement_templates">;
export type UserMovement = Tables<"user_movements">;
export type WorkoutGroup = Tables<"workout_groups">;
export type TrackingType = Tables<"tracking_types">;
export type TrackingTypeName = TrackingType["name"];
export type ExperienceLevel = Enums<"experience_level">; // Enums is generic, ensure database.types exports it or generic usage

// 'movements' does not exist, assuming UserMovement is the primary movement type used in workouts
export type Movement = UserMovement;
export type Workout = Tables<"workouts">;
export type WorkoutMovement = Tables<"workout_movements">;
export type Set = Tables<"sets">;

export type MuscleGroupWithSelection = MuscleGroup & {
  selected?: boolean;
};

export type MovementWithMuscleGroups = Movement & {
  muscle_groups?: {
    muscle_group_id: string;
    muscle_groups: {
      name: string;
      display_name: string;
    } | null;
  }[];
  primary_muscle_group?: {
    name: string;
    display_name: string;
  } | null;
};

export type WorkoutWithMovements = Workout & {
  workout_movements: (WorkoutMovement & {
    movement: Movement;
  })[];
};

export type WeightUnit = "lbs" | "kg";
export type DistanceUnit = "miles" | "km";

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
