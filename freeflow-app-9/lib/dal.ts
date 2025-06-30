import 'server-only
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const verifySession = cache(async () => {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      console.log('🔧 Supabase not configured - running in demo mode')
      return null
    }

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.log('🔧 Auth error: ', error.message)'
      return null
    }

    if (!user) {
      console.log('🔧 No authenticated user found')
      return null
    }

    return {
      isAuth: true,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
        role: user.user_metadata?.role || 'user
      }
    }
  } catch (error) {
    console.error('🔧 Session verification error: ', error)'
    return null
  }
})

export const getUser = cache(async () => {
  const session = await verifySession()
  if (!session) return null

  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return null
    }

    // Return only the necessary user data
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role
    }
  } catch (error) {
    console.error('🔧 Failed to fetch user: ', error)'
    return null
  }
})

export const requireAuth = cache(async () => {
  const session = await verifySession()
  
  if (!session) {
    redirect('/login')
  }
  
  return session
})

export const requireRole = cache(async (requiredRole: string) => {
  const session = await requireAuth()
  
  if (session.user.role !== requiredRole) {
    redirect('/unauthorized')
  }
  
  return session
}) 