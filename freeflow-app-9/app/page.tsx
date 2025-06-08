import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LandingPage from './landing'
import { Suspense } from 'react'

export default async function HomePage() {
  // Check for demo mode or if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const isSupabaseConfigured = supabaseUrl && 
                              supabaseAnonKey && 
                              !supabaseUrl.includes('placeholder') &&
                              !supabaseUrl.includes('your-project-url')

  // If Supabase is not configured, show landing page with demo capabilities
  if (!isSupabaseConfigured) {
    console.log('🔧 Supabase not configured - running in demo mode')
    return (
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>}>
        <LandingPage />
      </Suspense>
    )
  }

  // Supabase is configured - check authentication
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // If there's an error or no user, show landing page
    if (error || !user) {
      console.log('No authenticated user, showing landing page')
      return (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>}>
          <LandingPage />
        </Suspense>
      )
    }
    
    // User is authenticated, redirect to dashboard
    console.log('✅ Authenticated user detected, redirecting to dashboard')
    redirect('/dashboard')
    
  } catch (error) {
    // If there's an error checking auth, show landing page
    console.log('Auth check error, showing landing page:', error)
    return (
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>}>
        <LandingPage />
      </Suspense>
    )
  }
} 