'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth/AuthProvider';
import { updateUserMetadata } from '@/lib/supabase/auth-utils';
import { Loader2, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserProfileData {
  display_name: string;
  default_rest_timer: number;
  privacy_settings: {
    profile_visibility: 'public' | 'private';
    workout_sharing: boolean;
  };
}

export function UserProfile() {
  const { user, refreshSession } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [profileData, setProfileData] = useState<UserProfileData>({
    display_name: '',
    default_rest_timer: 180, // 3 minutes default
    privacy_settings: {
      profile_visibility: 'private',
      workout_sharing: false,
    },
  });

  // Load user profile data
  useEffect(() => {
    if (user?.user_metadata) {
      setProfileData({
        display_name: user.user_metadata.display_name || '',
        default_rest_timer: user.user_metadata.default_rest_timer || 180,
        privacy_settings: {
          profile_visibility: user.user_metadata.profile_visibility || 'private',
          workout_sharing: user.user_metadata.workout_sharing || false,
        },
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const { error: updateError } = await updateUserMetadata({
        display_name: profileData.display_name,
        default_rest_timer: profileData.default_rest_timer,
        profile_visibility: profileData.privacy_settings.profile_visibility,
        workout_sharing: profileData.privacy_settings.workout_sharing,
      });

      if (updateError) {
        setError(updateError);
        return;
      }

      // Refresh the session to get updated user metadata
      await refreshSession();
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };



  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <User className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Please sign in to view your profile</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Manage your account preferences and default settings
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed from this interface
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={profileData.display_name}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    display_name: e.target.value
                  }))}
                  placeholder="Enter your display name"
                />
              </div>
            </div>
          </div>

          {/* Timer Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Timer Preferences</h3>
            
            <div className="space-y-2">
              <Label htmlFor="defaultTimer">Default Rest Timer</Label>
              <Select
                value={profileData.default_rest_timer.toString()}
                onValueChange={(value) => setProfileData(prev => ({
                  ...prev,
                  default_rest_timer: parseInt(value)
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1:00 minute</SelectItem>
                  <SelectItem value="90">1:30 minutes</SelectItem>
                  <SelectItem value="120">2:00 minutes</SelectItem>
                  <SelectItem value="150">2:30 minutes</SelectItem>
                  <SelectItem value="180">3:00 minutes</SelectItem>
                  <SelectItem value="240">4:00 minutes</SelectItem>
                  <SelectItem value="300">5:00 minutes</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will be used as the default rest timer for new workouts. 
                You can override this for specific workouts or movements.
              </p>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Privacy Settings</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                <Select
                  value={profileData.privacy_settings.profile_visibility}
                  onValueChange={(value: 'public' | 'private') => setProfileData(prev => ({
                    ...prev,
                    privacy_settings: {
                      ...prev.privacy_settings,
                      profile_visibility: value
                    }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Control who can see your profile information
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="workoutSharing"
                  checked={profileData.privacy_settings.workout_sharing}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    privacy_settings: {
                      ...prev.privacy_settings,
                      workout_sharing: e.target.checked
                    }
                  }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="workoutSharing" className="text-sm">
                  Allow workout sharing
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Enable this to share your workouts with other users
              </p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-600 text-sm bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md p-3">
              Profile updated successfully!
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
