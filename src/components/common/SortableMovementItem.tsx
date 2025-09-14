"use client";

import { Separator } from "@/components/ui/separator";
import type { UserMovement, WorkoutMovement } from "@/models/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dumbbell, Edit3, GripVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import ResponsiveButton from "./ResponsiveButton";
import { Typography } from "./Typography";

interface SortableMovementItemProps {
  movement: WorkoutMovement & {
    user_movement: UserMovement | null;
  };
  workoutId: string;
  movementSets: any[];
  lastSetDate: string;
  onEdit: () => void;
  onDelete: () => void;
  showSeparator: boolean;
}

export default function SortableMovementItem({
  movement,
  workoutId,
  movementSets,
  lastSetDate,
  onEdit,
  onDelete,
  showSeparator,
}: SortableMovementItemProps) {
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
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`${isDragging ? "z-[9999] relative" : ""} touch-none`}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-all bg-card select-none">
          {/* Drag Handle - Larger touch target for mobile */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 mr-2 sm:mr-3 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 touch-none select-none"
            role="button"
            tabIndex={0}
            aria-label="Drag to reorder movement"
          >
            <GripVertical className="w-5 h-5 sm:w-4 sm:h-4" />
          </div>

          <Link
            href={`/workout/${workoutId}/movement/${movement.user_movement_id}`}
            className="flex items-center space-x-2 sm:space-x-3 flex-1 cursor-pointer min-w-0 overflow-hidden select-text"
          >
            <div className="min-w-0 flex-1 overflow-hidden">
              <Typography variant="title3" className="truncate block select-none">
                {movement.user_movement?.name || "Unknown Movement"}
              </Typography>
              <Typography variant="caption" className="line-clamp-2 block select-none">
                {lastSetDate}
                {movementSets.length > 0 &&
                  ` • ${movementSets.length} set${
                    movementSets.length > 1 ? "s" : ""
                  }`}
              </Typography>
            </div>
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
            <ResponsiveButton icon={Dumbbell} color="green" asChild>
              <Link
                href={`/workout/${workoutId}/movement/${movement.user_movement_id}`}
              >
                <Typography variant="body">Log sets</Typography>
              </Link>
            </ResponsiveButton>
            <ResponsiveButton icon={Edit3} color="blue" onClick={onEdit}>
              Edit
            </ResponsiveButton>
            <ResponsiveButton icon={Trash2} color="red" onClick={onDelete}>
              Delete
            </ResponsiveButton>
          </div>
        </div>
      </div>
      {showSeparator && <Separator />}
    </>
  );
}
