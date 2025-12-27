"use client";

import { useUpdateUserProfile, useUserProfile } from "@/hooks/useUserProfile";
import { DistanceUnit, TIMER_PRESETS, WeightUnit } from "@/models/types";
import { Typography } from "@components/common/Typography";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Skeleton } from "@components/ui/skeleton";
import { Switch } from "@components/ui/switch";
import { signOut } from "@fitness/shared";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function SettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Workout Preferences */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
        <Skeleton className="h-10 w-full sm:w-28" />
        <div className="flex flex-col sm:flex-row gap-2">
          <Skeleton className="h-10 w-full sm:w-32" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
      </div>
    </div>
  );
}

export default function SettingsContent() {
  const { data: userProfile, isLoading } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [defaultRestTimer, setDefaultRestTimer] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("lbs");
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("miles");
  const [timerPinEnabled, setTimerPinEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  // Populate form when profile data loads
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.display_name || "");
      setDefaultRestTimer(userProfile.default_rest_timer?.toString() || "none");
      setWeightUnit((userProfile.weight_unit as WeightUnit) || "lbs");
      setDistanceUnit((userProfile.distance_unit as DistanceUnit) || "miles");
      setTimerPinEnabled(userProfile.timer_pin_enabled ?? true);
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userProfile) return;

    setIsSaving(true);
    try {
      const updates = {
        display_name: displayName.trim() || undefined,
        default_rest_timer:
          defaultRestTimer && defaultRestTimer !== "none"
            ? parseInt(defaultRestTimer)
            : 90, // Default 90s
        weight_unit: weightUnit,
        distance_unit: distanceUnit,
        timer_pin_enabled: timerPinEnabled,
        updated_at: new Date().toISOString(),
      };

      await updateProfileMutation.mutateAsync(updates);
      // Show success feedback (could add toast notification here)
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (userProfile) {
      setDisplayName(userProfile.display_name || "");
      setDefaultRestTimer(userProfile.default_rest_timer?.toString() || "none");
      setWeightUnit((userProfile.weight_unit as WeightUnit) || "lbs");
      setDistanceUnit((userProfile.distance_unit as DistanceUnit) || "miles");
      setTimerPinEnabled(userProfile.timer_pin_enabled ?? true);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Failed to sign out:", error);
      } else {
        router.push("/auth");
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        {isLoading ? (
          <SettingsPageSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="space-y-4">
              <Typography variant="title3">Profile</Typography>
              <div className="space-y-2">
                <Label
                  htmlFor="display-name"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Display Name
                </Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
                <p className="text-xs text-muted-foreground">
                  This name will be displayed on your profile
                </p>
              </div>
            </div>

            {/* Workout Preferences */}
            <div className="space-y-4">
              <Typography variant="title3">Workout preferences</Typography>

              <div className="space-y-2">
                <Label
                  htmlFor="rest-timer"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Default Rest Timer
                </Label>
                <Select
                  value={defaultRestTimer}
                  onValueChange={setDefaultRestTimer}
                >
                  <SelectTrigger id="rest-timer">
                    <SelectValue placeholder="Select default rest timer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No default timer</SelectItem>
                    {TIMER_PRESETS.map((preset) => (
                      <SelectItem
                        key={preset.seconds}
                        value={preset.seconds.toString()}
                      >
                        {preset.label} ({preset.seconds}s)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This timer will be used for all movements unless overridden
                </p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="timer-pin">Pin Timer</Label>
                  <p className="text-xs text-muted-foreground">
                    Keep the timer visible at the top of the screen when
                    scrolling
                  </p>
                </div>
                <Switch
                  id="timer-pin"
                  checked={timerPinEnabled}
                  onCheckedChange={setTimerPinEnabled}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="weight-unit"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Weight Unit
                  </Label>
                  <Select
                    value={weightUnit}
                    onValueChange={(value: WeightUnit) => setWeightUnit(value)}
                  >
                    <SelectTrigger id="weight-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="distance-unit"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Distance Unit
                  </Label>
                  <Select
                    value={distanceUnit}
                    onValueChange={(value: DistanceUnit) =>
                      setDistanceUnit(value)
                    }
                  >
                    <SelectTrigger id="distance-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miles">Miles</SelectItem>
                      <SelectItem value="km">Kilometers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleSignOut}
                className="w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>

              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="w-full sm:w-auto"
                >
                  Reset changes
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
