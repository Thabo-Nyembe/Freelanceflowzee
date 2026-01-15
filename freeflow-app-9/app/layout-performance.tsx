/**
 * Performance Optimization Script
 * This ensures all performance best practices are applied
 */

export function PerformanceOptimizations() {
  return (
    <>
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch for faster lookups */}
      <link rel="dns-prefetch" href="https://gcinvwprtlnwuwuvmrux.supabase.co" />
      
      {/* Resource hints for better performance */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#000000" />
    </>
  )
}
