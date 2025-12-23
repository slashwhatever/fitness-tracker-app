"use client";

import { useAuth } from "../lib/auth/AuthProvider";
import { createClient } from "../lib/supabase/client";
import type { QueryData } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

// Query keys
const personalRecordKeys = {
  all: ["personal-records"] as const,
  lists: () => [...personalRecordKeys.all, "list"] as const,
  list: (userId: string) => [...personalRecordKeys.lists(), userId] as const,
  byMovement: (userId: string, movementId: string) =>
    [...personalRecordKeys.lists(), userId, "movement", movementId] as const,
};

// Get personal records for a specific movement
export function usePersonalRecordsByMovement(movementId: string) {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: personalRecordKeys.byMovement(user?.id || "", movementId),
    queryFn: async () => {
      if (!user?.id) return [];

      const query = supabase
        .from("personal_records")
        .select(
          `
          *,
          user_movement:user_movements(*)
        `
        )
        .eq("user_id", user.id)
        .eq("user_movement_id", movementId)
        .order("achieved_at", { ascending: false });

      type QueryResult = QueryData<typeof query>;

      const { data, error } = await query;
      if (error) throw error;
      return data as QueryResult;
    },
    enabled: !!user?.id && !!movementId,
    staleTime: 10 * 60 * 1000, // 10 minutes - PRs don't change frequently
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}
