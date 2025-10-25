"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { FieldErrors, useForm, UseFormRegister } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useCreateWorkout } from "@/hooks/useWorkouts";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Workout } from "@/models/types";

interface CreateWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutCreated: (workout: Workout) => void;
}

// Zod schema for form validation
const formSchema = z.object({
  name: z
    .string()
    .min(1, "Workout name is required")
    .min(2, "Workout name must be at least 2 characters"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface WorkoutFormContentProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isLoading: boolean;
  isValid: boolean;
  onCancel: () => void;
  className?: string;
}

function WorkoutFormContent({
  register,
  errors,
  onSubmit,
  isLoading,
  isValid,
  onCancel,
  className = "",
}: WorkoutFormContentProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <form onSubmit={onSubmit} className={cn(className, "space-y-2")}>
      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="text-sm font-medium text-muted-foreground"
        >
          Workout Title *
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter workout title"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
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
          {...register("description")}
          placeholder="Enter workout description"
          rows={3}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {isDesktop && (
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Creating..." : "Create Workout"}
          </Button>
        </div>
      )}

      {!isDesktop && (
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full"
          >
            {isLoading ? "Creating..." : "Create Workout"}
          </Button>
        </div>
      )}
    </form>
  );
}

export default function CreateWorkoutModal({
  isOpen,
  onClose,
  onWorkoutCreated,
}: CreateWorkoutModalProps) {
  const createWorkoutMutation = useCreateWorkout();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Initialize form with React Hook Form and Zod validation using uncontrolled components
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
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

      onWorkoutCreated(savedWorkout);
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to create workout:", error);
    }
  });

  // Handle modal close (cancel) with form reset
  const handleClose = () => {
    reset();
    onClose();
  };

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create new workout</DialogTitle>
          </DialogHeader>
          <WorkoutFormContent
            register={register}
            errors={errors}
            onSubmit={onSubmit}
            isLoading={createWorkoutMutation.isPending}
            isValid={isValid}
            onCancel={handleClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Create new workout</DrawerTitle>
        </DrawerHeader>
        <WorkoutFormContent
          register={register}
          errors={errors}
          onSubmit={onSubmit}
          isLoading={createWorkoutMutation.isPending}
          isValid={isValid}
          onCancel={handleClose}
          className="px-4"
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
