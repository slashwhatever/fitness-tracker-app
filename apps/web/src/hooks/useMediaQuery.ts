import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;
    
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    
    // Set initial value
    setMatches(mediaQueryList.matches);
    
    // Add listener
    mediaQueryList.addEventListener('change', listener);
    
    // Cleanup
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  // During SSR or before hydration, always return false
  // This ensures server and client render the same content initially
  if (!mounted) {
    return false;
  }

  return matches;
}