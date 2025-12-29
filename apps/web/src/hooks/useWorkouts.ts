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
} from "@fitness/shared";

/**
 * Web wrapper for useWorkouts
 * Injects web-specific Supabase client and auth
 */
export function useWorkouts() {
  const { user } = useAuth();
  const supabase = createClient();
  return useWorkoutsShared({ user, supabase });
}

/**
 * Web wrapper for useWorkout
 * Injects web-specific Supabase client and auth
 */
export function useWorkout(workoutId: string) {
  const { user } = useAuth();
  const supabase = createClient();
  return useWorkoutShared(workoutId, { user, supabase });
}

/**
 * Web wrapper for useCreateWorkout
 * Injects web-specific Supabase client and auth
 */
export function useCreateWorkout() {
  const { user } = useAuth();
  const supabase = createClient();
  return useCreateWorkoutShared({ user, supabase });
}

/**
 * Web wrapper for useUpdateWorkout
 * Injects web-specific Supabase client and auth
 */
export function useUpdateWorkout() {
  const { user } = useAuth();
  const supabase = createClient();
  return useUpdateWorkoutShared({ user, supabase });
}

/**
 * Web wrapper for useDeleteWorkout
 * Injects web-specific Supabase client and auth
 */
export function useDeleteWorkout() {
  const { user } = useAuth();
  const supabase = createClient();
  return useDeleteWorkoutShared({ user, supabase });
}

/**
 * Web wrapper for useReorderWorkouts
 * Injects web-specific Supabase client and auth
 */
export function useReorderWorkouts() {
  const { user } = useAuth();
  const supabase = createClient();
  return useReorderWorkoutsShared({ user, supabase });
}

/**
 * Web wrapper for useArchiveWorkout
 * Injects web-specific Supabase client and auth
 */
export function useArchiveWorkout() {
  const { user } = useAuth();
  const supabase = createClient();
  return useArchiveWorkoutShared({ user, supabase });
}

/**
 * Web wrapper for useDuplicateWorkout
 * Injects web-specific Supabase client and auth
 */
export function useDuplicateWorkout() {
  const { user } = useAuth();
  const supabase = createClient();
  return useDuplicateWorkoutShared({ user, supabase });
}
