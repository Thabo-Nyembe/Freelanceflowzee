'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  try {
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

    // Type-casting here for convenience
    // In practice, you should validate your inputs
    const data = {
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
      console.error('Signup error:', error)
      return { error: error.message || 'Failed to create account' }
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Account created successfully! Please check your email to confirm your account.')
  } catch (error) {
    console.error('Unexpected signup error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
} 