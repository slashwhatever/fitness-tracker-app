'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Set, UserMovement } from '@/models/types';
import { Copy, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface EditableSetProps {
  set: Set;
  movement: UserMovement;
  onUpdate: (updatedSet: Set) => void;
  onDelete: (setId: string) => void;
  onDuplicate: (set: Set) => void;
}

export default function EditableSet({ set, movement, onUpdate, onDelete, onDuplicate }: EditableSetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editReps, setEditReps] = useState(set.reps || 0);
  const [editWeight, setEditWeight] = useState(set.weight || 0);
  const [editDuration, setEditDuration] = useState(set.duration || 0);

  const handleSave = () => {
    const updatedSet: Set = {
      ...set,
      ...(movement.tracking_type === 'weight' && { 
        reps: editReps || undefined, 
        weight: editWeight || undefined 
      }),
      ...(movement.tracking_type === 'bodyweight' && { 
        reps: editReps || undefined 
      }),
      ...(movement.tracking_type === 'duration' && { 
        duration: editDuration || undefined 
      })
    };

    onUpdate(updatedSet);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditReps(set.reps || 0);
    setEditWeight(set.weight || 0);
    setEditDuration(set.duration || 0);
    setIsEditing(false);
  };

  const isValidEdit = () => {
    switch (movement.tracking_type) {
      case 'weight':
        return editReps > 0 && editWeight > 0;
      case 'bodyweight':
        return editReps > 0;
      case 'duration':
        return editDuration > 0;
      default:
        return false;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDuplicate = () => {
    onDuplicate(set);
  };

  if (isEditing) {
    return (
      <div className="flex justify-between items-center p-4 bg-card border border-default rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {new Date(set.created_at).toLocaleDateString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(set.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      
        <div className="flex items-center space-x-3">
          {movement.tracking_type === 'weight' && (
            <>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="edit-weight" className="text-xs">Weight (lbs)</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(Number(e.target.value))}
                  className="w-20 text-center"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="edit-reps" className="text-xs">Reps</Label>
                <Input
                  id="edit-reps"
                  type="number"
                  value={editReps}
                  onChange={(e) => setEditReps(Number(e.target.value))}
                  className="w-16 text-center"
                  min="0"
                />
              </div>
            </>
          )}
          
          {movement.tracking_type === 'bodyweight' && (
            <div className="flex flex-col space-y-2">
              <Label htmlFor="edit-reps" className="text-xs">Reps</Label>
              <Input
                id="edit-reps"
                type="number"
                value={editReps}
                onChange={(e) => setEditReps(Number(e.target.value))}
                className="w-16 text-center"
                min="0"
              />
            </div>
          )}
          
          {movement.tracking_type === 'duration' && (
            <div className="flex flex-col space-y-2">
              <Label htmlFor="edit-duration" className="text-xs">Duration (seconds)</Label>
              <Input
                id="edit-duration"
                type="number"
                value={editDuration}
                onChange={(e) => setEditDuration(Number(e.target.value))}
                className="w-24 text-center"
                min="0"
              />
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button
              onClick={handleSave}
              disabled={!isValidEdit()}
              size="sm"
              className="bg-green-500 hover:bg-green-600"
            >
              Save
            </Button>
            <Button
              onClick={handleCancel}
              variant="secondary"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center p-4 bg-card border border-default rounded-lg hover:border-gray-300 transition-all cursor-pointer">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-muted-foreground">
          {new Date(set.created_at).toLocaleDateString()}
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date(set.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    
      <div className="flex items-center space-x-6">
        {/* Set Data Display */}
        <div className="text-right">
          {movement.tracking_type === 'weight' && (
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-foreground">{set.weight}</span>
              <span className="text-sm text-muted-foreground">lbs</span>
              <span className="text-muted-foreground">×</span>
              <span className="text-xl font-semibold text-foreground">{set.reps}</span>
              <span className="text-sm text-muted-foreground">reps</span>
            </div>
          )}
          
          {movement.tracking_type === 'bodyweight' && (
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-foreground">{set.reps}</span>
              <span className="text-sm text-muted-foreground">reps</span>
            </div>
          )}
          
          {movement.tracking_type === 'duration' && set.duration && (
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-foreground">{formatDuration(set.duration)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleDuplicate}
            size="sm"
            className="bg-green-500 hover:bg-green-600 h-9"
          >
            <Copy className="w-4 h-4 mr-1" />
            Duplicate
          </Button>
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="icon"
            className="h-9 w-9"
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => onDelete(set.id)}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-red-500 h-9 w-9"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
