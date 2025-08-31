'use client';

import { Set, UserMovement } from '@/models/types';
import { getUserWeightUnit } from '@/utils/userPreferences';
import { useState } from 'react';

interface QuickSetEntryProps {
  movement: UserMovement;
  lastSet?: Set;
  onQuickLog: (set: Partial<Set>) => void;
}

export default function QuickSetEntry({ movement, lastSet, onQuickLog }: QuickSetEntryProps) {
  const [quickReps, setQuickReps] = useState(lastSet?.reps || 0);
  const [quickWeight, setQuickWeight] = useState(lastSet?.weight || 0);
  const [quickDuration, setQuickDuration] = useState(lastSet?.duration || 0);

  const handleQuickLog = () => {
    const setData: Partial<Set> = {
      ...(movement.tracking_type === 'weight' && { 
        reps: quickReps || undefined, 
        weight: quickWeight || undefined 
      }),
      ...(movement.tracking_type === 'bodyweight' && { 
        reps: quickReps || undefined 
      }),
      ...(movement.tracking_type === 'duration' && { 
        duration: quickDuration || undefined 
      })
    };

    onQuickLog(setData);
  };


  const isValidQuickSet = () => {
    switch (movement.tracking_type) {
      case 'weight':
        return quickReps > 0 && quickWeight > 0;
      case 'bodyweight':
        return quickReps > 0;
      case 'duration':
        return quickDuration > 0;
      default:
        return false;
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-50">Quick Entry</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {movement.tracking_type === 'weight' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Weight ({getUserWeightUnit()})
              </label>
              <input
                type="number"
                value={quickWeight || ''}
                onChange={(e) => setQuickWeight(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 text-slate-50 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Reps
              </label>
              <input
                type="number"
                value={quickReps || ''}
                onChange={(e) => setQuickReps(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 text-slate-50 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </>
        )}
        
        {movement.tracking_type === 'bodyweight' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reps
            </label>
            <input
              type="number"
              value={quickReps || ''}
              onChange={(e) => setQuickReps(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-700 text-slate-50 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
        )}
        
        {movement.tracking_type === 'duration' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              value={quickDuration || ''}
              onChange={(e) => setQuickDuration(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-700 text-slate-50 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
        )}
        
        <div className="flex items-end">
          <button
            onClick={handleQuickLog}
            disabled={!isValidQuickSet()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Quick Log
          </button>
        </div>
      </div>

    </div>
  );
}
