import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "./client";

/**
 * Get Supabase client
 */
function getSupabaseClient() {
  return createClient();
}

/**
 * Get current authentication session
 */
export async function getCurrentSession(): Promise<{
  user: User | null;
  session: Session | null;
  error: string | null;
}> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.getSession();

    if (error) {
      return {
        user: null,
        session: null,
        error: error.message,
      };
    }

    return {
      user: data.session?.user || null,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{
  user: User | null;
  session: Session | null;
  error: string | null;
}> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        session: null,
        error: error.message,
      };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  options?: {
    emailRedirectTo?: string;
    data?: Record<string, unknown>;
  }
): Promise<{
  user: User | null;
  session: Session | null;
  error: string | null;
}> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      return {
        user: null,
        session: null,
        error: error.message,
      };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{
  error: string | null;
}> {
  try {
    const client = getSupabaseClient();
    const { error } = await client.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Reset password for email
 */
export async function resetPassword(
  email: string,
  redirectTo?: string
): Promise<{
  error: string | null;
}> {
  try {
    const client = getSupabaseClient();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update user password
 */
export async function updatePassword(password: string): Promise<{
  user: User | null;
  error: string | null;
}> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.updateUser({
      password,
    });

    if (error) {
      return {
        user: null,
        error: error.message,
      };
    }

    return {
      user: data.user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(
  metadata: Record<string, unknown>
): Promise<{
  user: User | null;
  error: string | null;
}> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.updateUser({
      data: metadata,
    });

    if (error) {
      return {
        user: null,
        error: error.message,
      };
    }

    return {
      user: data.user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Listen to authentication state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const client = getSupabaseClient();
  return client.auth.onAuthStateChange(callback);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { session } = await getCurrentSession();
    return session !== null;
  } catch {
    return false;
  }
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { user } = await getCurrentSession();
    return user?.id || null;
  } catch {
    return null;
  }
}
