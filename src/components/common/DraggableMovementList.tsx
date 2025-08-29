'use client';

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

interface DraggableMovementItemProps {
  movement: UserMovement;
  index: number;
  onRemove: (movementId: string) => void;
}

function DraggableMovementItem({ movement, index, onRemove }: DraggableMovementItemProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-slate-800 border-2 rounded-lg transition-all ${
        isDragging ? 'border-blue-500 shadow-lg' : 'border-slate-600 hover:border-slate-500'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 text-slate-400 hover:text-slate-300 transition-colors"
            aria-label="Drag to reorder"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
          
          <span className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-medium text-slate-50">
            {index + 1}
          </span>
          
          <div>
            <h3 className="font-medium text-slate-50">{movement.name}</h3>
            <p className="text-sm text-slate-300">{movement.muscleGroup}</p>
            <span className="inline-block mt-1 px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded capitalize">
              {movement.trackingType}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            href={`/movement/${movement.id}`}
            className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            Track
          </Link>
          <button
            onClick={() => onRemove(movement.id)}
            className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            aria-label={`Remove ${movement.name}`}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
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
    useSensor(PointerSensor),
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
      <div className="text-center py-12 bg-slate-800 rounded-lg border-2 border-dashed border-slate-600">
        <div className="text-slate-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-50 mb-2">No movements added yet</h3>
        <p className="text-slate-300 mb-4">
          Add movements from the library to build your workout routine.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={movements.map(m => m.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-300">
              Drag movements to reorder them in your workout
            </p>
            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
              {movements.length} movement{movements.length !== 1 ? 's' : ''}
            </span>
          </div>
          
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
  );
}
