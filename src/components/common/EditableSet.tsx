'use client';

import { Set, UserMovement } from '@/models/types';
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
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(Number(e.target.value))}
                  className="w-20 p-2 border border-default rounded text-center bg-card text-card-foreground"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">Reps</label>
                <input
                  type="number"
                  value={editReps}
                  onChange={(e) => setEditReps(Number(e.target.value))}
                  className="w-16 p-2 border border-default rounded text-center bg-card text-card-foreground"
                  min="0"
                />
              </div>
            </>
          )}
          
          {movement.tracking_type === 'bodyweight' && (
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">Reps</label>
              <input
                type="number"
                value={editReps}
                onChange={(e) => setEditReps(Number(e.target.value))}
                className="w-16 p-2 border border-default rounded text-center bg-card text-card-foreground"
                min="0"
              />
            </div>
          )}
          
          {movement.tracking_type === 'duration' && (
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">Duration (seconds)</label>
              <input
                type="number"
                value={editDuration}
                onChange={(e) => setEditDuration(Number(e.target.value))}
                className="w-24 p-2 border border-default rounded text-center bg-card text-card-foreground"
                min="0"
              />
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={!isValidEdit()}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Cancel
            </button>
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
        <div className="flex space-x-2">
          <button
            onClick={handleDuplicate}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
            aria-label="Duplicate set"
          >
            Duplicate
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            aria-label="Edit set"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(set.id)}
            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            aria-label="Delete set"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
