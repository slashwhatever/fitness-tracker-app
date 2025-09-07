'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export const ReactQueryClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Longer stale time - data stays fresh longer
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Keep data in cache longer to avoid re-fetching
            gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
            // Enable background refetching for better UX
            refetchOnWindowFocus: false, // Disable aggressive refetching
            refetchOnReconnect: 'always',
            retry: 1, // Don't retry failed requests aggressively
            refetchInterval: false, // No automatic background polling by default
            refetchIntervalInBackground: false,
            // Network-based stale time - longer for slower connections
            networkMode: 'online',
          },
          mutations: {
            // Keep mutation data longer for optimistic updates
            gcTime: 5 * 60 * 1000, // 5 minutes
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
