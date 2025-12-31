"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ContextualNavigation from "@/components/common/ContextualNavigation";
import WorkoutErrorBoundary from "@/components/common/WorkoutErrorBoundary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  MovementListSkeleton,
  WorkoutPageSkeleton,
} from "@/components/ui/skeleton-patterns";
import { useWorkoutMovements } from "@/hooks/useMovements";
import { useWorkout } from "@/hooks/useWorkouts";
import Link from "next/link";
import { Suspense, lazy, use } from "react";

const MovementList = lazy(() => import("@/components/common/MovementList"));
const WorkoutHeader = lazy(() => import("@/components/common/WorkoutHeader"));

interface WorkoutDetailPageProps {
  params: Promise<{ workoutId: string }>;
}

export default function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
  // Use React's `use` hook to unwrap the Promise directly
  const { workoutId } = use(params);

  // Use our new React Query hooks
  const {
    data: workout,
    isLoading: workoutLoading,
    status: workoutStatus,
  } = useWorkout(workoutId);
  const { data: workoutMovements = [] } = useWorkoutMovements(workoutId);

  // Only show "not found" if we've finished fetching and there's no workout
  // Don't show it during loading or if we haven't attempted to fetch yet
  const hasFinishedFetching =
    workoutStatus === "success" || workoutStatus === "error";
  const workoutNotFound = hasFinishedFetching && !workout && !workoutLoading;

  if (workoutNotFound) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <CardTitle>Workout not found</CardTitle>
                <CardDescription className="text-muted-foreground mb-4">
                  The workout you&apos;re looking for doesn&apos;t exist or has
                  been deleted.
                </CardDescription>
                <Button asChild>
                  <Link href="/">Return to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <ContextualNavigation
          context={{
            type: "workout-detail",
            workoutName: workout?.name,
          }}
        />
        <main className="p-2 sm:p-4 lg:p-6">
          <WorkoutErrorBoundary workoutId={workoutId}>
            <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4 mt-2">
              <Suspense fallback={<WorkoutPageSkeleton />}>
                <WorkoutHeader
                  workout={workout ?? undefined}
                  isLoading={workoutLoading}
                  movementCount={workoutMovements.length}
                  workoutId={workoutId}
                />
              </Suspense>

              <Suspense fallback={<MovementListSkeleton />}>
                <MovementList
                  workoutId={workoutId}
                  expectedCount={workoutMovements.length || 2}
                />
              </Suspense>
            </div>
          </WorkoutErrorBoundary>
        </main>
      </div>
    </ProtectedRoute>
  );
}
