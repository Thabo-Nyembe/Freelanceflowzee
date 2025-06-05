'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Rate limiting helper
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const key = email.toLowerCase()
  const attempt = loginAttempts.get(key)

  if (!attempt) {
    loginAttempts.set(key, { count: 1, lastAttempt: now })
    return true
  }

  // Reset after 15 minutes
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(key, { count: 1, lastAttempt: now })
    return true
  }

  // Allow 5 attempts per 15 minutes
  if (attempt.count >= 5) {
    return false
  }

  attempt.count++
  attempt.lastAttempt = now
  return true
}

export async function login(formData: FormData) {
  try {
    const supabase = await createClient()
    
    // Validate client creation
    if (!supabase) {
      throw new Error('Authentication service unavailable')
    }

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    // Basic validation
    if (!data.email || !data.password) {
      throw new Error('Email and password are required')
    }

    // Check rate limiting
    if (!checkRateLimit(data.email)) {
      throw new Error('Too many login attempts. Please try again in 15 minutes.')
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      console.error('Login error:', error)
      
      // Handle specific error types
      if (error.message.includes('rate limit')) {
        throw new Error('Too many requests. Please try again later.')
      } else if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password')
      } else {
        throw new Error('Login failed. Please check your credentials and try again.')
      }
    }

    // Clear rate limiting on successful login
    loginAttempts.delete(data.email.toLowerCase())

    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error) {
    console.error('Unexpected login error:', error)
    
    // If it's already a known error, re-throw it
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('An unexpected error occurred. Please try again.')
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient()
    
    // Validate client creation
    if (!supabase) {
      throw new Error('Authentication service unavailable')
    }

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    // Basic validation
    if (!data.email || !data.password) {
      throw new Error('Email and password are required')
    }

    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
      console.error('Signup error:', error)
      throw new Error('Could not create account: ' + error.message)
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check your email for verification link')
  } catch (error) {
    console.error('Unexpected signup error:', error)
    
    // If it's already a known error, re-throw it
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('An unexpected error occurred during signup. Please try again.')
  }
} 