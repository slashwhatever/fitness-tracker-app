'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Workout } from '@/models/types';
import { SupabaseService } from '@/services/supabaseService';
import { useState } from 'react';

interface CreateWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutCreated: (workout: Workout) => void;
}

export default function CreateWorkoutModal({
  isOpen,
  onClose,
  onWorkoutCreated,
}: CreateWorkoutModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !user?.id) return;

    setIsCreating(true);
    try {
      const newWorkout = {
        id: crypto.randomUUID(),
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        default_rest_timer: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const savedWorkout = await SupabaseService.saveWorkout(newWorkout);
      if (savedWorkout) {
        onWorkoutCreated(savedWorkout);
        setName('');
        setDescription('');
        onClose();
      }
    } catch (error) {
      console.error('Failed to create workout:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Workout</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Workout Title *
            </Label>
            <Input
              type="text"
              id="title"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workout title"
              disabled={isCreating}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter workout description"
              rows={3}
              disabled={isCreating}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !name.trim()}
            >
              {isCreating ? 'Creating...' : 'Create Workout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
