import { Skeleton } from "./skeleton";

// Full page skeleton for loading screens
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

// Workout page skeleton
export function WorkoutPageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-1" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Header section */}
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
        

      </div>
    </div>
  );
}

// Movement list skeleton
export function MovementListSkeleton() {
  return (
      <div className="grid gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <Skeleton className="w-6 h-4" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-32 sm:w-40 mb-1" />
                <Skeleton className="h-3 w-24 sm:w-32" />
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
              <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded" />
              <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded" />
              <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Movement detail skeleton
export function MovementDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-1" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Movement Info */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Quick Set Entry */}
        <div className="bg-card border border-default rounded-lg p-4 space-y-4">
          <Skeleton className="h-5 w-24" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-9 w-full" />
            </div>
            <Skeleton className="h-9 w-full self-end" />
          </div>
        </div>

        {/* Set History Section */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-card border border-default rounded-lg overflow-hidden">
                <div className="p-3 pb-2">
                  <Skeleton className="h-5 w-32" />
                </div>
                <div>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j}>
                      <div className="p-3 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-5 w-6" />
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-5 w-6" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                        <div className="flex space-x-2">
                          <Skeleton className="h-7 w-16" />
                          <Skeleton className="h-7 w-12" />
                          <Skeleton className="h-7 w-14" />
                        </div>
                      </div>
                      {j < 2 && <div className="h-px bg-border" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings page skeleton
export function SettingsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card border border-default rounded-lg p-4 space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Library page skeleton
export function LibrarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-card border border-default rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple card skeleton for small loading areas
export function CardSkeleton() {
  return (
    <div className="bg-card border border-default rounded-lg p-4 space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}