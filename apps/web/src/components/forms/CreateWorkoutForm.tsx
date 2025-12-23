"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createWorkoutAction,
  WorkoutActionResult,
} from "@/lib/actions/workouts";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

interface CreateWorkoutFormProps {
  className?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isDesktop?: boolean;
}

const initialState: WorkoutActionResult = {
  success: false,
};

export default function CreateWorkoutForm({
  className,
  onSuccess,
  onCancel,
  isDesktop,
}: CreateWorkoutFormProps) {
  const router = useRouter();

  // Wrapper for server action to handle state parameter
  const wrappedAction = async (
    prevState: WorkoutActionResult,
    formData: FormData
  ) => {
    return await createWorkoutAction(formData);
  };

  const [state, formAction, isPending] = useActionState(
    wrappedAction,
    initialState
  );

  // Handle successful workout creation
  useEffect(() => {
    if (state.success && state.data) {
      onSuccess?.();
      router.push(`/workout/${state.data.id}`);
    }
  }, [state.success, state.data, onSuccess, router]);

  return (
    <form action={formAction} className={cn(className, "space-y-4")}>
      {state.error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="text-sm font-medium text-muted-foreground"
        >
          Workout Title *
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter workout title"
          disabled={isPending}
          required
        />
        {state.fieldErrors?.name && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.name[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-medium text-muted-foreground"
        >
          Description (Optional)
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter workout description"
          rows={3}
          disabled={isPending}
        />
        {state.fieldErrors?.description && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.description[0]}
          </p>
        )}
      </div>

      {isDesktop && (
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Workout"
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
