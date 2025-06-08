import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard-nav'
import { Suspense } from 'react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check for demo mode or if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const isSupabaseConfigured = supabaseUrl && 
                              supabaseAnonKey && 
                              !supabaseUrl.includes('placeholder') &&
                              !supabaseUrl.includes('your-project-url')

  // If Supabase is not configured, allow dashboard access in demo mode
  if (!isSupabaseConfigured) {
    console.log('🔧 Dashboard running in demo mode - Supabase not configured')
    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<div className="p-4">Loading navigation...</div>}>
          <DashboardNav />
        </Suspense>
        <main className="lg:pl-64">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                🔧 <strong>Demo Mode:</strong> Dashboard is running in demo mode. 
                Configure Supabase environment variables for full authentication.
              </p>
            </div>
            {children}
          </div>
        </main>
      </div>
    )
  }

  // Supabase is configured - check authentication
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // If there's an error or no user, redirect to login
    if (error || !user) {
      console.log('Dashboard: No authenticated user, redirecting to login')
      redirect('/login?redirect=/dashboard')
    }

    // User is authenticated, render dashboard
    console.log('✅ Dashboard: Authenticated user verified')
    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<div className="p-4">Loading navigation...</div>}>
          <DashboardNav />
        </Suspense>
        <main className="lg:pl-64">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    )
    
  } catch (error) {
    // If there's an error checking auth, redirect to login
    console.log('Dashboard layout auth error:', error)
    redirect('/login?redirect=/dashboard')
  }
} 