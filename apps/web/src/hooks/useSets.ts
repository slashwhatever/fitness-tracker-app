import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  useCreateSet as useCreateSetShared,
  useDeleteSet as useDeleteSetShared,
  useSetsByMovement as useSetsByMovementShared,
  useSetsByWorkout as useSetsByWorkoutShared,
  useSetsCountByMovement as useSetsCountByMovementShared,
  useSets as useSetsShared,
  useUpdateSet as useUpdateSetShared,
} from "@fitness/shared";

/**
 * Web wrapper for useSets
 * Injects web-specific Supabase client and auth
 */
export function useSets() {
  const { user } = useAuth();
  const supabase = createClient();
  return useSetsShared({ user, supabase });
}

/**
 * Web wrapper for useSetsCountByMovement
 * Injects web-specific Supabase client and auth
 */
export function useSetsCountByMovement(movementId: string) {
  const { user } = useAuth();
  const supabase = createClient();
  return useSetsCountByMovementShared(movementId, { user, supabase });
}

/**
 * Web wrapper for useSetsByMovement
 * Injects web-specific Supabase client and auth
 */
export function useSetsByMovement(movementId: string) {
  const { user } = useAuth();
  const supabase = createClient();
  return useSetsByMovementShared(movementId, { user, supabase });
}

/**
 * Web wrapper for useSetsByWorkout
 * Injects web-specific Supabase client and auth
 */
export function useSetsByWorkout(workoutId: string) {
  const { user } = useAuth();
  const supabase = createClient();
  return useSetsByWorkoutShared(workoutId, { user, supabase });
}

/**
 * Web wrapper for useCreateSet
 * Injects web-specific Supabase client and auth
 */
export function useCreateSet() {
  const { user } = useAuth();
  const supabase = createClient();
  return useCreateSetShared({ user, supabase });
}

/**
 * Web wrapper for useUpdateSet
 * Injects web-specific Supabase client and auth
 */
export function useUpdateSet() {
  const { user } = useAuth();
  const supabase = createClient();
  return useUpdateSetShared({ user, supabase });
}

/**
 * Web wrapper for useDeleteSet
 * Injects web-specific Supabase client and auth
 */
export function useDeleteSet() {
  const { user } = useAuth();
  const supabase = createClient();
  return useDeleteSetShared({ user, supabase });
}
