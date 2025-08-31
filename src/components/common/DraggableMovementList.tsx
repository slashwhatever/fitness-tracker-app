'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { UserMovement } from '@/models/types';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { useState } from 'react';

interface DraggableMovementItemProps {
  movement: UserMovement;
  index: number;
  onRemove: (movementId: string) => void;
}

function DraggableMovementItem({ movement, index, onRemove }: DraggableMovementItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: movement.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmRemove = () => {
    onRemove(movement.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card 
        ref={setNodeRef}
        style={style}
        className={`transition-all ${
          isDragging ? 'ring-2 ring-primary shadow-lg' : ''
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Drag Handle */}
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Drag to reorder"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              
              <span className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              
              <div>
                <h3 className="font-medium">{movement.name}</h3>
                <p className="text-sm text-muted-foreground">{movement.muscle_groups.join(', ')}</p>
                <span className="inline-block mt-1 px-2 py-1 bg-primary text-primary-foreground text-xs rounded capitalize">
                  {movement.tracking_type}
                </span>
              </div>
            </div>
          
            <div className="flex items-center space-x-2">
              <Button size="sm" asChild>
                <Link href={`/movement/${movement.id}`}>
                  Track
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={handleRemoveClick}
                aria-label={`Remove ${movement.name}`}
              >
                Remove
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmRemove}
        title="Remove Movement"
        description={`Are you sure you want to remove "${movement.name}" from this workout? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = movements.findIndex(m => m.id === active.id);
      const newIndex = movements.findIndex(m => m.id === over?.id);
            
      const newOrder = arrayMove(movements, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

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
          Drag movements to reorder them in your workout
        </p>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          {movements.length} movement{movements.length !== 1 ? 's' : ''}
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={movements.map(m => m.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {movements.map((movement, index) => (
              <DraggableMovementItem
                key={movement.id}
                movement={movement}
                index={index}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
