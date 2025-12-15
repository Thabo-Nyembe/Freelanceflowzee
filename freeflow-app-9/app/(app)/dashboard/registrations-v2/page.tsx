// Registrations V2 - Server Component with Real Data
// Created: December 14, 2024
// Integrated with Supabase backend

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RegistrationsClient from './registrations-client'

export const metadata = {
  title: 'Registrations | Dashboard',
  description: 'Manage event and webinar registrations'
}

export default async function RegistrationsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial registrations data from database
  const { data: registrations, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching registrations:', error)
  }

  // Pass initial data to client component
  return <RegistrationsClient initialRegistrations={registrations || []} />
}
