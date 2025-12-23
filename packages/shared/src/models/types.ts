import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../lib/supabase/database.types";

export type { Tables, TablesInsert, TablesUpdate };

export type UserProfile = Tables<"user_profiles">;
export type MuscleGroup = Tables<"muscle_groups">;
export type MovementTemplate = Tables<"movement_templates">;
export type UserMovement = Tables<"user_movements">;
export type WorkoutGroup = Tables<"workout_groups">;
export type TrackingTypeName = string; // Placeholder or Enum if available in DB
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
