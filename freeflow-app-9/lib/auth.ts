import { NextRequest } from 'next/server'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export interface AuthToken {
  userId: string
  email: string
  role: string
  exp: number
}

export async function verifyAuthToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    
    // Mock token verification - replace with actual JWT verification
    if (token === 'mock-valid-token') {
      return {
        id: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user'
      }
    }
    
    return null
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  return verifyAuthToken(request)
}

export function createMockToken(user: AuthUser): string {
  // Mock token creation - replace with actual JWT signing
  return 'mock-valid-token'
}