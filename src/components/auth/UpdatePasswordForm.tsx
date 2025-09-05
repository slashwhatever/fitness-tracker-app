"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/common/Typography';
import { updatePassword } from '@/lib/supabase/auth-utils';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

export const UpdatePasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: standardSchemaResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  // Password requirements validation feedback
  const passwordRequirements = [
    { 
      met: password.length >= 8, 
      text: "At least 8 characters" 
    },
    { 
      met: /[A-Z]/.test(password), 
      text: "One uppercase letter" 
    },
    { 
      met: /[a-z]/.test(password), 
      text: "One lowercase letter" 
    },
    { 
      met: /[0-9]/.test(password), 
      text: "One number" 
    },
  ];

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await updatePassword(values.password);
      
      if (updateError) {
        setError(updateError);
        return;
      }
      
      setSuccess(true);
      
      // Redirect to login after successful password update
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Update password error:', err);
    } finally {
      setLoading(false);
    }
  });

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-6 bg-card p-8 rounded-lg border shadow-lg">
          <div className="text-center space-y-2">
            <Typography variant="title1">Password Updated!</Typography>
            <Typography variant="body" className="text-muted-foreground">
              Your password has been successfully updated. You&apos;ll be redirected to the login page shortly.
            </Typography>
          </div>
          
          <div className="text-center">
            <Button asChild className="w-full">
              <Link href="/login">
                Continue to Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 bg-card p-8 rounded-lg border shadow-lg">
        <div className="text-center space-y-2">
          <Typography variant="title1">Set New Password</Typography>
          <Typography variant="body" className="text-muted-foreground">
            Enter your new password below.
          </Typography>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                {...register('password')}
                className="w-full pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <Typography variant="caption" className="text-destructive">
                {errors.password.message}
              </Typography>
            )}
          </div>

          {password && (
            <div className="space-y-2">
              <Typography variant="caption" className="text-muted-foreground">
                Password requirements:
              </Typography>
              <div className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${req.met ? 'bg-green-500' : 'bg-muted'}`} />
                    <Typography 
                      variant="caption" 
                      className={req.met ? 'text-green-600' : 'text-muted-foreground'}
                    >
                      {req.text}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                {...register('confirmPassword')}
                className="w-full pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <Typography variant="caption" className="text-destructive">
                {errors.confirmPassword.message}
              </Typography>
            )}
          </div>

          {error && (
            <Typography variant="body" className="text-destructive text-center">
              {error}
            </Typography>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isValid || loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>

        <div className="text-center">
          <Typography variant="caption" className="text-muted-foreground">
            Remember your password?{" "}
            <Link 
              href="/login" 
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordForm;
