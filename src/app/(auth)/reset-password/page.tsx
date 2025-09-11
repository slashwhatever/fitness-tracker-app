"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm';
import { PageSkeleton } from '@/components/ui/skeleton-patterns';

function ResetPasswordContent() {
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const checkAuthState = async () => {
      const supabase = createClient();
      
      // Check for auth tokens in URL (from email link)
      const { data, error } = await supabase.auth.getSession();
      
      // If we have URL parameters (access_token, refresh_token, etc.), it means
      // the user clicked the reset link from email
      const hasAuthTokens = searchParams.get('access_token') || 
                           searchParams.get('refresh_token') ||
                           window.location.hash.includes('access_token');
      
      if (hasAuthTokens || (data.session && !error)) {
        // User came from email link and has a valid session - show update password form
        setIsUpdateMode(true);
      } else {
        // User navigated directly - show reset password form
        setIsUpdateMode(false);
      }
      
      setLoading(false);
    };

    checkAuthState();

    // Listen for auth state changes (when user clicks email link)
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        if (session) {
          setIsUpdateMode(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  // If user is already logged in and not in reset flow, redirect to dashboard
  useEffect(() => {
    if (user && !isUpdateMode && !loading) {
      router.push('/');
    }
  }, [user, isUpdateMode, loading, router]);

  if (loading) {
    return <PageSkeleton />;
  }

  // Show update password form if user has valid session (from email link)
  if (isUpdateMode) {
    return <UpdatePasswordForm />;
  }

  // Show reset password form for initial email request
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
