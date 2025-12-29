import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { UserMovement } from "@fitness/shared";
import {
  usePersonalRecordsByMovement as usePersonalRecordsByMovementShared,
  type Tables,
} from "@fitness/shared";
import type { UseQueryResult } from "@tanstack/react-query";

/**
 * Mobile wrapper for usePersonalRecordsByMovement
 * Injects mobile-specific Supabase client and auth
 */
export function usePersonalRecordsByMovement(
  movementId: string
): UseQueryResult<
  (Tables<"personal_records"> & { user_movement: UserMovement | null })[],
  Error
> {
  const { user } = useAuth();
  const supabase = createClient();
  return usePersonalRecordsByMovementShared(movementId, { user, supabase });
}
