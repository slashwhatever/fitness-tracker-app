'use client';

import { useForm } from "react-hook-form";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { ExperienceLevel } from '@/models/types';
import { useEffect } from 'react';

interface SearchFiltersProps {
  onSearchChange: (search: string) => void;
  onMuscleGroupFilter: (muscle_group: string | null) => void;
  onExperienceLevelFilter: (level: ExperienceLevel | null) => void;
  muscleGroups?: string[]; // Now passed as props
  experienceLevels?: ExperienceLevel[]; // Now passed as props
}

// Default fallbacks if props not provided
const DEFAULT_EXPERIENCE_LEVELS: ExperienceLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
const DEFAULT_MUSCLE_GROUPS: string[] = ['Back', 'Biceps', 'Cardio', 'Chest', 'Core', 'Forearms', 'Full Body', 'Legs', 'Shoulders', 'Triceps'];

// Form type definition for filters
type FiltersFormData = {
  search: string;
  selectedMuscleGroup: string | null;
  selectedExperienceLevel: ExperienceLevel | null;
};

export default function SearchFilters({
  onSearchChange,
  onMuscleGroupFilter,
  onExperienceLevelFilter,
  muscleGroups = DEFAULT_MUSCLE_GROUPS,
  experienceLevels = DEFAULT_EXPERIENCE_LEVELS,
}: SearchFiltersProps) {
  // Initialize form with React Hook Form using uncontrolled components
  const {
    register,
    setValue,
    watch,
    reset,
  } = useForm<FiltersFormData>({
    mode: "onChange",
    defaultValues: {
      search: "",
      selectedMuscleGroup: null,
      selectedExperienceLevel: null,
    },
  });

  // Watch form values to trigger parent callbacks
  const searchValue = watch("search");
  const selectedMuscleGroup = watch("selectedMuscleGroup");
  const selectedExperienceLevel = watch("selectedExperienceLevel");

  // Trigger parent callbacks when watched values change
  useEffect(() => {
    onSearchChange(searchValue);
  }, [searchValue, onSearchChange]);

  useEffect(() => {
    onMuscleGroupFilter(selectedMuscleGroup);
  }, [selectedMuscleGroup, onMuscleGroupFilter]);

  useEffect(() => {
    onExperienceLevelFilter(selectedExperienceLevel);
  }, [selectedExperienceLevel, onExperienceLevelFilter]);

  const handleMuscleGroupChange = (muscle_group: string) => {
    const newValue = selectedMuscleGroup === muscle_group ? null : muscle_group;
    setValue("selectedMuscleGroup", newValue);
  };

  const handleExperienceLevelChange = (level: ExperienceLevel) => {
    const newValue = selectedExperienceLevel === level ? null : level;
    setValue("selectedExperienceLevel", newValue);
  };

  const clearFilters = () => {
    reset({
      search: "",
      selectedMuscleGroup: null,
      selectedExperienceLevel: null,
    });
  };

  const hasActiveFilters = searchValue || selectedMuscleGroup || selectedExperienceLevel;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <div className="relative">
          <Input
            type="text"
            id="search"
            placeholder="Search by exercise name..."
            className="pl-10"
            {...register("search")}
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
          <Label htmlFor="muscle_group" className="text-sm font-medium text-muted-foreground">Muscle Group</Label>
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
          <Label className="text-sm font-medium text-muted-foreground">Experience Level</Label>
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
