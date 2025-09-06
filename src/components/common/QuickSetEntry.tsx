'use client';

import type { Set, UserMovement } from '@/models/types';
import { useState } from 'react';
import SetEntryForm from './SetEntryForm';

interface QuickSetEntryProps {
  movement: UserMovement | null;
  lastSet: Partial<Set> | null;
  onQuickLog: (data: Partial<Set>) => Promise<void>;
}

export default function QuickSetEntry({ 
  movement, 
  lastSet, 
  onQuickLog 
}: QuickSetEntryProps) {
  const [isLogging, setIsLogging] = useState(false);
    
  const handleSave = async (setData: Partial<Set>) => {
    setIsLogging(true);
    try {
      await onQuickLog(setData);
    } finally {
      setIsLogging(false);
    }
  };

  if (!movement) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg border-dashed border text-center">
        <p className="text-muted-foreground text-sm">No movement selected</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <SetEntryForm
        movement={movement}
        initialData={{
          reps: lastSet?.reps || null,
          weight: lastSet?.weight || null,
          duration: lastSet?.duration || null,
          distance: lastSet?.distance || null,
          notes: '',
        }}
        onSave={handleSave}
        isLoading={isLogging}
        saveButtonText="Log Set"
      />
      
    </div>
  );
}