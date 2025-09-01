import { createClient } from "@/lib/supabase/client";

export function getWorkouts(userId: string) {
  const client = createClient();
  return client
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .throwOnError();
}

export function getWorkout(workoutId: string) {
  const client = createClient();
  return client
    .from("workouts")
    .select("*")
    .eq("id", workoutId)
    .throwOnError()
    .single();
}
