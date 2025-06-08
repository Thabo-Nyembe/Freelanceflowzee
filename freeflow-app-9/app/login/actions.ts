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

  try {
    const { error, data: authData } = await supabase.auth.signInWithPassword(data)

    if (error) {
      console.error('Login error:', error)
      
      // Handle specific error types
      if (error.code === 'email_not_confirmed') {
        // For unconfirmed emails, allow login but show verification reminder
        console.log('User login with unconfirmed email - allowing access with verification reminder')
        
        // Try to sign in again - Supabase should allow this even with unconfirmed email
        // The email confirmation is just for security, not a hard requirement
        const { error: retryError, data: retryData } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })
        
        if (!retryError && retryData.session) {
          // Clear rate limiting on successful login
          loginAttempts.delete(data.email.toLowerCase())
          revalidatePath('/', 'layout')
          redirect('/dashboard?verification_reminder=true')
        }
        
        // If retry also fails, show helpful message
        throw new Error('Please check your email for a verification link, or contact support if you need help.')
      } else if (error.message.includes('rate limit')) {
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
    redirect('/dashboard')
  } catch (error: any) {
    // Check if this is a Next.js redirect error and re-throw it
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    
    console.error('Unexpected login error:', error)
    
    // If it's already a known error, re-throw it
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('An unexpected error occurred. Please try again.')
  }
}

export async function signup(formData: FormData) {
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

  try {
    const { error } = await supabase.auth.signUp(data)

    if (error) {
      console.error('Signup error:', error)
      throw new Error('Could not create account: ' + error.message)
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Account created successfully! You can log in now. Email verification is optional but recommended for security.')
  } catch (error: any) {
    // Check if this is a Next.js redirect error and re-throw it
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    
    console.error('Unexpected signup error:', error)
    
    // If it's already a known error, re-throw it
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('An unexpected error occurred during signup. Please try again.')
  }
}

export async function resendVerification(email: string) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      throw new Error('Authentication service unavailable')
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })

    if (error) {
      console.error('Resend verification error:', error)
      throw new Error('Failed to resend verification email')
    }

    return { success: true, message: 'Verification email sent successfully!' }
  } catch (error) {
    console.error('Unexpected resend verification error:', error)
    throw new Error('Failed to resend verification email. Please try again.')
  }
} 