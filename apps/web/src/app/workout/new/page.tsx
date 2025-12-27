"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateWorkout } from "@/hooks/useWorkouts";
import { ProtectedRoute } from "@components/auth/ProtectedRoute";
import ContextualNavigation from "@components/common/ContextualNavigation";
import { Typography } from "@components/common/Typography";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { useRouter } from "next/navigation";

// Zod schema for form validation
const formSchema = z.object({
  name: z
    .string()
    .min(1, "Workout name is required")
    .min(2, "Workout name must be at least 2 characters"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateWorkoutPage() {
  const router = useRouter();
  const createWorkoutMutation = useCreateWorkout();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: standardSchemaResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const savedWorkout = await createWorkoutMutation.mutateAsync({
        name: values.name.trim(),
        description: values.description?.trim() || null,
      });

      // Navigate to the new workout
      router.push(`/workout/${savedWorkout.id}`);
    } catch (error) {
      console.error("Failed to create workout:", error);
    }
  });

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <ContextualNavigation context={{ type: "create-workout" }} />
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4 mt-2">
            <Typography variant="title1">Create new workout</Typography>

            <Card>
              <CardContent className="p-4 sm:p-6">
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
                      disabled={createWorkoutMutation.isPending}
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
                      disabled={createWorkoutMutation.isPending}
                      {...register("description")}
                    />
                    {errors.description?.message && (
                      <p className="text-sm text-destructive">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={createWorkoutMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isValid || createWorkoutMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {createWorkoutMutation.isPending
                        ? "Creating..."
                        : "Create workout"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
