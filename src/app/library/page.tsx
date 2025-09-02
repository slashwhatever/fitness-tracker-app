'use client';

import MovementCard from '@/components/common/MovementCard';
import SearchFilters from '@/components/common/SearchFilters';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useMovementTemplates } from '@/hooks/useMovements';
import { ExperienceLevel, MovementTemplate } from '@/models/types';
import { useMemo, useState } from 'react';

export default function MovementLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string | null>(null);
  const [experienceLevelFilter, setExperienceLevelFilter] = useState<ExperienceLevel | null>(null);

  // Fetch movement templates from database instead of local file
  const { data: movementTemplates = [], isLoading, error } = useMovementTemplates();

  // Derive muscle groups and experience levels from the data
  const muscleGroups = useMemo(() => {
    return Array.from(new Set(movementTemplates.flatMap(m => m.muscle_groups))).sort();
  }, [movementTemplates]);

  const experienceLevels: ExperienceLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

  const filteredMovements = useMemo(() => {
    return movementTemplates
      .filter((movement) => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
          movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movement.muscle_groups.some(group => 
            group.toLowerCase().includes(searchTerm.toLowerCase())
          );

        // Muscle group filter
        const matchesMuscleGroup = muscleGroupFilter === null || 
          movement.muscle_groups.includes(muscleGroupFilter);
          
        // Experience level filter
        const matchesExperienceLevel = experienceLevelFilter === null || 
          movement.experience_level === experienceLevelFilter;

        return matchesSearch && matchesMuscleGroup && matchesExperienceLevel;
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
  }, [movementTemplates, searchTerm, muscleGroupFilter, experienceLevelFilter]);

  const handleMovementClick = (movement: MovementTemplate) => {
    // TODO: Handle movement selection (for Story 1.4)
    console.log('Selected movement:', movement);
  };

  if (error) {
    return (
      <main className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
          {/* Breadcrumbs */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Movement Library</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="text-center py-12">
            <div className="text-destructive mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 14.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Error loading movement library</h3>
            <p className="text-muted-foreground">
              {error.message || 'Please try refreshing the page or contact support.'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Movement Library</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Movement Library</h1>
          <p className="text-muted-foreground mt-2">
            Browse and discover exercises for your workouts
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-2">
          <h2 className="text-base sm:text-lg font-semibold">Search & Filters</h2>
        </div>

        <SearchFilters
          onSearchChange={setSearchTerm}
          onMuscleGroupFilter={setMuscleGroupFilter}
          onExperienceLevelFilter={setExperienceLevelFilter}
          muscleGroups={muscleGroups}
          experienceLevels={experienceLevels}
        />

        {/* Movement Grid */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Exercises ({isLoading ? '...' : filteredMovements.length})
          </h1>
          <div className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : 
              filteredMovements.length === movementTemplates.length 
                ? 'Showing all exercises' 
                : `Filtered from ${movementTemplates.length} total exercises`
            }
          </div>

        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <svg className="w-16 h-16 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Loading exercises...</h3>
            <p className="text-muted-foreground">
              Please wait while we fetch the movement library.
            </p>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No exercises found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMovements.map((movement) => (
              <MovementCard
                key={movement.id}
                movement={movement}
                onClick={handleMovementClick}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
