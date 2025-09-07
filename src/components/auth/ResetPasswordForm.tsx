"use client";

import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPassword } from '@/lib/supabase/auth-utils';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof formSchema>;

export const ResetPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: standardSchemaResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: resetError } = await resetPassword(values.email);
      
      if (resetError) {
        setError(resetError);
        return;
      }
      
      setSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  });

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-6 bg-card p-8 rounded-lg border shadow-lg">
          <div className="text-center space-y-2">
            <Typography variant="title1">Check Your Email</Typography>
            <Typography variant="body" className="text-muted-foreground">
              We&apos;ve sent a password reset link to your email address. Click the link in the email to reset your password.
            </Typography>
          </div>
          
          <div className="space-y-4">
            <Typography variant="caption" className="text-muted-foreground text-center block">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </Typography>
            
            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                onClick={() => setSuccess(false)}
                className="w-full"
              >
                Try Again
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/login">
                  Back to Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 bg-card p-8 rounded-lg border shadow-lg">
        <div className="text-center space-y-2">
          <Typography variant="title1">Reset Your Password</Typography>
          <Typography variant="body" className="text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </Typography>
        </div>

        <form onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              className="w-full"
              disabled={loading}
            />
            {errors.email && (
              <Typography variant="caption" className="text-destructive">
                {errors.email.message}
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
            {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ResetPasswordForm;
