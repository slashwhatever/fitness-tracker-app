'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/AuthProvider';
import { PersonalRecord, Set } from '@/models/types';
import { SupabaseService } from '@/services/supabaseService';
import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PRSummaryProps {
  userMovementId: string;
  className?: string;
}

export default function PRSummary({ userMovementId, className = '' }: PRSummaryProps) {
  const { user } = useAuth();
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [recentSets, setRecentSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        // Load personal records for this user
        const allPRs = await SupabaseService.getPersonalRecords(user.id);
        const movementPRs = allPRs.filter(pr => pr.user_movement_id === userMovementId);
        setPersonalRecords(movementPRs);

        // Load recent sets for this movement
        const sets = await SupabaseService.getSetsByMovement(user.id, userMovementId);
        setRecentSets(sets.slice(0, 5)); // Last 5 sets
      } catch (error) {
        console.error('Error loading PR data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userMovementId, user?.id]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Personal Records</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'reps':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'time':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Records</CardTitle>
      </CardHeader>
      <CardContent>
      
                      {personalRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No personal records yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Start logging sets to track your PRs!</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
              {personalRecords.map((pr, index) => (
                <div key={`${pr.user_movement_id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getTypeIcon(pr.record_type)}</span>
                    <div>
                      <p className="font-medium">Personal Record</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(pr.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {pr.value}
                  </Badge>
                </div>
              ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}


