import { QueryClient } from '@tanstack/react-query';

// Map to store pending invalidations
const pendingInvalidations = new Map<string, NodeJS.Timeout>();

/**
 * Debounced query invalidation to prevent duplicate API calls
 * @param queryClient - React Query client
 * @param queryKey - Query key to invalidate
 * @param delay - Delay in milliseconds (default: 100ms)
 */
export function debouncedInvalidateQueries(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  delay: number = 100
): void {
  const key = JSON.stringify(queryKey);
  
  // Clear existing timeout if any
  const existingTimeout = pendingInvalidations.get(key);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }
  
  // Set new timeout
  const timeout = setTimeout(() => {
    queryClient.invalidateQueries({ queryKey });
    pendingInvalidations.delete(key);
  }, delay);
  
  pendingInvalidations.set(key, timeout);
}