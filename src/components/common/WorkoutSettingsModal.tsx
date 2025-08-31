'use client';

import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TIMER_PRESETS, Workout } from '@/models/types';
import { HybridStorageManager } from '@/lib/storage/HybridStorageManager';
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
  const [restTimer, setRestTimer] = useState(workout.default_rest_timer?.toString() || 'none');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    
    const updatedWorkout: Workout = {
      ...workout,
      name: name.trim(),
      description: description.trim() || null,
      default_rest_timer: restTimer && restTimer !== 'none' ? parseInt(restTimer) : null,
      updated_at: new Date().toISOString(),
    };

    // Save to storage
    await HybridStorageManager.saveRecord('workouts', updatedWorkout);
    
    // Notify parent component
    onWorkoutUpdated(updatedWorkout);
    
    setIsSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    // Delete from storage
    await HybridStorageManager.deleteRecord('workouts', workout.id);
    
    // Notify parent component
    onWorkoutDeleted(workout.id);
    
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleClose = () => {
    // Reset form to original values
    setName(workout.name);
    setDescription(workout.description || '');
    setRestTimer(workout.default_rest_timer?.toString() || 'none');
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Workout Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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
              <Select value={restTimer} onValueChange={setRestTimer}>
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

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Workout</span>
              </Button>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={!name.trim() || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
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
