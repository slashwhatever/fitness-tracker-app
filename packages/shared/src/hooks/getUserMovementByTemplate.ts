import type { QueryData, SupabaseClient } from "@supabase/supabase-js";
import type { TrackingTypeName, UserMovement } from "../models/types";
import type { Database } from "../types/database.types";

// Helper to check if user already has a movement from a specific template
export async function getUserMovementByTemplate(
  supabase: SupabaseClient<Database>,
  userId: string,
  templateId: string
): Promise<UserMovement | null> {
  const query = supabase
    .from("user_movements")
    .select(
      `
      id,
      name,
      personal_notes,
      tags,
      experience_level,
      tracking_type_id,
      custom_rest_timer,
      last_used_at,
      manual_1rm,
      migrated_from_template,
      migration_date,
      original_template_id,
      template_id,
      user_id,
      created_at,
      updated_at,
      tracking_types!inner(name),
      user_movement_muscle_groups(
        muscle_groups(name, display_name)
      )
    `
    )
    .eq("user_id", userId)
    .or(`template_id.eq.${templateId},original_template_id.eq.${templateId}`)
    .single();

  type QueryResult = QueryData<typeof query>;

  const { data, error } = await query;

  if (error) {
    // Not found is okay, return null
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  if (!data) return null;

  const result = data as QueryResult;

  return {
    ...result,
    tracking_type:
      result.tracking_types?.name || ("weight" as TrackingTypeName),
    muscle_groups:
      result.user_movement_muscle_groups
        ?.map((ummg) => ummg.muscle_groups?.display_name)
        .filter((name): name is string => Boolean(name)) || [],
  } as UserMovement;
}
