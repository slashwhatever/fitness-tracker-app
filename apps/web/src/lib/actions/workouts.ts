"use server";

import { createClient } from "@/lib/supabase/server";
import { Workout } from "@fitness/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const createWorkoutSchema = z.object({
  name: z
    .string()
    .min(1, "Workout name is required")
    .min(2, "Workout name must be at least 2 characters"),
  description: z.string().optional(),
});

const deleteWorkoutSchema = z.object({
  workoutId: z.string().min(1, "Workout ID is required"),
});

export type WorkoutActionResult = {
  success: boolean;
  data?: Workout;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createWorkoutAction(
  formData: FormData
): Promise<WorkoutActionResult> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
    };

    // Validate input
    const result = createWorkoutSchema.safeParse(rawData);
    if (!result.success) {
      return {
        success: false,
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const { name, description } = result.data;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Get the current max order_index to place new workout at the end
    const { data: existingWorkouts } = await supabase
      .from("workouts")
      .select("order_index")
      .eq("user_id", user.id)
      .order("order_index", { ascending: false })
      .limit(1);

    const maxOrderIndex = existingWorkouts?.[0]?.order_index ?? -1;

    // Create workout
    const { data, error } = await supabase
      .from("workouts")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        user_id: user.id,
        order_index: maxOrderIndex + 1,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate relevant pages
    revalidatePath("/");
    revalidatePath("/workout/[workoutId]", "layout");

    return {
      success: true,
      data: data as Workout,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function deleteWorkoutAction(
  workoutId: string
): Promise<WorkoutActionResult> {
  try {
    // Validate input
    const result = deleteWorkoutSchema.safeParse({ workoutId });
    if (!result.success) {
      return {
        success: false,
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Delete workout (also deletes related workout_movements due to cascade)
    const { error } = await supabase
      .from("workouts")
      .delete()
      .eq("id", workoutId)
      .eq("user_id", user.id); // Ensure user owns the workout

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate relevant pages
    revalidatePath("/");
    revalidatePath("/workout/[workoutId]", "layout");

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
