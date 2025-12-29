import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  useArchiveWorkout as useArchiveWorkoutShared,
  useCreateWorkout as useCreateWorkoutShared,
  useDeleteWorkout as useDeleteWorkoutShared,
  useDuplicateWorkout as useDuplicateWorkoutShared,
  useReorderWorkouts as useReorderWorkoutsShared,
  useUpdateWorkout as useUpdateWorkoutShared,
  useWorkout as useWorkoutShared,
  useWorkouts as useWorkoutsShared,
  type Tables,
  type TablesInsert,
  type TablesUpdate,
} from "@fitness/shared";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

type Workout = Tables<"workouts">;
type WorkoutInsert = TablesInsert<"workouts">;
type WorkoutUpdate = TablesUpdate<"workouts">;

type WorkoutWithGroup = Workout & {
  workout_groups: { name: string } | null;
};

/**
 * Mobile wrapper for useWorkouts
 * Injects mobile-specific Supabase client and auth
 */
export function useWorkouts(): {
  workouts: WorkoutWithGroup[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
} {
  const { user } = useAuth();
  const supabase = createClient();
  return useWorkoutsShared({ user, supabase });
}

/**
 * Mobile wrapper for useWorkout
 * Injects mobile-specific Supabase client and auth
 */
export function useWorkout(
  workoutId: string
): UseQueryResult<Workout | null, Error> {
  const { user } = useAuth();
  const supabase = createClient();
  return useWorkoutShared(workoutId, { user, supabase });
}

/**
 * Mobile wrapper for useCreateWorkout
 * Injects mobile-specific Supabase client and auth
 */
export function useCreateWorkout(): UseMutationResult<
  Workout,
  Error,
  Omit<WorkoutInsert, "user_id" | "order_index">
> {
  const { user } = useAuth();
  const supabase = createClient();
  return useCreateWorkoutShared({ user, supabase });
}

/**
 * Mobile wrapper for useUpdateWorkout
 * Injects mobile-specific Supabase client and auth
 */
export function useUpdateWorkout(): UseMutationResult<
  Workout,
  Error,
  { id: string; updates: WorkoutUpdate }
> {
  const { user } = useAuth();
  const supabase = createClient();
  return useUpdateWorkoutShared({ user, supabase });
}

/**
 * Mobile wrapper for useDeleteWorkout
 * Injects mobile-specific Supabase client and auth
 */
export function useDeleteWorkout(): UseMutationResult<string, Error, string> {
  const { user } = useAuth();
  const supabase = createClient();
  return useDeleteWorkoutShared({ user, supabase });
}

/**
 * Mobile wrapper for useReorderWorkouts
 * Injects mobile-specific Supabase client and auth
 */
export function useReorderWorkouts(): UseMutationResult<
  { id: string; order_index: number }[],
  Error,
  { workouts: { id: string; order_index: number }[] }
> {
  const { user } = useAuth();
  const supabase = createClient();
  return useReorderWorkoutsShared({ user, supabase });
}

/**
 * Mobile wrapper for useArchiveWorkout
 * Injects mobile-specific Supabase client and auth
 */
export function useArchiveWorkout(): UseMutationResult<
  Workout,
  Error,
  { workoutId: string; archived: boolean }
> {
  const { user } = useAuth();
  const supabase = createClient();
  return useArchiveWorkoutShared({ user, supabase });
}

/**
 * Mobile wrapper for useDuplicateWorkout
 * Injects mobile-specific Supabase client and auth
 */
export function useDuplicateWorkout(): UseMutationResult<
  Workout,
  Error,
  string
> {
  const { user } = useAuth();
  const supabase = createClient();
  return useDuplicateWorkoutShared({ user, supabase });
}
