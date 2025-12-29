import ResponsiveButton from "@/components/common/ResponsiveButton";
import { Typography } from "@/components/common/Typography";
import { Skeleton } from "@/components/ui/skeleton";
import type { Workout } from "@fitness/shared";
import { Plus, Settings } from "lucide-react";
import Link from "next/link";

interface WorkoutHeaderProps {
  workout?: Workout;
  isLoading: boolean;
  movementCount?: number;
  workoutId: string;
}

export default function WorkoutHeader({
  workout,
  isLoading,
  movementCount = 0,
  workoutId,
}: WorkoutHeaderProps) {
  if (isLoading) {
    return (
      <div className="flex justify-between items-center">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex space-x-2 ml-4">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    );
  }

  if (!workout) {
    return null;
  }

  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col space-y-4">
        <Typography variant="title1" className="truncate mb-0">
          {workout.name}
        </Typography>
        {workout.description && (
          <Typography variant="caption" className="mt-1">
            {workout.description}
          </Typography>
        )}
        <Typography variant="caption" className="mt-0">
          {movementCount} movement{movementCount !== 1 ? "s" : ""}
        </Typography>
      </div>

      <div className="flex space-x-2 ml-4">
        <Link href={`/workout/${workoutId}/movements`}>
          <ResponsiveButton icon={Plus} color="primary" variant="outline">
            <Typography variant="body">Add</Typography>
          </ResponsiveButton>
        </Link>
        <Link href={`/workout/${workoutId}/settings`}>
          <ResponsiveButton icon={Settings} color="primary" variant="outline">
            <Typography variant="body">Settings</Typography>
          </ResponsiveButton>
        </Link>
      </div>
    </div>
  );
}
