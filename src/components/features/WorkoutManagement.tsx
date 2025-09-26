"use client";

import CreateWorkoutModal from "@/components/common/CreateWorkoutModal";
import WorkoutList, { WorkoutListRef } from "@/components/common/WorkoutList";
import { Button } from "@/components/ui/button";
import { Workout } from "@/models/types";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Typography } from "../common/Typography";

export default function WorkoutManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const workoutListRef = useRef<WorkoutListRef>(null);

  const handleWorkoutCreated = async (workout: Workout) => {
    setIsCreateModalOpen(false);
    // Refresh the workout list to show the new workout
    await workoutListRef.current?.refreshWorkouts();
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
        </div>
      </div>

      {/* Workout List */}
      <WorkoutList ref={workoutListRef} />

      {/* Create Workout Modal */}
      <CreateWorkoutModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWorkoutCreated={handleWorkoutCreated}
      />
    </div>
  );
}
