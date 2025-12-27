"use client";

import { Typography } from "@components/common/Typography";
import WorkoutList, { WorkoutListRef } from "@components/common/WorkoutList";
import { Button } from "@components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function WorkoutManagement() {
  const workoutListRef = useRef<WorkoutListRef>(null);
  const router = useRouter();

  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Quick Actions */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Typography variant="title2">Workout management</Typography>
        </div>

        <div className="space-y-2">
          <Button asChild className="w-full justify-start h-auto p-3 sm:p-4">
            <Link href="/workout/new">
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                <div className="text-left">
                  <Typography variant="body">Create new workout</Typography>
                  <Typography variant="caption">
                    Start building your routine
                  </Typography>
                </div>
              </div>
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/quick-log")}
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
    </div>
  );
}
