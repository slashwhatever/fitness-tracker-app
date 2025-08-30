'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { experienceLevels, muscleGroups } from '@/data/movementLibrary';
import { ExperienceLevel } from '@/models/types';
import { useState } from 'react';

interface SearchFiltersProps {
  onSearchChange: (search: string) => void;
  onMuscleGroupFilter: (muscle_group: string | null) => void;
  onExperienceLevelFilter: (level: ExperienceLevel | null) => void;
}

export default function SearchFilters({
  onSearchChange,
  onMuscleGroupFilter,
  onExperienceLevelFilter,
}: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<ExperienceLevel | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleMuscleGroupChange = (muscle_group: string) => {
    const newValue = selectedMuscleGroup === muscle_group ? null : muscle_group;
    setSelectedMuscleGroup(newValue);
    onMuscleGroupFilter(newValue);
  };

  const handleExperienceLevelChange = (level: ExperienceLevel) => {
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
        <Label htmlFor="search" className="text-sm font-medium mb-1">
          Search Exercises
        </Label>
        <div className="relative">
          <Input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by exercise name..."
            className="pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="space-y-3">
        {/* Muscle Group Filters */}
        <div>
          <Label className="text-sm font-medium mb-2">Muscle Group</Label>
          <div className="flex flex-wrap gap-2">
            {muscleGroups.map((muscleGroup) => (
              <Button
                key={muscleGroup}
                variant={selectedMuscleGroup === muscleGroup ? "default" : "outline"}
                size="sm"
                onClick={() => handleMuscleGroupChange(muscleGroup)}
                className="text-sm"
              >
                {muscleGroup}
              </Button>
            ))}
          </div>
        </div>

        {/* Experience Level Filters */}
        <div>
          <Label className="text-sm font-medium mb-2">Experience Level</Label>
          <div className="flex flex-wrap gap-2">
            {experienceLevels.map((level) => (
              <Button
                key={level}
                variant={selectedExperienceLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => handleExperienceLevelChange(level)}
                className="text-sm"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-sm underline"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
