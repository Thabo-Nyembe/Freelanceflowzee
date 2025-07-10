'use client'

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<any>(false);
  const [mounted, setMounted] = useState<any>(false);

  useEffect(() => {
    setMounted(true);
    
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  // Return false on initial server-side render
  if (!mounted) return false;

  return matches;
} 