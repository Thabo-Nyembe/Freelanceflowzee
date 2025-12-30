/**
 * FreeFlow Mock Data Library - DEPRECATED
 *
 * All mock data has been removed. The app now uses real Supabase database data.
 * Components should use the hooks from @/hooks/use-ai-data.ts or fetch from API routes directly.
 *
 * Migration guide:
 * - Replace mock data imports with useCurrentUser() hook for user data
 * - Replace analytics mock with API calls to /api/analytics/comprehensive
 * - Replace project mock with Supabase queries to 'projects' table
 * - Replace client mock with Supabase queries to 'clients' table
 */

console.warn('lib/mock-data is deprecated - use real database queries via hooks and API routes')

// Re-export types only (no data)
export * from './company'
export * from './customers'
export * from './team'
export * from './projects'
export * from './financials'
export * from './metrics'
export * from './activities'
export * from './ai-insights'
export * from './products'
export * from './communications'
export * from './integrations'
export * from './utils'
export * from './adapters'
