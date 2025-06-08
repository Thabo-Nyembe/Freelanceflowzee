import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard-nav'
import { Suspense } from 'react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    // If user is not authenticated, redirect to login
    if (!user) {
      redirect('/login?redirect=/dashboard')
    }
  } catch (error) {
    // If there's an error checking auth, redirect to login
    console.log('Auth check error in dashboard layout:', error)
    redirect('/login?redirect=/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading navigation...</div>}>
        <DashboardNav />
      </Suspense>
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
} 