"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ContextualNavigation from "@/components/common/ContextualNavigation";
import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsSkeleton } from "@/components/ui/skeleton-patterns";
import { Switch } from "@/components/ui/switch";
import { useUpdateUserProfile, useUserProfile } from "@/hooks/useUserProfile";
import { signOut } from "@/lib/supabase/auth-utils";
import { DistanceUnit, TIMER_PRESETS, WeightUnit } from "@/models/types";
import { LogOut, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
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
      console.log("Profile updated successfully");
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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
          <SettingsSkeleton />
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <ContextualNavigation context={{ type: "settings" }} />
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4 mt-2">
            <div className="mb-6">
              <Typography variant="title2">Settings</Typography>
              <Typography variant="caption">
                Manage your profile preferences and workout settings
              </Typography>
            </div>

            <div className="space-y-6">
              {/* Profile Section */}
              <div className="space-y-4">
                <div>
                  <Typography variant="title3">Profile</Typography>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                  <Typography variant="caption">
                    This name will be displayed on your profile
                  </Typography>
                </div>
              </div>

              {/* Workout Preferences */}
              <Typography variant="title3">Workout preferences</Typography>
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="rest-timer">Default Rest Timer</Label>
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
                  <Typography variant="caption">
                    This timer will be used for all movements unless overridden
                  </Typography>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="timer-pin">Pin Timer</Label>
                      <Typography variant="caption">
                        Keep the timer visible at the top of the screen when
                        scrolling
                      </Typography>
                    </div>
                    <Switch
                      id="timer-pin"
                      checked={timerPinEnabled}
                      onCheckedChange={setTimerPinEnabled}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight-unit">Weight Unit</Label>
                    <Select
                      value={weightUnit}
                      onValueChange={(value: WeightUnit) =>
                        setWeightUnit(value)
                      }
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
                    <Label htmlFor="distance-unit">Distance Unit</Label>
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
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-6 border-t">
                <div className="flex flex-col-reverse sm:flex-row gap-3 order-2 sm:order-1">
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full sm:w-auto text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-3 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="w-full sm:w-auto"
                  >
                    Reset Changes
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
