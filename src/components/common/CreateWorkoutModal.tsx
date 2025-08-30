'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Workout } from '@/models/types';
import { persistenceService } from '@/services/persistenceService';
import { useState } from 'react';

interface CreateWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutCreated: (workout: Workout) => void;
}

export default function CreateWorkoutModal({ isOpen, onClose, onWorkoutCreated }: CreateWorkoutModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Workout title is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newWorkout: Workout = {
        id: crypto.randomUUID(),
        user_id: 'user', // TODO: Get actual user ID
        name: title.trim(),
        description: description.trim() || null,
        default_rest_timer: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const success = persistenceService.saveWorkout(newWorkout);
      
      if (success) {
        onWorkoutCreated(newWorkout);
        handleClose();
      } else {
        setError('Failed to save workout. Please try again.');
      }
    } catch (error) {
      console.error('Workout creation error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Workout</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Workout Title *
            </Label>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter workout title"
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Workout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
