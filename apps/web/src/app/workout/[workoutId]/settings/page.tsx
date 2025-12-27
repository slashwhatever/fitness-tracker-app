"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  useDeleteWorkout,
  useUpdateWorkout,
  useWorkout,
} from "@/hooks/useWorkouts";
import { TIMER_PRESETS } from "@/models/types";
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
import { ConfirmationModal } from "@components/ui/confirmation-modal";
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
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface WorkoutSettingsPageProps {
  params: Promise<{ workoutId: string }>;
}

// Zod schema for form validation
const formSchema = z.object({
  name: z
    .string()
    .min(1, "Workout name is required")
    .min(2, "Workout name must be at least 2 characters"),
  description: z.string().optional(),
  default_rest_timer: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === "" || val === "none") return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    }, "Rest timer must be a valid number (0 or greater)"),
});

type FormData = z.infer<typeof formSchema>;

function WorkoutSettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
        <Skeleton className="h-10 w-full sm:w-36" />
        <div className="flex flex-col sm:flex-row gap-2">
          <Skeleton className="h-10 w-full sm:w-20" />
          <Skeleton className="h-10 w-full sm:w-28" />
        </div>
      </div>
    </div>
  );
}

export default function WorkoutSettingsPage({
  params,
}: WorkoutSettingsPageProps) {
  const router = useRouter();
  const { workoutId } = use(params);

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch workout data
  const {
    data: workout,
    isLoading: workoutLoading,
    status: workoutStatus,
  } = useWorkout(workoutId);

  // Use React Query hooks for proper cache management
  const updateWorkoutMutation = useUpdateWorkout();
  const deleteWorkoutMutation = useDeleteWorkout();

  // Initialize form with React Hook Form and Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: standardSchemaResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      description: "",
      default_rest_timer: "",
    },
  });

  // Populate form when workout loads
  useEffect(() => {
    if (workout) {
      reset({
        name: workout.name,
        description: workout.description || "",
        default_rest_timer: workout.default_rest_timer?.toString() || "none",
      });
    }
  }, [workout, reset]);

  const onSubmit = handleSubmit(async (values: FormData) => {
    if (!workout) return;

    setIsSaving(true);
    try {
      const updates = {
        name: values.name.trim(),
        description: values.description?.trim() || null,
        default_rest_timer:
          values.default_rest_timer && values.default_rest_timer !== "none"
            ? parseInt(values.default_rest_timer)
            : null,
        updated_at: new Date().toISOString(),
      };

      const updatedWorkout = await updateWorkoutMutation.mutateAsync({
        id: workout.id,
        updates,
      });

      if (updatedWorkout) {
        // Navigate back to workout detail page
        router.push(`/workout/${workoutId}`);
      }
    } catch (error) {
      console.error("Failed to save workout settings:", error);
    } finally {
      setIsSaving(false);
    }
  });

  const handleDelete = async () => {
    if (!workout) return;

    try {
      await deleteWorkoutMutation.mutateAsync(workout.id);
      // Navigate to dashboard after deletion
      router.push("/");
    } catch (error) {
      console.error("Failed to delete workout:", error);
    }
  };

  const handleCancel = () => {
    router.push(`/workout/${workoutId}`);
  };

  // Only show "not found" if we've finished fetching and there's no workout
  const hasFinishedFetching =
    workoutStatus === "success" || workoutStatus === "error";
  const workoutNotFound = hasFinishedFetching && !workout && !workoutLoading;

  if (workoutNotFound) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <CardTitle>Workout not found</CardTitle>
                <CardDescription className="text-muted-foreground mb-4">
                  The workout you&apos;re looking for doesn&apos;t exist or has
                  been deleted.
                </CardDescription>
                <Button asChild>
                  <Link href="/">Return to Dashboard</Link>
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
            type: "workout-settings",
            workoutId,
            workoutName: workout?.name,
          }}
        />
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4 mt-2">
            <Typography variant="title1">Workout settings</Typography>

            <Card>
              <CardContent className="p-4 sm:p-6">
                {workoutLoading ? (
                  <WorkoutSettingsPageSkeleton />
                ) : (
                  <form onSubmit={onSubmit} className="space-y-6">
                    {/* Workout name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Workout name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter workout name"
                        {...register("name")}
                      />
                      {errors.name?.message && (
                        <p className="text-sm text-destructive">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Optional workout description"
                        rows={3}
                        {...register("description")}
                      />
                      {errors.description?.message && (
                        <p className="text-sm text-destructive">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    {/* Rest Timer */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="default_rest_timer"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Default Rest Timer
                      </Label>
                      <Select
                        value={watch("default_rest_timer") || "none"}
                        onValueChange={(value) =>
                          setValue(
                            "default_rest_timer",
                            value === "none" ? "" : value
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select rest timer">
                            {(() => {
                              const timerValue = watch("default_rest_timer");
                              if (!timerValue || timerValue === "none")
                                return "No Timer";
                              const preset = TIMER_PRESETS.find(
                                (p) => p.seconds.toString() === timerValue
                              );
                              return preset
                                ? preset.label
                                : "Select rest timer";
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <div className="flex flex-col items-start">
                              <div className="font-medium">No Timer</div>
                              <div className="text-sm text-muted-foreground">
                                Don&apos;t set a default rest timer
                              </div>
                            </div>
                          </SelectItem>
                          {TIMER_PRESETS.map((preset) => (
                            <SelectItem
                              key={preset.seconds}
                              value={preset.seconds.toString()}
                            >
                              <div className="flex flex-col items-start">
                                <div className="font-medium">
                                  {preset.label}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {preset.seconds} seconds
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.default_rest_timer?.message && (
                        <p className="text-sm text-destructive">
                          {errors.default_rest_timer.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        This timer will be used for all movements in this
                        workout unless overridden
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t justify-between">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete workout
                      </Button>

                      <div className="flex flex-col-reverse sm:flex-row gap-2">
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
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {workout && (
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete workout"
          description={`Are you sure you want to delete "${workout.name}"? This will permanently remove the workout. This action cannot be undone.`}
          confirmText="Delete workout"
          cancelText="Cancel"
          variant="destructive"
        />
      )}
    </ProtectedRoute>
  );
}
