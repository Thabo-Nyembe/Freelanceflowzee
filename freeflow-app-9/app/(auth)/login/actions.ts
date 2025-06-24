'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const attempts = new Map()
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

function isLockedOut(email: string): boolean {
  const now = Date.now()
  const attempt = attempts.get(email)
  
  if (!attempt) {
    attempts.set(email, { count: 0, lastAttempt: now })
    return false
  }

  if (attempt.count >= MAX_ATTEMPTS) {
    const timeSinceLastAttempt = now - attempt.lastAttempt
    if (timeSinceLastAttempt < LOCKOUT_TIME) {
      return true
    }
    attempt.count = 0
  }

  attempt.lastAttempt = now
  return false
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string || '/dashboard'

  if (isLockedOut(email)) {
    return { error: 'Too many login attempts. Please try again later.' }
  }

  const supabase = createServerComponentClient({ cookies })

  try {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      const attempt = attempts.get(email)
      if (attempt) {
        attempt.count++
      } else {
        attempts.set(email, { count: 1, lastAttempt: Date.now() })
      }
      return { error: signInError.message }
    }

    if (data?.session) {
      // Successful login, redirect to the intended destination
      redirect(redirectTo)
    }

    return { error: 'Login failed. Please try again.' }
  } catch (error: any) {
    console.error('Login error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const supabase = createServerComponentClient({ cookies })

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  return { success: true }
}

export async function resendVerification(email: string) {
  const supabase = createServerComponentClient({ cookies })

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
} 