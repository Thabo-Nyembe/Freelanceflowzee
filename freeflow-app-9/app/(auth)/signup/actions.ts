'use server

import { revalidatePath } from 'next/cache
import { redirect } from 'next/navigation
import { createClient } from '@/lib/supabase/server

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Check if supabase client is properly initialized
  if (!supabase) {
    console.error('Supabase client not properly initialized')
    return { error: 'Service temporarily unavailable. Please try again.' }
  }

  // Validate required fields
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long' }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Please enter a valid email address' }
  }

  try {
    // Type-casting here for convenience
    // In practice, you should validate your inputs
    const data = {
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName || 
          email_verified: false, // Track verification status
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    }

    const { error, data: authData } = await supabase.auth.signUp(data)

    if (error) {
      console.error('Signup error:', error)
      return { error: error.message || 'Failed to create account' }
    }

    // If user was created successfully, automatically sign them in
    if (authData.user && !authData.session) {
      // User was created but needs to be signed in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (signInError && signInError.code !== 'email_not_confirmed') {
        console.error('Auto sign-in error:', signInError)
        return { error: 'Account created but failed to sign in. Please try logging in manually.' }
      }
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Account created successfully! You can log in now. Email verification is optional but recommended for security.')
  } catch (error: unknown) {
    // Check if this is a Next.js redirect error and re-throw it
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Unexpected signup error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
} 