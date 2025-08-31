'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DistanceUnit, UserProfile, WeightUnit } from '@/models/types';
import { persistenceService } from '@/services/persistenceService';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [defaultRestTimer, setDefaultRestTimer] = useState(60);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('miles');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load current user profile
    const profile = persistenceService.getUserProfile();
    if (profile) {
      setUserProfile(profile);
      setDisplayName(profile.display_name || '');
      setDefaultRestTimer(profile.default_rest_timer);
      setWeightUnit(profile.weight_unit || 'lbs');
      setDistanceUnit(profile.distance_unit || 'miles');
    } else {
      // Create default profile if none exists
      const defaultProfile: UserProfile = {
        id: 'default-user',
        display_name: '',
        default_rest_timer: 60,
        weight_unit: 'lbs',
        distance_unit: 'miles',
        privacy_settings: {
          profile_visibility: 'private',
          workout_sharing: false,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      persistenceService.saveUserProfile(defaultProfile);
      setUserProfile(defaultProfile);
    }
  }, []);

  const handleSave = async () => {
    if (!userProfile) return;

    setIsSaving(true);
    try {
      const updatedProfile: UserProfile = {
        ...userProfile,
        display_name: displayName.trim() || undefined,
        default_rest_timer: defaultRestTimer,
        weight_unit: weightUnit,
        distance_unit: distanceUnit,
        updated_at: new Date().toISOString(),
      };

      persistenceService.saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      
      // Show success feedback and navigate back
      router.back();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimerDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Customize your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Timer Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Timer Settings</CardTitle>
            <CardDescription>
              Set your default rest timer between sets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rest-timer">Default Rest Timer</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="rest-timer"
                  type="number"
                  value={defaultRestTimer}
                  onChange={(e) => setDefaultRestTimer(Number(e.target.value))}
                  min="0"
                  max="600"
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  seconds ({formatTimerDisplay(defaultRestTimer)})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unit Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Unit Preferences</CardTitle>
            <CardDescription>
              Choose your preferred units for weight and distance measurements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>
              Control how your data is shared and displayed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Privacy settings will be available in a future update. Currently, all data is stored locally on your device.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
