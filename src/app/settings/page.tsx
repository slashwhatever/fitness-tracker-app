'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserProfile } from '@/hooks/useUserProfile';
import { DistanceUnit, TIMER_PRESETS, UserProfile, WeightUnit } from '@/models/types';
import { SupabaseService } from '@/services/supabaseService';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { data: userProfile, isLoading } = useUserProfile();
  
  // Form state
  const [displayName, setDisplayName] = useState('');
  const [defaultRestTimer, setDefaultRestTimer] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('miles');
  const [isSaving, setIsSaving] = useState(false);

  // Populate form when profile data loads
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.display_name || '');
      setDefaultRestTimer(userProfile.default_rest_timer?.toString() || 'none');
      setWeightUnit((userProfile.weight_unit as WeightUnit) || 'lbs');
      setDistanceUnit((userProfile.distance_unit as DistanceUnit) || 'miles');      
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userProfile) return;

    setIsSaving(true);
    try {
      const updates: Partial<UserProfile> = {
        display_name: displayName.trim() || undefined,
        default_rest_timer: defaultRestTimer && defaultRestTimer !== 'none' ? parseInt(defaultRestTimer) : 90, // Default 90s
        weight_unit: weightUnit,
        distance_unit: distanceUnit,
        updated_at: new Date().toISOString(),
      };

      const updatedProfile = { ...userProfile, ...updates };
      const success = await SupabaseService.saveUserProfile(updatedProfile);
      if (success) {
        // Show success feedback (could add toast notification here)
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (userProfile) {
      setDisplayName(userProfile.display_name || '');
      setDefaultRestTimer(userProfile.default_rest_timer?.toString() || 'none');
      setWeightUnit((userProfile.weight_unit as WeightUnit) || 'lbs');
      setDistanceUnit((userProfile.distance_unit as DistanceUnit) || 'miles');
      
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading your settings...</p>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground text-sm">
              Manage your profile preferences and workout settings
            </p>
          </div>


        <div className="space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-3">Profile</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
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
            <div>
              <h2 className="text-lg font-semibold mb-3">Workout Preferences</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rest-timer">Default Rest Timer</Label>
              <Select value={defaultRestTimer} onValueChange={setDefaultRestTimer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select default rest timer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No default timer</SelectItem>
                  {TIMER_PRESETS.map((preset) => (
                    <SelectItem key={preset.seconds} value={preset.seconds.toString()}>
                      {preset.label} ({preset.seconds}s)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This timer will be used for all movements unless overridden
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight-unit">Weight Unit</Label>
                <Select value={weightUnit} onValueChange={(value: WeightUnit) => setWeightUnit(value)}>
                  <SelectTrigger>
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
                <Select value={distanceUnit} onValueChange={(value: DistanceUnit) => setDistanceUnit(value)}>
                  <SelectTrigger>
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
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t">
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
              Reset Changes
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </main>
    </ProtectedRoute>
  );
}