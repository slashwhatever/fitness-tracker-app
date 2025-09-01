'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/AuthProvider';
import { UserMovement } from '@/models/types';
import { SupabaseService } from '@/services/supabaseService';
import { Edit, Play, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DraggableMovementListProps {
  workoutId: string;
  onMovementAdded?: () => void;
  onAddMovementClick?: () => void; // New prop for triggering modal
}

export default function DraggableMovementList({ workoutId, onMovementAdded, onAddMovementClick }: DraggableMovementListProps) {
  const { user } = useAuth();
  const [movements, setMovements] = useState<UserMovement[]>([]);
  const [editingMovementId, setEditingMovementId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);

  const loadWorkoutMovements = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Get workout movements with user movement details
      const workoutMovements = await SupabaseService.getWorkoutMovements(workoutId);
      const userMovementIds = workoutMovements.map(wm => wm.user_movement_id);
      
      const userMovements: UserMovement[] = [];
      for (const id of userMovementIds) {
        const movement = await SupabaseService.getUserMovement(id);
        if (movement) {
          userMovements.push(movement);
        }
      }
      
      setMovements(userMovements);
    } catch (error) {
      console.error('Error loading workout movements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkoutMovements();
  }, [workoutId, user?.id]);

  const handleMovementAdded = async (userMovementId: string) => {
    // Get next order index
    const workoutMovements = await SupabaseService.getWorkoutMovements(workoutId);
    const nextOrderIndex = workoutMovements.length;
    
    // Create workout movement entry
    const workoutMovement = {
      id: crypto.randomUUID(),
      workout_id: workoutId,
      user_movement_id: userMovementId,
      order_index: nextOrderIndex,
      created_at: new Date().toISOString(),
    };
    
    const saved = await SupabaseService.saveWorkoutMovement(workoutMovement);
    if (saved) {
      await loadWorkoutMovements(); // Refresh the list
      onMovementAdded?.();
    }
  };

  const handleDeleteMovement = async (userMovementId: string) => {
    if (!confirm('Remove this movement from the workout?')) return;
    
    // Find and delete the workout movement entry
    const workoutMovements = await SupabaseService.getWorkoutMovements(workoutId);
    const toDelete = workoutMovements.find(wm => wm.user_movement_id === userMovementId);
    
    if (toDelete) {
      const success = await SupabaseService.deleteWorkoutMovement(toDelete.id);
      if (success) {
        await loadWorkoutMovements(); // Refresh the list
      }
    }
  };

  const handleStartEdit = (movement: UserMovement) => {
    setEditingMovementId(movement.id);
    setEditingName(movement.name);
  };

  const handleSaveEdit = async () => {
    if (!editingMovementId || !editingName.trim()) return;
    
    const updated = await SupabaseService.updateUserMovement(editingMovementId, {
      name: editingName.trim(),
      updated_at: new Date().toISOString(),
    });
    
    if (updated) {
      await loadWorkoutMovements(); // Refresh the list
      setEditingMovementId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMovementId(null);
    setEditingName('');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading movements...</p>
        </CardContent>
      </Card>
    );
  }

  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No movements added yet</h3>
            <p className="text-muted-foreground mb-6">
              Add some exercises to your workout to get started tracking your progress.
            </p>
            <Button 
              onClick={onAddMovementClick}
              className="inline-flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Movement</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {movements.map((movement) => (
            <div key={movement.id} className="flex justify-between items-center p-4 bg-card border border-default rounded-lg hover:border-gray-300 transition-all cursor-pointer">
              <div className="flex-1">
                {editingMovementId === movement.id ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="text-lg font-bold"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit();
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <h3 className="text-lg font-bold text-foreground">{movement.name}</h3>
                )}
                <p className="text-sm text-muted-foreground mt-1">{movement.muscle_groups?.join(', ') || 'Unknown'}</p>
                <span className="inline-block mt-1 px-2 py-1 bg-primary text-primary-foreground text-xs rounded capitalize">
                  {movement.tracking_type}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {editingMovementId === movement.id ? (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleSaveEdit}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartEdit(movement)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Link href={`/movement/${movement.id}`}>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Track
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleDeleteMovement(movement.id)}
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-red-500 h-9 w-9"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
