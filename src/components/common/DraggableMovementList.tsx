'use client';

import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { UserMovement } from '@/models/types';
import { Play, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface MovementItemProps {
  movement: UserMovement;
  index: number;
  onRemove: (movementId: string) => void;
}

function MovementItem({ movement, index, onRemove }: MovementItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmRemove = () => {
    onRemove(movement.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 bg-card border border-default rounded-lg hover:border-gray-300 transition-all cursor-pointer">

        <Link href={`/movement/${movement.id}`} className="flex-1">
          <div className="text-left">
            <h3 className="text-lg font-bold text-foreground">{movement.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{movement.muscle_groups.join(', ')}</p>
            <span className="inline-block mt-1 px-2 py-1 bg-primary text-primary-foreground text-xs rounded capitalize">
              {movement.tracking_type}
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-2">
          <Link href={`/movement/${movement.id}`}>
            <Button
              size="sm"
              className="bg-green-500 hover:bg-green-600"
            >
              <Play className="w-4 h-4 mr-1" />
              Track
            </Button>
          </Link>
          <Button
            onClick={handleRemoveClick}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-red-500 h-9 w-9"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmRemove}
        title="Remove Movement"
        description={`Are you sure you want to remove "${movement.name}" from this workout? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}

interface DraggableMovementListProps {
  movements: UserMovement[];
  onReorder: (newOrder: UserMovement[]) => void;
  onRemove: (movementId: string) => void;
}

export default function DraggableMovementList({ 
  movements, 
  onReorder, 
  onRemove 
}: DraggableMovementListProps) {
  if (movements.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
        <div className="text-muted-foreground mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">No movements added yet</h3>
        <p className="text-muted-foreground mb-4">
          Add movements from the library to build your workout routine.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Your workout movements
        </p>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          {movements.length} movement{movements.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {movements.map((movement, index) => (
          <MovementItem
            key={movement.id}
            movement={movement}
            index={index}
            onRemove={onRemove}
          />
        ))}
      </div>
    </>
  );
}
