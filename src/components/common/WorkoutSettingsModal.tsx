'use client';

import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { TIMER_PRESETS, Workout } from '@/models/types';
import { SupabaseService } from '@/services/supabaseService';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface WorkoutSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout;
  onWorkoutUpdated: (workout: Workout) => void;
  onWorkoutDeleted: (workoutId: string) => void;
}

export default function WorkoutSettingsModal({
  isOpen,
  onClose,
  workout,
  onWorkoutUpdated,
  onWorkoutDeleted,
}: WorkoutSettingsModalProps) {
  const [name, setName] = useState(workout.name);
  const [description, setDescription] = useState(workout.description || '');
  const [defaultRestTimer, setDefaultRestTimer] = useState(workout.default_rest_timer?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = {
        name: name.trim(),
        description: description.trim() || null,
        default_rest_timer: defaultRestTimer ? parseInt(defaultRestTimer) : null,
        updated_at: new Date().toISOString(),
      };

      const updatedWorkout = await SupabaseService.updateWorkout(workout.id, updates);
      if (updatedWorkout) {
        onWorkoutUpdated(updatedWorkout);
        onClose();
      }
    } catch (error) {
      console.error('Failed to save workout settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const success = await SupabaseService.deleteWorkout(workout.id);
    if (success) {
      onWorkoutDeleted(workout.id);
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form to original values
    setName(workout.name);
    setDescription(workout.description || '');
    setDefaultRestTimer(workout.default_rest_timer?.toString() || '');
    setShowDeleteConfirm(false);
    onClose();
  };

  const FormContent = ({ className = "" }: { className?: string }) => (
    <div className={`space-y-4 ${className}`}>
      {/* Workout Name */}
      <div className="space-y-2">
        <Label htmlFor="workout-name">Workout Name *</Label>
        <Input
          id="workout-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter workout name"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="workout-description">Description</Label>
        <Textarea
          id="workout-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional workout description"
          rows={3}
        />
      </div>

      {/* Rest Timer */}
      <div className="space-y-2">
        <Label htmlFor="rest-timer">Default Rest Timer</Label>
        <Select value={defaultRestTimer} onValueChange={setDefaultRestTimer}>
          <SelectTrigger>
            <SelectValue placeholder="Select rest timer (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No default timer</SelectItem>
            {TIMER_PRESETS.map((preset) => (
              <SelectItem key={preset.seconds} value={preset.seconds.toString()}>
                {preset.label} ({preset.seconds}s)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <span>Delete Workout</span>
      </Button>

      <div className="flex flex-col-reverse sm:flex-row gap-2">
        <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!name.trim() || isSaving}
          className="w-full sm:w-auto"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
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
              <DialogTitle>Workout Settings</DialogTitle>
            </DialogHeader>
            <FormContent />
            <ActionButtons />
          </DialogContent>
        </Dialog>

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Workout"
          description={`Are you sure you want to delete "${workout.name}"? This will permanently remove the workout and all its movements. This action cannot be undone.`}
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
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Workout Settings</DrawerTitle>
          </DrawerHeader>
          <FormContent className="px-4" />
          <DrawerFooter className="pt-2">
            <ActionButtons />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Workout"
        description={`Are you sure you want to delete "${workout.name}"? This will permanently remove the workout and all its movements. This action cannot be undone.`}
        confirmText="Delete Workout"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
