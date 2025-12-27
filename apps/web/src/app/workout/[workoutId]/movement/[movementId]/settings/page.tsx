"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  useUpdateUserMovement,
  useUpdateWorkoutMovementNotes,
  useUserMovement,
  useWorkoutMovements,
} from "@/hooks/useMovements";
import { useMuscleGroups } from "@/hooks/useMuscleGroups";
import { useTrackingTypes } from "@/hooks/useTrackingTypes";
import { useWorkout } from "@/hooks/useWorkouts";
import { ProtectedRoute } from "@components/auth/ProtectedRoute";
import ContextualNavigation from "@components/common/ContextualNavigation";
import { Typography } from "@components/common/Typography";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@components/ui/card";
import { FancyMultiSelect } from "@components/ui/fancy-multi-select";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Skeleton } from "@components/ui/skeleton";
import { Textarea } from "@components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface MovementSettingsPageProps {
  params: Promise<{ workoutId: string; movementId: string }>;
}

// Zod schema for form validation
const formSchema = z.object({
  name: z
    .string()
    .min(1, "Movement name is required")
    .min(2, "Movement name must be at least 2 characters"),
  muscle_groups: z
    .array(z.string())
    .min(1, "At least one muscle group must be selected"),
  tracking_type: z.enum([
    "weight",
    "bodyweight",
    "duration",
    "distance",
    "reps",
  ]),
  custom_rest_timer: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    }, "Rest timer must be a valid number (0 or greater)"),
  personal_notes: z.string().optional(),
  workout_notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

function MovementSettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}

