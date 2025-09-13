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
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Zod schema for form validation
const profileSchema = z.object({
  display_name: z.string().min(1, "Display name is required").max(50, "Display name must be 50 characters or less"),
  default_rest_timer: z.number().min(30, "Rest timer must be at least 30 seconds").max(600, "Rest timer cannot exceed 10 minutes"),
  profile_visibility: z.enum(['public', 'private']),
  workout_sharing: z.boolean(),
});

type UserProfileFormData = z.infer<typeof profileSchema>;

export function UserProfile() {
  const { user, refreshSession } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserProfileFormData>({
    defaultValues: {
      display_name: '',
      default_rest_timer: 180, // 3 minutes default
      profile_visibility: 'private',
      workout_sharing: false,
    },
    mode: 'onChange',
  });

  const formValues = watch();

  // Load user profile data and reset form
  useEffect(() => {
    if (user?.user_metadata) {
      reset({
        display_name: user.user_metadata.display_name || '',
        default_rest_timer: user.user_metadata.default_rest_timer || 180,
        profile_visibility: user.user_metadata.profile_visibility || 'private',
        workout_sharing: user.user_metadata.workout_sharing || false,
      });
    }
  }, [user, reset]);

  const onSubmit = handleSubmit(async (data: UserProfileFormData) => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const { error: updateError } = await updateUserMetadata({
        display_name: data.display_name,
        default_rest_timer: data.default_rest_timer,
        profile_visibility: data.profile_visibility,
        workout_sharing: data.workout_sharing,
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
  });



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
        
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
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
                  value={formValues.display_name}
                  onChange={(e) => setValue('display_name', e.target.value)}
                  placeholder="Enter your display name"
                />
                {errors.display_name && (
                  <p className="text-sm text-destructive">{errors.display_name.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Timer Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Timer Preferences</h3>
            
            <div className="space-y-2">
              <Label htmlFor="defaultTimer">Default Rest Timer</Label>
              <Select
                value={formValues.default_rest_timer.toString()}
                onValueChange={(value) => setValue('default_rest_timer', parseInt(value))}
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
              {errors.default_rest_timer && (
                <p className="text-sm text-destructive">{errors.default_rest_timer.message}</p>
              )}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Privacy Settings</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                <Select
                  value={formValues.profile_visibility}
                  onValueChange={(value: 'public' | 'private') => setValue('profile_visibility', value)}
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
                  checked={formValues.workout_sharing}
                  onChange={(e) => setValue('workout_sharing', e.target.checked)}
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
              type="submit"
              disabled={saving || !isDirty}
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
