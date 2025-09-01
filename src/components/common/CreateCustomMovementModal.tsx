'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateUserMovement } from '@/hooks';
import type { TrackingType } from '@/models/types';
import { useState } from 'react';

interface CreateCustomMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovementCreated: (userMovementId: string) => void;
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

export default function CreateCustomMovementModal({
  isOpen,
  onClose,
  onMovementCreated,
}: CreateCustomMovementModalProps) {
  const [name, setName] = useState('');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [trackingType, setTrackingType] = useState<TrackingType | ''>('');
  const [customRestTimer, setCustomRestTimer] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');

  const createUserMovementMutation = useCreateUserMovement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !trackingType || selectedMuscleGroups.length === 0) return;

    try {
      const newMovement = await createUserMovementMutation.mutateAsync({
        name: name.trim(),
        muscle_groups: selectedMuscleGroups,
        tracking_type: trackingType,
        custom_rest_timer: customRestTimer ? parseInt(customRestTimer) : null,
        personal_notes: personalNotes.trim() || null,
        template_id: null, // This is a custom movement
      });

      onMovementCreated(newMovement.id);
      handleClose();
    } catch (error) {
      console.error('Error creating custom movement:', error);
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedMuscleGroups([]);
    setTrackingType('');
    setCustomRestTimer('');
    setPersonalNotes('');
    onClose();
  };

  const handleMuscleGroupToggle = (group: string) => {
    setSelectedMuscleGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-md max-h-[85vh] w-[90vw] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">Create Custom Movement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4 min-h-0">
          {/* Movement Name */}
          <div>
            <Label htmlFor="name">Movement Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Barbell Bench Press"
              required
            />
          </div>

          {/* Tracking Type */}
          <div>
            <Label htmlFor="trackingType">Tracking Type *</Label>
            <Select value={trackingType} onValueChange={(value) => setTrackingType(value as TrackingType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tracking type" />
              </SelectTrigger>
              <SelectContent>
                {TRACKING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Muscle Groups */}
          <div>
            <Label>Muscle Groups * ({selectedMuscleGroups.length} selected)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {MUSCLE_GROUPS.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => handleMuscleGroupToggle(group)}
                  className={`p-2 text-sm rounded-md border transition-colors ${
                    selectedMuscleGroups.includes(group)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Rest Timer */}
          <div>
            <Label htmlFor="restTimer">Custom Rest Timer (seconds)</Label>
            <Input
              id="restTimer"
              type="number"
              value={customRestTimer}
              onChange={(e) => setCustomRestTimer(e.target.value)}
              placeholder="e.g., 120"
              min="0"
            />
          </div>

          {/* Personal Notes */}
          <div>
            <Label htmlFor="notes">Personal Notes</Label>
            <Textarea
              id="notes"
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Any personal notes about this movement..."
              rows={3}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || !trackingType || selectedMuscleGroups.length === 0 || createUserMovementMutation.isPending}
            >
              {createUserMovementMutation.isPending ? 'Creating...' : 'Create Movement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}