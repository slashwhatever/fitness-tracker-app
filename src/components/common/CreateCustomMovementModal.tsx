'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateUserMovement } from '@/hooks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { TrackingType } from '@/models/types';
import { useEffect } from 'react';

interface CreateCustomMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovementCreated: (userMovementId: string) => void;
  initialName?: string;
}

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 
  'Glutes', 'Calves', 'Cardio', 'Full Body'
];

const TRACKING_TYPES = [
  { value: 'weight' as TrackingType, label: 'Weight & Reps', description: 'Track weight lifted and repetitions' },
  { value: 'bodyweight' as TrackingType, label: 'Bodyweight', description: 'Track reps only (push-ups, pull-ups, etc.)' },
  { value: 'duration' as TrackingType, label: 'Duration', description: 'Track time (planks, holds, etc.)' },
  { value: 'distance' as TrackingType, label: 'Distance', description: 'Track distance (running, walking, etc.)' },
  { value: 'reps_only' as TrackingType, label: 'Reps Only', description: 'Just track repetitions' },
];

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, "Movement name is required").min(2, "Movement name must be at least 2 characters"),
  muscle_groups: z.array(z.string()).min(1, "At least one muscle group must be selected"),
  tracking_type: z.enum(["weight", "bodyweight", "duration", "distance", "reps_only"]),
  custom_rest_timer: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseInt(val);
    return !isNaN(num) && num >= 0;
  }, "Rest timer must be a valid number (0 or greater)"),
  personal_notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateCustomMovementModal({
  isOpen,
  onClose,
  onMovementCreated,
  initialName = '',
}: CreateCustomMovementModalProps) {
  const createUserMovementMutation = useCreateUserMovement();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Initialize form with React Hook Form and Zod validation using uncontrolled components
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    getValues,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      muscle_groups: [],
      tracking_type: "weight",
      custom_rest_timer: "",
      personal_notes: "",
    },
  });

  const watchMuscleGroups = watch("muscle_groups");

  // Reset form when modal opens/closes or initialName changes
  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialName || "",
        muscle_groups: [],
        tracking_type: "weight",
        custom_rest_timer: "",
        personal_notes: "",
      });
    }
  }, [isOpen, initialName, reset]);

  const onSubmit = handleSubmit(async (values: FormData) => {
    try {
      const newMovement = await createUserMovementMutation.mutateAsync({
        name: values.name.trim(),
        muscle_groups: values.muscle_groups,
        tracking_type: values.tracking_type,
        custom_rest_timer: values.custom_rest_timer ? parseInt(values.custom_rest_timer) : null,
        personal_notes: values.personal_notes?.trim() || null,
        template_id: null, // This is a custom movement
      });

      onMovementCreated(newMovement.id);
      handleClose();
    } catch (error) {
      console.error('Error creating custom movement:', error);
    }
  });

  const handleClose = () => {
    // Reset to empty values when closing
    reset({
      name: "",
      muscle_groups: [],
      tracking_type: "weight",
      custom_rest_timer: "",
      personal_notes: "",
    });
    onClose();
  };

  const handleMuscleGroupToggle = (group: string) => {
    const currentGroups = getValues("muscle_groups");
    const newGroups = currentGroups.includes(group)
      ? currentGroups.filter(g => g !== group)
      : [...currentGroups, group];
    setValue("muscle_groups", newGroups, { shouldValidate: true });
  };

  const FormContent = ({ className = "" }: { className?: string }) => (
    <div className={`space-y-4 min-h-0 ${className}`}>
      {/* Movement Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">
          Movement name *
        </Label>
        <Input 
          id="name"
          placeholder="e.g., Barbell Bench Press" 
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Tracking Type */}
      <div className="space-y-2">
        <Label htmlFor="tracking_type" className="text-sm font-medium text-muted-foreground">
          Tracking type *
        </Label>
        <Select 
          value={watch("tracking_type")} 
          onValueChange={(value) => setValue("tracking_type", value as TrackingType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select tracking type">
              {watch("tracking_type") ? 
                TRACKING_TYPES.find(t => t.value === watch("tracking_type"))?.label : 
                "Select tracking type"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TRACKING_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex flex-col items-start">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.tracking_type && (
          <p className="text-sm text-destructive">{errors.tracking_type.message}</p>
        )}
      </div>

      {/* Muscle Groups */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">
          Muscle groups * ({watchMuscleGroups?.length || 0} selected)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {MUSCLE_GROUPS.map((group) => (
            <Button
              key={group}
              variant="ghost"
              type="button"
              onClick={() => handleMuscleGroupToggle(group)}
              className={`p-2 text-sm rounded-md border transition-colors ${
                watchMuscleGroups?.includes(group)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-accent'
              }`}
            >
              {group}
            </Button>
          ))}
        </div>
        {errors.muscle_groups && (
          <p className="text-sm text-destructive">{errors.muscle_groups.message}</p>
        )}
      </div>

      {/* Custom Rest Timer */}
      <div className="space-y-2">
        <Label htmlFor="custom_rest_timer" className="text-sm font-medium text-muted-foreground">
          Custom rest timer (seconds)
        </Label>
        <Input 
          id="custom_rest_timer"
          type="number" 
          placeholder="e.g., 120" 
          min="0"
          {...register("custom_rest_timer")}
        />
        {errors.custom_rest_timer && (
          <p className="text-sm text-destructive">{errors.custom_rest_timer.message}</p>
        )}
      </div>

      {/* Personal Notes */}
      <div className="space-y-2">
        <Label htmlFor="personal_notes" className="text-sm font-medium text-muted-foreground">
          Personal notes
        </Label>
        <Textarea 
          id="personal_notes"
          placeholder="Any personal notes about this movement..."
          rows={3}
          {...register("personal_notes")}
        />
        {errors.personal_notes && (
          <p className="text-sm text-destructive">{errors.personal_notes.message}</p>
        )}
      </div>
    </div>
  );

  const ActionButtons = () => (
    <div className="flex justify-between items-center pt-4 border-t">
      <Button type="button" variant="outline" onClick={handleClose}>
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={!isValid || createUserMovementMutation.isPending}
      >
        {createUserMovementMutation.isPending ? 'Creating...' : 'Create Movement'}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] w-[90vw] flex flex-col">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Create custom movement</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="flex-1 flex flex-col space-y-4 min-h-0">
            <FormContent />
            <ActionButtons />
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DrawerContent className="!max-h-[95vh] flex flex-col">
        <DrawerHeader className="text-left flex-shrink-0">
          <DrawerTitle>Create custom movement</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4">
            <FormContent />
          </div>
          <DrawerFooter className="pt-2 flex-shrink-0">
            <ActionButtons />
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}