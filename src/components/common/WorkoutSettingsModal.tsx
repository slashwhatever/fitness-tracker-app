'use client';

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { TIMER_PRESETS, Workout } from '@/models/types';
import { SupabaseService } from '@/services/supabaseService';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Label } from "../ui/label";

interface WorkoutSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout;
  onWorkoutUpdated: (workout: Workout) => void;
  onWorkoutDeleted: (workoutId: string) => void;
}

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, "Workout name is required").min(2, "Workout name must be at least 2 characters"),
  description: z.string().optional(),
  default_rest_timer: z.string().optional().refine((val) => {
    if (!val || val === '' || val === 'none') return true;
    const num = parseInt(val);
    return !isNaN(num) && num >= 0;
  }, "Rest timer must be a valid number (0 or greater)"),
});

type FormData = z.infer<typeof formSchema>;

export default function WorkoutSettingsModal({
  isOpen,
  onClose,
  workout,
  onWorkoutUpdated,
  onWorkoutDeleted,
}: WorkoutSettingsModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Initialize form with React Hook Form and Zod validation using uncontrolled components
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

  // Populate form when workout changes
  useEffect(() => {
    if (workout && isOpen) {
      reset({
        name: workout.name,
        description: workout.description || "",
        default_rest_timer: workout.default_rest_timer?.toString() || "none",
      });
    }
  }, [workout, isOpen, reset]);

  const onSubmit = handleSubmit(async (values: FormData) => {
    setIsSaving(true);
    try {
      const updates = {
        name: values.name.trim(),
        description: values.description?.trim() || null,
        default_rest_timer: (values.default_rest_timer && values.default_rest_timer !== 'none') 
          ? parseInt(values.default_rest_timer) 
          : null,
        updated_at: new Date().toISOString(),
      };

      const updatedWorkout = await SupabaseService.updateWorkout(workout.id, updates);
      if (updatedWorkout) {
        onWorkoutUpdated(updatedWorkout);
        handleClose();
      }
    } catch (error) {
      console.error('Failed to save workout settings:', error);
    } finally {
      setIsSaving(false);
    }
  });

  const handleDelete = async () => {
    const success = await SupabaseService.deleteWorkout(workout.id);
    if (success) {
      onWorkoutDeleted(workout.id);
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form to original values
    reset({
      name: workout.name,
      description: workout.description || "",
      default_rest_timer: workout.default_rest_timer?.toString() || "none",
    });
    setShowDeleteConfirm(false);
    onClose();
  };

  const FormContent = ({ className = "" }: { className?: string }) => (
    <div className={`space-y-4 ${className}`}>
      {/* Workout Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">
          Workout Name *
        </Label>
        <Input
          id="name"
          placeholder="Enter workout name"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-muted-foreground">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Optional workout description"
          rows={3}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Rest Timer */}
      <div className="space-y-2">
        <Label htmlFor="default_rest_timer" className="text-sm font-medium text-muted-foreground">
          Default Rest Timer
        </Label>
        <Select 
          value={watch("default_rest_timer") || "none"} 
          onValueChange={(value) => setValue("default_rest_timer", value === "none" ? "" : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select rest timer">
              {(() => {
                const timerValue = watch("default_rest_timer");
                if (!timerValue || timerValue === "none") return "No Timer";
                const preset = TIMER_PRESETS.find(p => p.seconds.toString() === timerValue);
                return preset ? preset.label : "Select rest timer";
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <div className="flex flex-col items-start">
                <div className="font-medium">No Timer</div>
                <div className="text-sm text-muted-foreground">Don&apos;t set a default rest timer</div>
              </div>
            </SelectItem>
            {TIMER_PRESETS.map((preset) => (
              <SelectItem key={preset.seconds} value={preset.seconds.toString()}>
                <div className="flex flex-col items-start">
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-sm text-muted-foreground">{preset.seconds} seconds</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.default_rest_timer && (
          <p className="text-sm text-destructive">{errors.default_rest_timer.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          This timer will be used for all movements in this workout unless overridden
        </p>
      </div>
    </div>
  );

  const ActionButtons = () => (
    <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0 pt-4">
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowDeleteConfirm(true)}
        className="flex items-center justify-center space-x-2 w-full sm:w-auto"
      >
        <Trash2 className="w-4 h-4" />
        Delete workout
      </Button>

      <div className="flex flex-col-reverse sm:flex-row gap-2">
        <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={!isValid || isSaving}
          className="w-full sm:w-auto"
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Workout settings</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit}>
              <FormContent />
              <ActionButtons />
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete workout"
          description={`Are you sure you want to delete "${workout.name}"? This will permanently remove the workout. This action cannot be undone.`}
          confirmText="Delete Workout"
          cancelText="Cancel"
          variant="destructive"
        />
      </>
    );
  }

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DrawerContent className="!max-h-[95vh] flex flex-col">
          <DrawerHeader className="text-left">
            <DrawerTitle>Workout settings</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={onSubmit}>
            <FormContent className="px-4" />
            <DrawerFooter className="pt-2">
              <ActionButtons />
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete workout"
        description={`Are you sure you want to delete "${workout.name}"? This will permanently remove the workout. This action cannot be undone.`}
        confirmText="Delete Workout"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
