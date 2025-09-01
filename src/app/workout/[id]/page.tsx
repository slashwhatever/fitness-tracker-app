'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DraggableMovementList from '@/components/common/DraggableMovementList';
import MovementSelectionModal from '@/components/common/MovementSelectionModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Workout } from '@/models/types';
import { SupabaseService } from '@/services/supabaseService';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface WorkoutDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
  const { user } = useAuth();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [paramsResolved, setParamsResolved] = useState<{ id: string } | null>(null);

  // Resolve async params
  useEffect(() => {
    params.then(setParamsResolved);
  }, [params]);

  useEffect(() => {
    if (!paramsResolved?.id || !user?.id) return;
    
    const loadWorkout = async () => {
      try {
        const workoutData = await SupabaseService.getWorkout(paramsResolved.id);
        setWorkout(workoutData);
      } catch (error) {
        console.error('Error loading workout:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, [paramsResolved?.id, user?.id]);

  const handleMovementAdded = () => {
    // Trigger refresh of movements
    if (paramsResolved?.id) {
      // Force re-render by updating a key or calling a refresh method
    }
    setShowMovementModal(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <p className="text-muted-foreground">Loading workout...</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (!workout) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Workout not found</h2>
                <p className="text-muted-foreground mb-4">
                  The workout you&apos;re looking for doesn&apos;t exist or has been deleted.
                </p>
                <Button asChild>
                  <Link href="/">Return to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-4 -ml-4">
            <Link href="/" className="flex items-center space-x-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl">{workout.name}</CardTitle>
                  {workout.description && (
                    <p className="text-muted-foreground mt-2">{workout.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowMovementModal(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DraggableMovementList
                workoutId={paramsResolved?.id || ''}
                onMovementAdded={handleMovementAdded}
                onAddMovementClick={() => setShowMovementModal(true)}
              />
            </CardContent>
          </Card>
        </div>

        <MovementSelectionModal
          isOpen={showMovementModal}
          onClose={() => setShowMovementModal(false)}
          workoutId={paramsResolved?.id || ''}
          onMovementAdded={handleMovementAdded}
        />
      </main>
    </ProtectedRoute>
  );
}
