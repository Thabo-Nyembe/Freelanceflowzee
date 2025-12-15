// Webinars V2 - Server Component with Real Data
// Created: December 14, 2024
// Integrated with Supabase backend

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import WebinarsClient from './webinars-client'

export const metadata = {
  title: 'Webinars | Dashboard',
  description: 'Manage your webinars and virtual training sessions'
}

export default async function WebinarsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial webinars data from database
  const { data: webinars, error } = await supabase
    .from('webinars')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('scheduled_date', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching webinars:', error)
  }

  // Pass initial data to client component
  return <WebinarsClient initialWebinars={webinars || []} />
}
