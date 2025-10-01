"use client";

import { createClient } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const refreshSession = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Failed to get session:", error);
        setUser(null);
        setSession(null);
        return;
      }

      setUser(session?.user ?? null);
      setSession(session);
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setUser(null);
      setSession(null);
    }
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);

      // Clear any local storage data
      if (typeof window !== "undefined") {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith("fitness_app_")) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useEffect(() => {
    // Get initial session
    refreshSession().finally(() => setLoading(false));

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setSession(session);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [refreshSession, supabase.auth]);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      session,
      loading,
      signOut: handleSignOut,
      refreshSession,
    }),
    [user, session, loading, handleSignOut, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
