"use client";

import { Typography } from "@/components/common/Typography";
import WorkoutList, { WorkoutListRef } from "@/components/common/WorkoutList";
import { Button } from "@/components/ui/button";
import { ModalSkeleton } from "@/components/ui/skeleton-patterns";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { lazy, Suspense, useRef, useState } from "react";

const CreateWorkoutModal = lazy(
  () => import("@/components/common/CreateWorkoutModal")
);
const QuickLogMovementModal = lazy(
  () => import("@/components/common/QuickLogMovementModal")
);

export default function WorkoutManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQuickLogModalOpen, setIsQuickLogModalOpen] = useState(false);
  const workoutListRef = useRef<WorkoutListRef>(null);
  const router = useRouter();

  const handleWorkoutCreated = async () => {
    setIsCreateModalOpen(false);
    // Refresh the workout list to show the new workout
    await workoutListRef.current?.refreshWorkouts();
  };

  const handleMovementSelected = (movementId: string) => {
    setIsQuickLogModalOpen(false);
    // Navigate to the movement detail page with quickLog param to indicate it should return to dashboard
    router.push(`/library/movement/${movementId}?quickLog=true`);
  };

  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Quick Actions */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Typography variant="title2">Workout management</Typography>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full justify-start h-auto p-3 sm:p-4"
          >
            <div className="flex items-center space-x-3">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
              <div className="text-left">
                <Typography variant="body">Create new workout</Typography>
                <Typography variant="caption">
                  Start building your routine
                </Typography>
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsQuickLogModalOpen(true)}
            className="w-full justify-start h-auto p-3 sm:p-4"
          >
            <div className="flex items-center space-x-3">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <div className="text-left">
                <Typography variant="body">Log a movement</Typography>
                <Typography variant="caption">
                  Quickly log a movement
                </Typography>
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Workout List */}
      <WorkoutList ref={workoutListRef} />

      {/* Create Workout Modal */}
      {isCreateModalOpen && (
        <Suspense fallback={<ModalSkeleton />}>
          <CreateWorkoutModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onWorkoutCreated={handleWorkoutCreated}
          />
        </Suspense>
      )}

      {/* Quick Log Movement Modal */}
      {isQuickLogModalOpen && (
        <Suspense fallback={<ModalSkeleton />}>
          <QuickLogMovementModal
            isOpen={isQuickLogModalOpen}
            onClose={() => setIsQuickLogModalOpen(false)}
            onMovementSelected={handleMovementSelected}
          />
        </Suspense>
      )}
    </div>
  );
}
