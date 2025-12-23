"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";

// Dynamically import devtools with SSR disabled to avoid HMR issues
const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (mod) => mod.ReactQueryDevtools
    ),
  { ssr: false }
);

// Create a stable QueryClient outside of the component to survive HMR
let browserQueryClient: QueryClient | undefined = undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Longer stale time - data stays fresh longer
        staleTime: 5 * 60 * 1000, // 5 minutes
        // Keep data in cache longer to avoid re-fetching
        gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
        // Enable background refetching for better UX
        refetchOnWindowFocus: false, // Disable aggressive refetching
        refetchOnReconnect: "always",
        retry: 1, // Don't retry failed requests aggressively
        refetchInterval: false, // No automatic background polling by default
        refetchIntervalInBackground: false,
        // Network-based stale time - longer for slower connections
        networkMode: "online",
      },
      mutations: {
        // Keep mutation data longer for optimistic updates
        gcTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });
}

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is important to avoid re-creating the client on hot reloads
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export const ReactQueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
