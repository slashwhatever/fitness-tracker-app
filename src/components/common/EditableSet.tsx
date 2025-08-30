'use client';

import { Set, UserMovement } from '@/models/types';
import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

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
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showSwipeAction, setShowSwipeAction] = useState(false);

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
    setSwipeOffset(0);
    setShowSwipeAction(false);
  };

  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      if (isEditing) return;
      
      const offset = eventData.deltaX;
      const maxOffset = 100;
      
      if (offset > 0) {
        // Swiping right - show duplicate action
        const clampedOffset = Math.min(offset, maxOffset);
        setSwipeOffset(clampedOffset);
        setShowSwipeAction(clampedOffset > 50);
      }
    },
    onSwipedRight: (eventData) => {
      if (isEditing) return;
      
      if (eventData.deltaX > 100) {
        // Complete swipe - duplicate the set
        handleDuplicate();
      } else {
        // Partial swipe - reset
        setSwipeOffset(0);
        setShowSwipeAction(false);
      }
    },
    onSwiped: () => {
      // Reset on any completed swipe
      setTimeout(() => {
        setSwipeOffset(0);
        setShowSwipeAction(false);
      }, 200);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Swipe Action Background */}
      <div 
        className={`absolute inset-0 bg-green-500 flex items-center justify-start pl-6 transition-opacity ${
          showSwipeAction ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center space-x-2 text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Duplicate</span>
        </div>
      </div>
      
      {/* Main Set Content */}
      <div 
        {...swipeHandlers}
        className="flex justify-between items-center p-4 bg-card border border-default rounded-lg hover:border-gray-300 transition-all cursor-pointer relative"
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 ? 'transform 0.2s ease-out' : 'none'
        }}
      >
        {/* Swipe Hint */}
        {!isEditing && swipeOffset === 0 && (
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground opacity-30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {new Date(set.created_at).toLocaleDateString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(set.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      
      {isEditing ? (
        <div className="flex items-center space-x-3">
          {movement.tracking_type === 'weight' && (
            <>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  value={editWeight || ''}
                  onChange={(e) => setEditWeight(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">Reps</label>
                <input
                  type="number"
                  value={editReps || ''}
                  onChange={(e) => setEditReps(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </>
          )}
          
          {movement.tracking_type === 'bodyweight' && (
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Reps</label>
              <input
                type="number"
                value={editReps || ''}
                onChange={(e) => setEditReps(Number(e.target.value))}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          )}
          
          {movement.tracking_type === 'duration' && (
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Duration (sec)</label>
              <input
                type="number"
                value={editDuration || ''}
                onChange={(e) => setEditDuration(Number(e.target.value))}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={!isValidEdit()}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
               ) : (
           <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-3">
               {set.weight && <span className="font-medium text-card-foreground">{set.weight} lbs</span>}
               {set.reps && <span className="font-medium text-card-foreground">{set.reps} reps</span>}
               {set.duration && (
                 <span className="font-medium text-card-foreground">
                   {formatDuration(set.duration)}
                 </span>
               )}
             </div>
             
             <div className="flex space-x-2">
               <button
                 onClick={handleDuplicate}
                 className="px-3 py-1 bg-success text-white text-sm rounded hover:bg-green-600 transition-colors"
                 aria-label="Duplicate set"
               >
                 Duplicate
               </button>
               <button
                 onClick={() => setIsEditing(true)}
                 className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-blue-600 transition-colors"
                 aria-label="Edit set"
               >
                 Edit
               </button>
               <button
                 onClick={() => onDelete(set.id)}
                 className="px-3 py-1 bg-error text-white text-sm rounded hover:bg-red-600 transition-colors"
                 aria-label="Delete set"
               >
                 Delete
               </button>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 }
