"use client";

import MovementListItem from "@/components/common/MovementListItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  useAddMovementsToWorkout,
  useCreateUserMovement,
  useMovementTemplates,
  useRemoveMovementsFromWorkout,
  useTrackingTypes,
  useUserMovements,
  useWorkoutMovements,
} from "@/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import {
  getNextOrderIndex,
  prepareWorkoutMovements,
} from "@/lib/utils/workout-helpers";
import type { MovementTemplate, UserMovement } from "@/models/types";
import { Plus } from "lucide-react";
import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { Typography } from "./Typography";

const CreateCustomMovementModal = lazy(() => import("@/components/common/CreateCustomMovementModal"));

interface MovementSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
}

// Use the proper transformed types from hooks

type SearchFormData = {
  search: string;
};

interface SearchAndContentProps {
  className?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  setShowCustomMovementModal: (value: boolean) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  filteredUserMovements: UserMovement[];
  filteredLibrary: MovementTemplate[];
  selectedMovements: Set<string>;
  handleMovementToggle: (
    movementId: string,
    movementData: UserMovement | MovementTemplate
  ) => void;
  isSaving: boolean;
}

const SearchAndContent = React.memo(function SearchAndContent({
  className = "",
  searchValue,
  onSearchChange,
  setShowCustomMovementModal,
  scrollContainerRef,
  filteredUserMovements,
  filteredLibrary,
  selectedMovements,
  handleMovementToggle,
  isSaving,
}: SearchAndContentProps) {
  const { register, watch } = useForm<SearchFormData>({
    defaultValues: {
      search: searchValue,
    },
  });

  const watchedSearch = watch("search");

  // Update parent when form value changes
  useEffect(() => {
    onSearchChange(watchedSearch || "");
  }, [watchedSearch, onSearchChange]);

  return (
    <div className={`flex flex-col space-y-4 overflow-hidden ${className}`}>
      {/* Search Bar */}
      <div className="flex-shrink-0 flex space-x-3">
        <Input
          type="text"
          placeholder="Search movements..."
          {...register("search")}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCustomMovementModal(true)}
          className="flex items-center space-x-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom</span>
        </Button>
      </div>

      {/* Movement Lists */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto pr-4"
      >
        <div className="space-y-4 pb-4">
          {/* User's Custom Movements */}
          {filteredUserMovements.length > 0 && (
            <div>
              <Typography variant="caption" className="mb-2">
                My movements
              </Typography>
              <div className="space-y-2">
                {filteredUserMovements.map((movement) => (
                  <MovementListItem
                    key={movement.id}
                    movement={movement}
                    isSelected={selectedMovements.has(movement.id)}
                    isSaving={isSaving}
                    onToggle={() => handleMovementToggle(movement.id, movement)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Movement Library */}
          <div>
            <Typography variant="caption" className="mb-2">
              Movement Library
            </Typography>
            <div className="space-y-2">
              {filteredLibrary.map((movement) => (
                <MovementListItem
                  key={movement.id}
                  movement={movement}
                  isSelected={selectedMovements.has(movement.id)}
                  isSaving={isSaving}
                  onToggle={() => handleMovementToggle(movement.id, movement)}
                />
              ))}
            </div>
          </div>
        </div>

        {filteredLibrary.length === 0 && filteredUserMovements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No movements found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default function MovementSelectionModal({
  isOpen,
  onClose,
  workoutId,
}: MovementSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovements, setSelectedMovements] = useState<Set<string>>(
    new Set()
  );
  const [initialSelectedMovements, setInitialSelectedMovements] = useState<
    Set<string>
  >(new Set());
  const [showCustomMovementModal, setShowCustomMovementModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [frozenSelectedMovements, setFrozenSelectedMovements] = useState<
    Set<string>
  >(new Set());
  const [recentlyCreatedMovements, setRecentlyCreatedMovements] = useState<
    Set<string>
  >(new Set());

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Use frozen state for display during save operations
  const displaySelectedMovements = isSaving
    ? frozenSelectedMovements
    : selectedMovements;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Fetch movement templates from database instead of local file
  const { data: movementTemplates = [] } = useMovementTemplates();

  // Use our React Query hooks
  const { data: userMovements = [] } = useUserMovements();
  const { data: workoutMovements = [] } = useWorkoutMovements(workoutId);
  const { data: trackingTypes = [] } = useTrackingTypes();
  const createUserMovementMutation = useCreateUserMovement();
  const addMovementsBatch = useAddMovementsToWorkout();
  const removeMovementsBatch = useRemoveMovementsFromWorkout();

  // Pre-select movements that are already in this workout
  const workoutMovementIdsString = useMemo(
    () =>
      workoutMovements
        .map((wm) => wm.user_movement_id)
        .sort()
        .join(","),
    [workoutMovements]
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedMovements(new Set());
      setInitialSelectedMovements(new Set());
      setFrozenSelectedMovements(new Set());
      setRecentlyCreatedMovements(new Set());
      setIsSaving(false);
      return;
    }

    // Don't update selections if we're in the middle of saving
    if (isSaving) return;

    const ids = workoutMovementIdsString
      ? workoutMovementIdsString.split(",").filter(Boolean)
      : [];
    const initialSet = new Set(ids);
    setSelectedMovements(initialSet);
    setInitialSelectedMovements(initialSet);
    setFrozenSelectedMovements(initialSet);
  }, [isOpen, workoutMovementIdsString, isSaving]);

  const filteredLibrary = useMemo(() => {
    // Show all templates with search filtering - no hiding logic needed
    return movementTemplates
      .filter((movement) => {
        // Apply search filter
        return (
          movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movement.muscle_groups.some((group) =>
            group.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [movementTemplates, searchTerm]);

  const filteredUserMovements = useMemo(() => {
    // Get IDs of movements already in this workout
    const workoutMovementIds = new Set(
      workoutMovements.map((wm) => wm.user_movement_id)
    );

    return userMovements
      .filter(
        (movement) =>
          movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movement.muscle_groups?.some((group) =>
            group.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
      .sort((a, b) => {
        // First priority: recently created movements (at the very top)
        const aIsNew = recentlyCreatedMovements.has(a.id);
        const bIsNew = recentlyCreatedMovements.has(b.id);

        if (aIsNew && !bIsNew) return -1;
        if (!aIsNew && bIsNew) return 1;

        // Second priority: movements already in workout
        const aInWorkout = workoutMovementIds.has(a.id);
        const bInWorkout = workoutMovementIds.has(b.id);

        if (aInWorkout && !bInWorkout) return -1;
        if (!aInWorkout && bInWorkout) return 1;

        // Final priority: alphabetical order within each group
        return a.name.localeCompare(b.name);
      });
  }, [userMovements, searchTerm, workoutMovements, recentlyCreatedMovements]);

  const handleMovementToggle = useCallback(
    (movementId: string) => {
      // Don't allow selection changes while saving
      if (isSaving) return;

      // Save current scroll position
      const scrollTop = scrollContainerRef.current?.scrollTop || 0;

      // Toggle selection in local state only
      setSelectedMovements((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(movementId)) {
          newSet.delete(movementId);
        } else {
          newSet.add(movementId);
        }
        return newSet;
      });

      // Restore scroll position after state update
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollTop;
        }
      });
    },
    [isSaving]
  );

  const handleCustomMovementCreated = (userMovementId: string) => {
    // Close custom movement modal
    setShowCustomMovementModal(false);

    // Track this as a recently created movement for sorting
    setRecentlyCreatedMovements((prev) => new Set([...prev, userMovementId]));

    // Automatically select the new custom movement (don't save to DB yet)
    setSelectedMovements((prev) => new Set([...prev, userMovementId]));
  };

  const handleSave = async () => {
    // Freeze the current selections to prevent checkbox flashing
    setFrozenSelectedMovements(new Set(selectedMovements));
    setIsSaving(true);

    // Calculate movements to add and remove
    const movementsToAdd = Array.from(selectedMovements).filter(
      (id) => !initialSelectedMovements.has(id)
    );
    const movementsToRemove = Array.from(initialSelectedMovements).filter(
      (id) => !selectedMovements.has(id)
    );

    // Close modal immediately for better UX (optimistic UI)
    onClose();

    try {
      // Batch remove movements (single API call)
      if (movementsToRemove.length > 0) {
        await removeMovementsBatch.mutateAsync({
          workoutId,
          movementIds: movementsToRemove,
        });
      }

      // Process movements to add (create user movements for templates if needed)
      const userMovementIds: string[] = [];

      for (const movementId of movementsToAdd) {
        // Check if this is a template that needs a user movement created
        const templateMovement = movementTemplates.find(
          (t) => t.id === movementId
        );
        let userMovementId = movementId;

        if (templateMovement) {
          // Always create a new user movement when adding from library
          // This allows users to have multiple movements with the same name
          // Get tracking type from ID since hooks aren't transforming data yet
          const trackingType = trackingTypes.find(
            (tt) => tt.id === templateMovement.tracking_type_id
          );
          if (!trackingType) {
            throw new Error(
              `Unknown tracking type ID: ${templateMovement.tracking_type_id}`
            );
          }

          // Create user movement from template (no template link)
          const newUserMovement = await createUserMovementMutation.mutateAsync({
            template_id: null,
            name: templateMovement.name,
            muscle_groups: templateMovement.muscle_groups,
            tracking_type_id: trackingType.id,
            personal_notes: templateMovement.instructions,
          });
          userMovementId = newUserMovement.id;
        }

        userMovementIds.push(userMovementId);
      }

      // Filter out movements that are already in the workout to prevent constraint violations
      const existingUserMovementIds = new Set(
        workoutMovements.map((wm) => wm.user_movement_id)
      );
      const newUserMovementIds = userMovementIds.filter(
        (id) => !existingUserMovementIds.has(id)
      );

      // Filter out movements already in workout

      // Batch add movements (single API call)
      if (newUserMovementIds.length > 0) {
        const startingOrderIndex = getNextOrderIndex(workoutMovements);
        const newWorkoutMovements = prepareWorkoutMovements(
          workoutId,
          newUserMovementIds,
          startingOrderIndex
        );

        // Collect user movements for optimistic updates
        const userMovementsForOptimistic = newUserMovementIds
          .map((id) => userMovements.find((um) => um.id === id))
          .filter((um): um is UserMovement => um !== undefined);

        await addMovementsBatch.mutateAsync({
          workoutMovements: newWorkoutMovements,
          userMovementsForOptimistic,
        });
      }
    } catch (error) {
      console.error("Error saving workout changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to initial state and close
    setSelectedMovements(initialSelectedMovements);
    onClose();
  };

  const FooterContent = () => (
    <div className="flex justify-between items-center pt-4 border-t bg-background">
      <div className="text-sm text-muted-foreground">
        {displaySelectedMovements.size} movement
        {displaySelectedMovements.size !== 1 ? "s" : ""} selected
      </div>
      <div className="flex space-x-3">
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Done"}
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-3xl h-[85vh] w-[90vw] flex flex-col">
            <DialogHeader className="pb-4 flex-shrink-0">
              <DialogTitle className="text-xl">
                Add Movements to Workout
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Select exercises from the library to add to your workout
              </DialogDescription>
            </DialogHeader>

            <SearchAndContent
              className="flex-1 min-h-0"
              searchValue={searchTerm}
              onSearchChange={handleSearchChange}
              setShowCustomMovementModal={setShowCustomMovementModal}
              scrollContainerRef={scrollContainerRef}
              filteredUserMovements={filteredUserMovements}
              filteredLibrary={filteredLibrary}
              selectedMovements={displaySelectedMovements}
              handleMovementToggle={handleMovementToggle}
              isSaving={isSaving}
            />
            <div className="flex-shrink-0">
              <FooterContent />
            </div>
          </DialogContent>
        </Dialog>

        {/* Custom Movement Creation Modal */}
        {showCustomMovementModal && (
          <Suspense fallback={<div className="fixed inset-0 bg-black/20 flex items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div></div>}>
            <CreateCustomMovementModal
              isOpen={showCustomMovementModal}
              onClose={() => setShowCustomMovementModal(false)}
              onMovementCreated={handleCustomMovementCreated}
              initialName={searchTerm.trim()}
            />
          </Suspense>
        )}
      </>
    );
  }

  return (
    <>
      <Drawer open={isOpen}>
        <DrawerContent className="!max-h-[95vh] flex flex-col">
          <DrawerHeader className="text-left flex-shrink-0">
            <DrawerTitle>Add movements to workout</DrawerTitle>
          </DrawerHeader>
          <SearchAndContent
            className="px-4 flex-1 min-h-0"
            searchValue={searchTerm}
            onSearchChange={handleSearchChange}
            setShowCustomMovementModal={setShowCustomMovementModal}
            scrollContainerRef={scrollContainerRef}
            filteredUserMovements={filteredUserMovements}
            filteredLibrary={filteredLibrary}
            selectedMovements={selectedMovements}
            handleMovementToggle={handleMovementToggle}
            isSaving={isSaving}
          />
          <DrawerFooter className="pt-2 flex-shrink-0">
            <FooterContent />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Custom Movement Creation Modal */}
      {showCustomMovementModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/20 flex items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div></div>}>
          <CreateCustomMovementModal
            isOpen={showCustomMovementModal}
            onClose={() => setShowCustomMovementModal(false)}
            onMovementCreated={handleCustomMovementCreated}
            initialName={searchTerm.trim()}
          />
        </Suspense>
      )}
    </>
  );
}
