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
  useCreateUserMovement,
  useMovementTemplates,
  useUserMovements,
} from "@/hooks/useMovements";
import { useTrackingTypes } from "@/hooks/useTrackingTypes";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import type { MovementTemplate, UserMovement } from "@/models/types";
import { Plus } from "lucide-react";
import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { Typography } from "./Typography";

const CreateCustomMovementModal = lazy(
  () => import("@/components/common/CreateCustomMovementModal")
);

interface QuickLogMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovementSelected: (movementId: string) => void;
}

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
  handleMovementSelect: (
    movementId: string,
    movementData: UserMovement | MovementTemplate
  ) => void;
}

const SearchAndContent = React.memo(function SearchAndContent({
  className = "",
  searchValue,
  onSearchChange,
  setShowCustomMovementModal,
  scrollContainerRef,
  filteredUserMovements,
  filteredLibrary,
  handleMovementSelect,
}: SearchAndContentProps) {
  const { register, watch } = useForm<SearchFormData>({
    defaultValues: {
      search: searchValue,
    },
  });

  const watchedSearch = watch("search");

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
          className="flex items-center space-x-2 whitespace-nowrap h-12"
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
                    isSelected={false}
                    isSaving={false}
                    onToggle={() => handleMovementSelect(movement.id, movement)}
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
                  isSelected={false}
                  isSaving={false}
                  onToggle={() => handleMovementSelect(movement.id, movement)}
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

export default function QuickLogMovementModal({
  isOpen,
  onClose,
  onMovementSelected,
}: QuickLogMovementModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomMovementModal, setShowCustomMovementModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data: movementTemplates = [] } = useMovementTemplates();
  const { data: userMovements = [] } = useUserMovements();
  const { data: trackingTypes = [] } = useTrackingTypes();
  const createUserMovementMutation = useCreateUserMovement();

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const filteredLibrary = useMemo(() => {
    return movementTemplates
      .filter((movement) => {
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
    return userMovements
      .filter(
        (movement) =>
          movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movement.muscle_groups?.some((group) =>
            group.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [userMovements, searchTerm]);

  const handleMovementSelect = useCallback(
    async (
      movementId: string,
      movementData: UserMovement | MovementTemplate
    ) => {
      let userMovementId = movementId;

      // Check if this is a template that needs a user movement created
      const isTemplate =
        "tracking_type_id" in movementData && !("user_id" in movementData);

      if (isTemplate) {
        const templateMovement = movementData as MovementTemplate;
        const trackingType = trackingTypes.find(
          (tt) => tt.id === templateMovement.tracking_type_id
        );
        if (!trackingType) {
          throw new Error(
            `Unknown tracking type ID: ${templateMovement.tracking_type_id}`
          );
        }

        // Create user movement from template
        const newUserMovement = await createUserMovementMutation.mutateAsync({
          template_id: null,
          name: templateMovement.name,
          muscle_groups: templateMovement.muscle_groups,
          tracking_type_id: trackingType.id,
          personal_notes: templateMovement.instructions,
        });
        userMovementId = newUserMovement.id;
      }

      // Close modal and notify parent with the user movement ID
      onClose();
      onMovementSelected(userMovementId);
    },
    [trackingTypes, createUserMovementMutation, onClose, onMovementSelected]
  );

  const handleCustomMovementCreated = (userMovementId: string) => {
    setShowCustomMovementModal(false);
    onMovementSelected(userMovementId);
  };

  const handleCancel = () => {
    onClose();
  };

  const FooterContent = () => (
    <div className="flex justify-end items-center pt-4 border-t bg-background">
      <Button variant="outline" onClick={handleCancel}>
        Cancel
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-3xl h-[85vh] w-[90vw] flex flex-col">
            <DialogHeader className="pb-4 flex-shrink-0">
              <DialogTitle className="text-xl">Log a Movement</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Select a movement to quickly log your performance
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
              handleMovementSelect={handleMovementSelect}
            />
            <div className="flex-shrink-0">
              <FooterContent />
            </div>
          </DialogContent>
        </Dialog>

        {/* Custom Movement Creation Modal */}
        {showCustomMovementModal && (
          <Suspense
            fallback={
              <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            }
          >
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
            <DrawerTitle>Log a movement</DrawerTitle>
          </DrawerHeader>
          <SearchAndContent
            className="px-4 flex-1 min-h-0"
            searchValue={searchTerm}
            onSearchChange={handleSearchChange}
            setShowCustomMovementModal={setShowCustomMovementModal}
            scrollContainerRef={scrollContainerRef}
            filteredUserMovements={filteredUserMovements}
            filteredLibrary={filteredLibrary}
            handleMovementSelect={handleMovementSelect}
          />
          <DrawerFooter className="pt-2 flex-shrink-0">
            <FooterContent />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Custom Movement Creation Modal */}
      {showCustomMovementModal && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          }
        >
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
