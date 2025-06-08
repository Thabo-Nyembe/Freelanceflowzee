import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LandingPage from './landing'

export default async function HomePage() {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    // If user is authenticated, redirect to dashboard
    if (user) {
      redirect('/dashboard')
    }
  } catch (error) {
    // If there's an error checking auth, continue to landing page
    console.log('Auth check error, showing landing page:', error)
  }
  
  // If user is not authenticated, show landing page
  return <LandingPage />
} 