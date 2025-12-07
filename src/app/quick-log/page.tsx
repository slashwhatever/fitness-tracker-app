"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ContextualNavigation from "@/components/common/ContextualNavigation";
import MovementListItem from "@/components/common/MovementListItem";
import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateUserMovement,
  useMovementTemplates,
  useUserMovements,
} from "@/hooks/useMovements";
import { useTrackingTypes } from "@/hooks/useTrackingTypes";
import type { MovementTemplate, UserMovement } from "@/models/types";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

function QuickLogPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex space-x-3">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 w-32" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function QuickLogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { data: movementTemplates = [], isLoading: templatesLoading } =
    useMovementTemplates();
  const { data: userMovements = [], isLoading: userMovementsLoading } =
    useUserMovements();
  const { data: trackingTypes = [] } = useTrackingTypes();
  const createUserMovementMutation = useCreateUserMovement();

  const isLoading = templatesLoading || userMovementsLoading;

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

      // Navigate to the movement detail page with quickLog param
      router.push(`/library/movement/${userMovementId}?quickLog=true`);
    },
    [trackingTypes, createUserMovementMutation, router]
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <ContextualNavigation context={{ type: "dashboard" }} />
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-4 mt-2">
            <Typography variant="title1">Log a movement</Typography>

            <Card>
              <CardContent className="p-4 sm:p-6">
                {isLoading ? (
                  <QuickLogPageSkeleton />
                ) : (
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex space-x-3">
                      <Input
                        type="text"
                        placeholder="Search movements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                      <Button asChild variant="outline">
                        <Link
                          href={`/movement/new?returnTo=/library/movement/[movementId]?quickLog=true&name=${encodeURIComponent(searchTerm.trim())}`}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Custom
                        </Link>
                      </Button>
                    </div>

                    {/* Movement Lists */}
                    <div className="space-y-4">
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
                                onToggle={() =>
                                  handleMovementSelect(movement.id, movement)
                                }
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
                              onToggle={() =>
                                handleMovementSelect(movement.id, movement)
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {filteredLibrary.length === 0 &&
                      filteredUserMovements.length === 0 && (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">
                            No movements found matching your search.
                          </p>
                        </div>
                      )}

                    {/* Footer */}
                    <div className="flex justify-end pt-4 border-t">
                      <Button variant="outline" asChild>
                        <Link href="/">Cancel</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