export default function MovementSettingsPage({
  params,
}: MovementSettingsPageProps) {
  const router = useRouter();
  const { workoutId, movementId } = use(params);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch data
  const { data: workout } = useWorkout(workoutId);
  const {
    data: movement,
    isLoading: movementLoading,
    status: movementStatus,
  } = useUserMovement(movementId);
  const { data: workoutMovements = [] } = useWorkoutMovements(workoutId);
  const { data: trackingTypes = [], isLoading: trackingTypesLoading } =
    useTrackingTypes();
  const { data: muscleGroups = [], isLoading: muscleGroupsLoading } =
    useMuscleGroups();

  const updateUserMovementMutation = useUpdateUserMovement();
  const updateWorkoutNotesMutation = useUpdateWorkoutMovementNotes();

  // Find the workout movement context
  const workoutMovement = workoutMovements.find(
    (wm) => wm.user_movement_id === movementId
  );

  const isLoading =
    movementLoading || trackingTypesLoading || muscleGroupsLoading;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: standardSchemaResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      muscle_groups: [],
      tracking_type: "weight",
      custom_rest_timer: "",
      personal_notes: "",
      workout_notes: "",
    },
  });

  const watchMuscleGroups = watch("muscle_groups");

  // Populate form when movement loads
  useEffect(() => {
    if (movement) {
      reset({
        name: movement.name,
        muscle_groups: movement.muscle_groups || [],
        tracking_type: movement.tracking_type as
          | "weight"
          | "bodyweight"
          | "duration"
          | "distance"
          | "reps",
        custom_rest_timer: movement.custom_rest_timer?.toString() || "",
        personal_notes: movement.personal_notes || "",
        workout_notes: workoutMovement?.workout_notes || "",
      });
    }
  }, [movement, workoutMovement, reset]);

  const onSubmit = handleSubmit(async (values: FormData) => {
    if (!movement) return;

    setIsSaving(true);
    setError("");

    try {
      const trackingType = trackingTypes.find(
        (tt) => tt.name === values.tracking_type
      );
      if (!trackingType) {
        throw new Error(`Unknown tracking type: ${values.tracking_type}`);
      }

      // Update the movement
      await updateUserMovementMutation.mutateAsync({
        id: movement.id,
        updates: {
          name: values.name.trim(),
          muscle_groups: values.muscle_groups,
          tracking_type_id: trackingType.id,
          custom_rest_timer: values.custom_rest_timer
            ? parseInt(values.custom_rest_timer)
            : null,
          personal_notes: values.personal_notes?.trim() || null,
        },
      });

      // Update workout-specific notes if in workout context
      if (workoutMovement) {
        await updateWorkoutNotesMutation.mutateAsync({
          workoutMovementId: workoutMovement.id,
          workout_notes: values.workout_notes?.trim() || null,
        });
      }

      // Navigate back to workout
      router.push(`/workout/${workoutId}`);
    } catch (err) {
      console.error("Error updating movement:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  });

  const handleCancel = () => {
    router.push(`/workout/${workoutId}`);
  };

  const handleMuscleGroupsChange = (selectedGroups: string[]) => {
    setValue("muscle_groups", selectedGroups, { shouldValidate: true });
  };

  // Handle not found state
  const hasFinishedFetching =
    movementStatus === "success" || movementStatus === "error";
  const movementNotFound = hasFinishedFetching && !movement && !movementLoading;

  if (movementNotFound) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <CardTitle>Movement not found</CardTitle>
                <CardDescription className="text-muted-foreground mb-4">
                  The movement you&apos;re looking for doesn&apos;t exist or has
                  been deleted.
                </CardDescription>
                <Button asChild>
                  <Link href={`/workout/${workoutId}`}>Return to Workout</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <ContextualNavigation
          context={{
            type: "movement-detail",
            workoutId,
            workoutName: workout?.name,
            movementName: movement?.name,
          }}
        />
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4 mt-2">
            <Typography variant="title1">Movement settings</Typography>

            <Card>
              <CardContent className="p-4 sm:p-6">
                {isLoading ? (
                  <MovementSettingsPageSkeleton />
                ) : (
                  <form onSubmit={onSubmit} className="space-y-6">
                    {/* Movement Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Movement name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., Barbell Bench Press"
                        {...register("name", {
                          onChange: () => setError(""),
                        })}
                      />
                      {errors.name?.message && (
                        <p className="text-sm text-destructive">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Tracking Type */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="tracking_type"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Tracking type *
                      </Label>
                      <Select
                        value={watch("tracking_type")}
                        onValueChange={(value) =>
                          setValue(
                            "tracking_type",
                            value as
                              | "weight"
                              | "bodyweight"
                              | "duration"
                              | "distance"
                              | "reps"
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select tracking type">
                            {watch("tracking_type")
                              ? trackingTypes.find(
                                  (t) => t.name === watch("tracking_type")
                                )?.display_name
                              : "Select tracking type"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {trackingTypes.map((type) => (
                            <SelectItem key={type.id} value={type.name}>
                              <div className="flex flex-col items-start">
                                <div className="font-medium">
                                  {type.display_name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {type.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tracking_type?.message && (
                        <p className="text-sm text-destructive">
                          {errors.tracking_type.message}
                        </p>
                      )}
                    </div>

                    {/* Muscle Groups */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="muscle_groups"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Muscle groups * ({watchMuscleGroups?.length || 0}{" "}
                        selected)
                      </Label>
                      <FancyMultiSelect
                        className="h-full"
                        options={muscleGroups.map((group) => ({
                          label: group.display_name,
                          value: group.display_name,
                        }))}
                        defaultValue={watchMuscleGroups || []}
                        onValueChange={handleMuscleGroupsChange}
                        placeholder="Select muscle groups..."
                      />
                      {errors.muscle_groups?.message && (
                        <p className="text-sm text-destructive">
                          {errors.muscle_groups.message}
                        </p>
                      )}
                    </div>

                    {/* Custom Rest Timer */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="custom_rest_timer"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Custom rest timer (seconds)
                      </Label>
                      <Input
                        id="custom_rest_timer"
                        type="number"
                        placeholder="e.g., 120"
                        min="0"
                        {...register("custom_rest_timer")}
                      />
                      {errors.custom_rest_timer?.message && (
                        <p className="text-sm text-destructive">
                          {errors.custom_rest_timer.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Leave empty to use the workout or global default
                      </p>
                    </div>

                    {/* Personal Notes */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="personal_notes"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Personal notes
                      </Label>
                      <Textarea
                        id="personal_notes"
                        placeholder="Any personal notes about this movement..."
                        rows={3}
                        {...register("personal_notes")}
                      />
                      {errors.personal_notes?.message && (
                        <p className="text-sm text-destructive">
                          {errors.personal_notes.message}
                        </p>
                      )}
                    </div>

                    {/* Workout-Specific Notes */}
                    {workoutMovement && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="workout_notes"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Workout notes (for this workout only)
                        </Label>
                        <Textarea
                          id="workout_notes"
                          placeholder="Notes specific to this movement in this workout..."
                          rows={3}
                          {...register("workout_notes")}
                        />
                        <p className="text-xs text-muted-foreground">
                          These notes apply only when this movement is used in
                          this workout.
                        </p>
                        {errors.workout_notes?.message && (
                          <p className="text-sm text-destructive">
                            {errors.workout_notes.message}
                          </p>
                        )}
                      </div>
                    )}

                    {error && (
                      <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-md p-3">
                        {error}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isValid || isSaving}
                        className="w-full sm:w-auto"
                      >
                        {isSaving ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
