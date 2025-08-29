'use client';

import MovementCard from '@/components/common/MovementCard';
import SearchFilters from '@/components/common/SearchFilters';
import { movementLibrary } from '@/data/movementLibrary';
import { MovementTemplate } from '@/models/types';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function MovementLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string | null>(null);
  const [experienceLevelFilter, setExperienceLevelFilter] = useState<string | null>(null);

  const filteredMovements = useMemo(() => {
    return movementLibrary.filter((movement) => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase());

      // Muscle group filter
      const matchesMuscleGroup = muscleGroupFilter === null || 
        movement.muscleGroup === muscleGroupFilter;

      // Experience level filter
      const matchesExperienceLevel = experienceLevelFilter === null || 
        movement.experienceLevel === experienceLevelFilter;

      return matchesSearch && matchesMuscleGroup && matchesExperienceLevel;
    });
  }, [searchTerm, muscleGroupFilter, experienceLevelFilter]);

  const handleMovementClick = (movement: MovementTemplate) => {
    // TODO: Handle movement selection (for Story 1.4)
    console.log('Selected movement:', movement);
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1 mb-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Movement Library</h1>
              <p className="text-gray-600 mt-2">
                Browse and discover exercises for your workouts
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              <SearchFilters
                onSearchChange={setSearchTerm}
                onMuscleGroupFilter={setMuscleGroupFilter}
                onExperienceLevelFilter={setExperienceLevelFilter}
              />
            </div>
          </div>

          {/* Movement Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Exercises ({filteredMovements.length})
                </h2>
                <div className="text-sm text-gray-500">
                  {filteredMovements.length === movementLibrary.length 
                    ? 'Showing all exercises' 
                    : `Filtered from ${movementLibrary.length} total exercises`
                  }
                </div>
              </div>

              {filteredMovements.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
                  <p className="text-gray-500">
                    Try adjusting your search terms or filters to find what you&apos;re looking for.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
          </div>
        </div>
      </div>
    </main>
  );
}
