'use client';

import { experienceLevels, muscleGroups } from '@/data/movementLibrary';
import { useState } from 'react';

interface SearchFiltersProps {
  onSearchChange: (search: string) => void;
  onMuscleGroupFilter: (muscleGroup: string | null) => void;
  onExperienceLevelFilter: (level: string | null) => void;
}

export default function SearchFilters({
  onSearchChange,
  onMuscleGroupFilter,
  onExperienceLevelFilter,
}: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleMuscleGroupChange = (muscleGroup: string) => {
    const newValue = selectedMuscleGroup === muscleGroup ? null : muscleGroup;
    setSelectedMuscleGroup(newValue);
    onMuscleGroupFilter(newValue);
  };

  const handleExperienceLevelChange = (level: string) => {
    const newValue = selectedExperienceLevel === level ? null : level;
    setSelectedExperienceLevel(newValue);
    onExperienceLevelFilter(newValue);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMuscleGroup(null);
    setSelectedExperienceLevel(null);
    onSearchChange('');
    onMuscleGroupFilter(null);
    onExperienceLevelFilter(null);
  };

  const hasActiveFilters = searchTerm || selectedMuscleGroup || selectedExperienceLevel;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search Exercises
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by exercise name..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="space-y-3">
        {/* Muscle Group Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Muscle Group</label>
          <div className="flex flex-wrap gap-2">
            {muscleGroups.map((muscleGroup) => (
              <button
                key={muscleGroup}
                onClick={() => handleMuscleGroupChange(muscleGroup)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  selectedMuscleGroup === muscleGroup
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {muscleGroup}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
          <div className="flex flex-wrap gap-2">
            {experienceLevels.map((level) => (
              <button
                key={level}
                onClick={() => handleExperienceLevelChange(level)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  selectedExperienceLevel === level
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="pt-2">
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
