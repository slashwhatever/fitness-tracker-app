'use client';

import { getCurrentSession, onAuthStateChange } from '@/lib/supabase/auth-utils';
import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { useOptionalSupabase } from '@/lib/providers/SupabaseProvider';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAvailable } = useOptionalSupabase();

  const refreshSession = async () => {
    try {
      // Only try to get session if Supabase is available
      if (isAvailable) {
        const { user: currentUser, session: currentSession } = await getCurrentSession();
        setUser(currentUser);
        setSession(currentSession);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      setUser(null);
      setSession(null);
    }
  };

  const handleSignOut = async () => {
    try {
      // Import signOut dynamically to avoid circular dependencies
      const { signOut } = await import('@/lib/supabase/auth-utils');
      await signOut();
      setUser(null);
      setSession(null);
      
      // Clear any local storage data
      if (typeof window !== 'undefined') {
        // Clear user-specific data from localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('fitness_app_')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    refreshSession().finally(() => setLoading(false));

    // Only listen for auth changes if Supabase is available
    if (!isAvailable) {
      return;
    }

    try {
      // Listen for auth changes
      const { data: { subscription } } = onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session) {
          setUser(session.user);
          setSession(session);
        } else {
          setUser(null);
          setSession(null);
        }
        
        setLoading(false);
      });

      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error('Failed to set up auth state listener:', error);
    }
  }, [isAvailable]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut: handleSignOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
