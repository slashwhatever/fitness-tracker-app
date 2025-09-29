"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface SearchFiltersProps {
  onSearchChange: (search: string) => void;
}

// Form type definition for search
type FiltersFormData = {
  search: string;
};

export default function SearchFilters({ onSearchChange }: SearchFiltersProps) {
  // Initialize form with React Hook Form
  const { register, watch, reset } = useForm<FiltersFormData>({
    mode: "onChange",
    defaultValues: {
      search: "",
    },
  });

  // Watch search value to trigger parent callback
  const searchValue = watch("search");

  // Trigger parent callback when search changes
  useEffect(() => {
    onSearchChange(searchValue);
  }, [searchValue, onSearchChange]);

  const clearSearch = () => {
    reset({
      search: "",
    });
  };

  const hasActiveFilters = searchValue;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Search movements
        </Label>
        <div className="relative">
          <Input
            {...register("search")}
            id="search"
            type="text"
            placeholder="Search by name, muscle groups..."
            className="pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Clear search button */}
      {hasActiveFilters && (
        <Button onClick={clearSearch} variant="outline" className="w-full">
          Clear search
        </Button>
      )}
    </div>
  );
}
