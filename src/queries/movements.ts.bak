import { createClient } from "@/lib/supabase/client";

export function getUserMovements(userId: string) {
  const client = createClient();
  return client
    .from("user_movements")
    .select("*")
    .eq("user_id", userId)
    .order("name")
    .throwOnError();
}

export function getUserMovement(movementId: string) {
  const client = createClient();
  return client
    .from("user_movements")
    .select("*")
    .eq("id", movementId)
    .throwOnError()
    .single();
}

export function getWorkoutMovements(workoutId: string) {
  const client = createClient();
  return client
    .from("workout_movements")
    .select("*")
    .eq("workout_id", workoutId)
    .order("order_index")
    .throwOnError();
}
