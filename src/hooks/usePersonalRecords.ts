"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Query keys
const prKeys = {
  all: ["personal_records"] as const,
  lists: () => [...prKeys.all, "list"] as const,
  list: (userId: string) => [...prKeys.lists(), userId] as const,
  byMovement: (userId: string, movementId: string) =>
    [...prKeys.lists(), userId, "movement", movementId] as const,
};

// Get all personal records for a user
export function usePersonalRecords() {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: prKeys.list(user?.id || ""),
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("personal_records")
        .select(
          `
          *,
          user_movement:user_movements(*),
          set:sets(*)
        `
        )
        .eq("user_id", user.id)
        .order("achieved_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

// Get personal records for a specific movement
export function usePersonalRecordsByMovement(movementId: string) {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: prKeys.byMovement(user?.id || "", movementId),
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("personal_records")
        .select(
          `
          *,
          user_movement:user_movements(*),
          set:sets(*)
        `
        )
        .eq("user_id", user.id)
        .eq("user_movement_id", movementId)
        .order("achieved_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!movementId,
  });
}
