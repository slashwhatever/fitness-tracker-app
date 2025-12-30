import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../../types/database.types";

export type Workout = Tables<"workouts">;
export type WorkoutInsert = TablesInsert<"workouts">;
export type WorkoutUpdate = TablesUpdate<"workouts">;

export type WorkoutWithGroup = Workout & {
  workout_groups: { name: string } | null;
};

// Query keys
export const workoutKeys = {
  all: ["workouts"] as const,
  lists: () => [...workoutKeys.all, "list"] as const,
  list: (userId: string) => [...workoutKeys.lists(), userId] as const,
  details: () => [...workoutKeys.all, "detail"] as const,
  detail: (id: string) => [...workoutKeys.details(), id] as const,
};
