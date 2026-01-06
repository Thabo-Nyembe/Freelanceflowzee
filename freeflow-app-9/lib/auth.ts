import { NextRequest } from 'next/server'
import { getServerSession as nextGetServerSession } from 'next-auth'
import { authOptions } from './auth.config'
import type { Session } from 'next-auth'

/**
 * Production Authentication Module
 *
 * Replaces mock authentication with real NextAuth.js implementation
 * Provides utilities for authentication and authorization
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  image?: string | null
}

export interface AuthToken {
  userId: string
  email: string
  role: string
  exp: number
}

export interface ExtendedSession extends Session {
  user: {
    id: string
    email: string
    name: string
    role: string
    image?: string | null
  }
}

// ============================================================================
// SERVER-SIDE AUTHENTICATION
// ============================================================================

/**
 * Get current session on server side
 * Use this in Server Components, API routes, and Server Actions
 *
 * @returns Session object or null if not authenticated
 *
 * @example
 * ```tsx
 * // In a Server Component
 * import { getServerSession } from '@/lib/auth'
 *
 * export default async function ProtectedPage() {
 *   const session = await getServerSession()
 *   if (!session) redirect('/login')
 *   return <div>Hello {session.user.name}</div>
 * }
 * ```
 */
export async function getServerSession(): Promise<ExtendedSession | null> {
  try {
    const session = await nextGetServerSession(authOptions)
    return session as ExtendedSession | null
  } catch (error) {
    console.error('Error getting server session:', error)
    return null
  }
}

/**
 * Get current authenticated user on server side
 * Convenience wrapper around getServerSession
 *
 * @returns AuthUser object or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession()
  if (!session?.user) return null

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    image: session.user.image
  }
}

/**
 * Check if user is authenticated (has valid session)
 *
 * @returns boolean indicating if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession()
  return !!session?.user
}

// ============================================================================
// AUTHORIZATION HELPERS
// ============================================================================

/**
 * Check if current user has specific role
 *
 * @param allowedRoles - Array of allowed roles
 * @returns boolean indicating if user has required role
 *
 * @example
 * ```tsx
 * import { hasRole } from '@/lib/auth'
 *
 * export default async function AdminPage() {
 *   const isAdmin = await hasRole(['admin', 'superadmin'])
 *   if (!isAdmin) return <div>Access Denied</div>
 *   return <AdminDashboard />
 * }
 * ```
 */
export async function hasRole(allowedRoles: string[]): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  return allowedRoles.includes(user.role)
}

/**
 * Check if current user is admin
 *
 * @returns boolean indicating if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(['admin', 'superadmin'])
}

/**
 * Require authentication - throws error if not authenticated
 * Use in API routes and Server Actions
 *
 * @throws Error if not authenticated
 * @returns AuthUser object
 *
 * @example
 * ```tsx
 * import { requireAuth } from '@/lib/auth'
 *
 * export async function POST(request: Request) {
 *   const user = await requireAuth()
 *   // User is guaranteed to be authenticated here
 *   return Response.json({ userId: user.id })
 * }
 * ```
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Require specific role - throws error if user doesn't have role
 * Use in API routes and Server Actions
 *
 * @param allowedRoles - Array of allowed roles
 * @throws Error if user doesn't have required role
 * @returns AuthUser object
 *
 * @example
 * ```tsx
 * import { requireRole } from '@/lib/auth'
 *
 * export async function DELETE(request: Request) {
 *   const user = await requireRole(['admin'])
 *   // User is guaranteed to be admin here
 *   await deleteResource()
 *   return Response.json({ success: true })
 * }
 * ```
 */
export async function requireRole(allowedRoles: string[]): Promise<AuthUser> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`)
  }
  return user
}

// ============================================================================
// API ROUTE HELPERS (Legacy - for backward compatibility)
// ============================================================================

/**
 * Verify auth token from request header
 * @deprecated Use getServerSession() instead
 *
 * This function is kept for backward compatibility with existing API routes
 * that use Bearer token authentication. New code should use NextAuth sessions.
 */
export async function verifyAuthToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Try NextAuth session first
    const session = await getServerSession()
    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        image: session.user.image
      }
    }

    // Fallback to Bearer token (for API clients)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)

    // In production, validate JWT token here
    // For now, reject any Bearer tokens - only session auth allowed
    console.warn('Bearer token authentication is deprecated. Use session authentication.')
    return null
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

// ============================================================================
// CLIENT-SIDE EXPORTS
// ============================================================================

/**
 * Re-export NextAuth client-side hooks for use in Client Components
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useSession, signIn, signOut } from '@/lib/auth'
 *
 * export default function UserMenu() {
 *   const { data: session } = useSession()
 *   if (!session) return <button onClick={() => signIn()}>Sign In</button>
 *   return <button onClick={() => signOut()}>Sign Out</button>
 * }
 * ```
 */
export { useSession, signIn, signOut } from 'next-auth/react'

// Re-export authOptions for API routes
export { authOptions } from './auth.config'

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================

/**
 * Authenticate request (alias for verifyAuthToken)
 * @deprecated Use verifyAuthToken or getServerSession instead
 */
export const authenticate = verifyAuthToken
export const authenticateRequest = verifyAuthToken
