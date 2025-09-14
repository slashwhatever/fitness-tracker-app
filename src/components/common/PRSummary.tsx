"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePersonalRecordsByMovement } from "@/hooks";
import {
  BicepsFlexed,
  Flame,
  Timer,
  TrendingUp,
  Trophy,
  Weight,
} from "lucide-react";

interface PRSummaryProps {
  userMovementId: string;
}

export default function PRSummary({ userMovementId }: PRSummaryProps) {
  const { data: personalRecords = [], isLoading } =
    usePersonalRecordsByMovement(userMovementId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Personal Records</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading personal records...</p>
        </CardContent>
      </Card>
    );
  }

  if (personalRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Personal Records</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Trophy className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No personal records yet</p>
          <p className="text-sm text-muted-foreground">
            Keep logging sets to track your progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group records by type
  const recordsByType = personalRecords.reduce(
    (
      acc: Record<string, typeof personalRecords>,
      record: (typeof personalRecords)[0]
    ) => {
      if (!acc[record.record_type]) {
        acc[record.record_type] = [];
      }
      acc[record.record_type].push(record);
      return acc;
    },
    {}
  );

  const getRecordIcon = (type: string, size: number = 16) => {
    switch (type) {
      case "max_weight":
        return <Weight size={size} />;
      case "max_reps":
        return <Flame size={size} />;
      case "max_duration":
        return <Timer size={size} />;
      case "max_volume":
        return <BicepsFlexed size={size} />;
      default:
        return <Trophy size={size} />;
    }
  };

  const getRecordLabel = (type: string) => {
    switch (type) {
      case "max_weight":
        return "Max Weight";
      case "max_reps":
        return "Max Reps";
      case "max_duration":
        return "Max Duration";
      case "max_volume":
        return "Max Volume";
      default:
        return "Record";
    }
  };

  const formatValue = (type: string, value: number) => {
    switch (type) {
      case "max_weight":
        return `${value} lbs`;
      case "max_reps":
        return `${value} reps`;
      case "max_duration":
        return `${value}s`;
      case "max_volume":
        return `${value} lbs`;
      default:
        return `${value}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5" />
          <span>Personal Records</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(recordsByType).map(
            ([type, records]: [string, typeof personalRecords]) => {
              const latestRecord = records[0]; // Assuming records are sorted by date
              return (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center">
                      {getRecordIcon(type, 24)}
                    </div>
                    <div>
                      <p className="font-medium">{getRecordLabel(type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          latestRecord.achieved_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">
                      {formatValue(type, latestRecord.value)}
                    </span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </CardContent>
    </Card>
  );
}
