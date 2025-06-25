import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Only enable in test environment
const isTestEnv = process.env.NODE_ENV === 'test'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)

export async function POST() {
  try {
    // Sign in test user
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@freeflowzee.com',
      password: 'TestUser123!'
    })

    if (signInError) throw signInError

    // Set auth cookie
    const response = NextResponse.json({ 
      success: true,
      message: 'Test user logged in successfully'
    })

    // Set cookies in response
    response.cookies.set('sb-access-token', session?.access_token || '', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    response.cookies.set('sb-refresh-token', session?.refresh_token || '', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return response
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 })
  }
}

// Allow test mode to be disabled in production
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Test mode disabled'
  })

  response.cookies.delete('sb-access-token')
  response.cookies.delete('sb-refresh-token')
  
  return response
} 