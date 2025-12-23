"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { Workout } from "@/models/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Archive,
  ArchiveRestore,
  Copy,
  GripVertical,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import ResponsiveButton from "./ResponsiveButton";
import { Typography } from "./Typography";

interface SortableWorkoutItemProps {
  workout: Workout;
  movementCount: number;
  onDelete: (e: React.MouseEvent) => void;
  onArchive: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  showSeparator: boolean;
  isArchived: boolean;
  isDuplicating?: boolean;
}

export default function SortableWorkoutItem({
  workout,
  movementCount,
  onDelete,
  onArchive,
  onDuplicate,
  onMouseEnter,
  showSeparator,
  isArchived,
  isDuplicating = false,
}: SortableWorkoutItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workout.id, disabled: isArchived });

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
        className={`${isDragging ? "z-[9999] relative" : ""}`}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-all cursor-pointer bg-card select-none gap-2 sm:gap-3">
          {/* Drag Handle - Only show for active workouts */}
          {!isArchived && (
            <div
              {...attributes}
              {...listeners}
              className="flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 touch-none select-none"
              role="button"
              tabIndex={0}
              aria-label="Drag to reorder workout"
            >
              <GripVertical className="w-5 h-5 sm:w-4 sm:h-4" />
            </div>
          )}

          <Link
            href={`/workout/${workout.id}`}
            className={`flex-1 min-w-0 ${isArchived ? "ml-3" : ""}`}
            onMouseEnter={onMouseEnter}
          >
            <div className="text-left">
              <Typography variant="title3">{workout.name}</Typography>
              {workout.description && (
                <Typography variant="caption">{workout.description}</Typography>
              )}
              <Typography variant="caption">
                <span>{movementCount} movements</span>
              </Typography>
            </div>
          </Link>

          <div className="flex items-center space-x-1 ml-2">
            <ResponsiveButton
              onClick={onDuplicate}
              icon={Copy}
              color="primary"
              disabled={isDuplicating}
            >
              <Typography variant="body">
                {isDuplicating ? "Duplicating..." : "Duplicate"}
              </Typography>
            </ResponsiveButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onArchive}>
                  {isArchived ? (
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                  ) : (
                    <Archive className="mr-2 h-4 w-4" />
                  )}
                  {isArchived ? "Unarchive" : "Archive"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {showSeparator && <Separator />}
    </>
  );
}
