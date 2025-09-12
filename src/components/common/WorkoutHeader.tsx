import ResponsiveButton from '@/components/common/ResponsiveButton';
import { Typography } from '@/components/common/Typography';
import { Skeleton } from '@/components/ui/skeleton';
import type { Workout } from '@/models/types';
import { Plus, Settings } from 'lucide-react';

interface WorkoutHeaderProps {
  workout?: Workout;
  isLoading: boolean;
  movementCount?: number;
  onAddMovement: () => void;
  onSettings: () => void;
}

export default function WorkoutHeader({
  workout,
  isLoading,
  movementCount = 0,
  onAddMovement,
  onSettings
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
          {movementCount} movement{movementCount !== 1 ? 's' : ''}
        </Typography>
      </div>

      <div className="flex space-x-2 ml-4">
        <ResponsiveButton 
          onClick={onAddMovement}
          icon={Plus}
          color="primary"
          variant="outline"
        >
          <Typography variant="body">Add</Typography>
        </ResponsiveButton>
        <ResponsiveButton 
          icon={Settings}
          color="primary"
          variant="outline"
          onClick={onSettings}
        >
          <Typography variant="body">Settings</Typography>
        </ResponsiveButton>
      </div>
    </div>
  );
}