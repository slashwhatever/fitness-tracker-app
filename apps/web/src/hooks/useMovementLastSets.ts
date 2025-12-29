import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  useMovementLastSet as useMovementLastSetShared,
  useMovementLastSets as useMovementLastSetsShared,
} from "@fitness/shared";

/**
 * Web wrapper for useMovementLastSets
 * Injects web-specific Supabase client and auth
 */
export function useMovementLastSets(movementIds: string[]) {
  const { user } = useAuth();
  const supabase = createClient();
  return useMovementLastSetsShared(movementIds, { user, supabase });
}

/**
 * Web wrapper for useMovementLastSet
 * Injects web-specific Supabase client and auth
 */
export function useMovementLastSet(movementId: string) {
  const { user } = useAuth();
  const supabase = createClient();
  return useMovementLastSetShared(movementId, { user, supabase });
}
