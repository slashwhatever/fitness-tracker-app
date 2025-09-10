'use client';

import { Set, UserMovement } from '@/models/types';
import { useMemo } from 'react';
import EditableSet from './EditableSet';
import SessionComparison from './SessionComparison';
import { Typography } from './Typography';

interface GroupedSetHistoryProps {
  sets: Set[];
  movement: UserMovement;
  onDuplicate: (originalSet: Set) => void;
}

interface GroupedSets {
  [date: string]: Set[];
}

export default function GroupedSetHistory({
  sets,
  movement,
  onDuplicate,
}: GroupedSetHistoryProps) {
  // Group sets by day
  const groupedSets = useMemo(() => {
    const groups: GroupedSets = {};
    
    sets.forEach((set) => {
      const date = new Date(set.created_at);
      const dateKey = date.toDateString(); // This gives us "Mon Dec 25 2023" format
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(set);
    });

    // Sort each group by time (most recent first within each day)
    Object.keys(groups).forEach((dateKey) => {
      groups[dateKey].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return groups;
  }, [sets]);

  // Sort date keys (most recent days first)
  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedSets).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  }, [groupedSets]);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Format as "MON, 25 DEC 2023"
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(',', ',');
  };


  if (sets.length === 0) {
    return (
      <div className="text-center py-6 p-4 bg-muted/30 rounded-lg border-dashed border">
        <Typography variant="caption">No sets logged for this movement yet.</Typography>
        <Typography variant="footnote">Use the quick log above to record your first set!</Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDateKeys.map((dateKey, index) => {
        const setsForDay = groupedSets[dateKey];
        const previousDaySets = index < sortedDateKeys.length - 1 ? 
          groupedSets[sortedDateKeys[index + 1]] : undefined;
        
        return (
          <div key={dateKey} className="space-y-2">
            {/* Date Header */}
            <div className="space-y-2">
              <Typography variant="title3" className="text-muted-foreground">
                {formatDateHeader(dateKey)}
              </Typography>
              
              {/* Session Comparison - only show for most recent session when there are multiple sessions */}
              {index === 0 && sortedDateKeys.length > 1 && (
                <SessionComparison
                  currentSets={setsForDay}
                  previousSets={previousDaySets}
                  movement={movement}
                />
              )}
            </div>

            {/* Sets for that day */}
            <div className="space-y-2">
              {setsForDay.map((set) => (
                <EditableSet
                  key={set.id}
                  set={set}
                  movement={movement}
                  onDuplicate={onDuplicate}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
