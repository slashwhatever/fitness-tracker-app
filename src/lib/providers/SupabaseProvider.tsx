'use client';

import type { Database } from '@/lib/supabase/client';
import { supabaseClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface SupabaseContextType {
  client: SupabaseClient<Database> | null;
  isAvailable: boolean;
  isConfigured: boolean;
  error: string | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [contextValue, setContextValue] = useState<SupabaseContextType>({
    client: null,
    isAvailable: false,
    isConfigured: false,
    error: null,
  });

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      setContextValue({
        client: null,
        isAvailable: false,
        isConfigured: false,
        error: 'Supabase environment variables are not configured',
      });
      return;
    }

    if (!supabaseClient) {
      setContextValue({
        client: null,
        isAvailable: false,
        isConfigured: true,
        error: 'Failed to initialize Supabase client',
      });
      return;
    }

    // Test the connection
    const testConnection = async () => {
      try {
        // Simple health check - try to get the current session
        const { error } = await supabaseClient!.auth.getSession();
        
        if (error && error.message.includes('Invalid API key')) {
          setContextValue({
            client: supabaseClient,
            isAvailable: false,
            isConfigured: true,
            error: 'Invalid Supabase API key',
          });
          return;
        }

        // Connection successful
        setContextValue({
          client: supabaseClient,
          isAvailable: true,
          isConfigured: true,
          error: null,
        });
      } catch (error) {
        console.error('Supabase connection test failed:', error);
        setContextValue({
          client: supabaseClient,
          isAvailable: false,
          isConfigured: true,
          error: error instanceof Error ? error.message : 'Unknown connection error',
        });
      }
    };

    testConnection();
  }, []);

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

// Hook for components that require Supabase to be available
export function useRequireSupabase() {
  const { client, isAvailable, error } = useSupabase();
  
  if (!isAvailable || !client) {
    throw new Error(error || 'Supabase client not available');
  }
  
  return client;
}

// Hook for components that can work with or without Supabase
export function useOptionalSupabase() {
  const { client, isAvailable } = useSupabase();
  return {
    client: isAvailable ? client : null,
    isAvailable,
  };
}
