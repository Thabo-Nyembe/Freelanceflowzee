'use client'

/**
 * Re-export auth hooks from lib/hooks for backward compatibility
 * with imports from @/lib/auth/hooks
 */
export { useAuth } from '@/lib/hooks/use-auth'
export { useAuthUserId } from '@/lib/hooks/use-auth-user-id'
