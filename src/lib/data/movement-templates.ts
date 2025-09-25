import { createClient } from "@/lib/supabase/server";
import { MovementTemplate, TrackingTypeName } from "@/models/types";

export async function getMovementTemplates(): Promise<MovementTemplate[]> {
  const supabase = await createClient();

  const query = supabase
    .from("movement_templates")
    .select(
      `
      *,
      tracking_type:tracking_types(name),
      movement_template_muscle_groups(
        muscle_group:muscle_groups(
          name,
          display_name
        )
      )
    `
    )
    .order("name");

  const { data, error } = await query;
  if (error) throw error;

  // Transform the data to include muscle_groups array and tracking_type
  // This matches the transformation from useMovementTemplates hook
  return data.map((template) => ({
    ...template,
    tracking_type:
      (template.tracking_type as any)?.name || ("weight" as TrackingTypeName),
    muscle_groups:
      template.movement_template_muscle_groups
        ?.map((mtmg: any) => mtmg.muscle_group?.display_name)
        .filter((name): name is string => Boolean(name)) || [],
  })) as MovementTemplate[];
}
