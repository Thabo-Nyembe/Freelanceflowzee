// Events V2 - Server Component with Real Data
// Created: December 14, 2024
// Integrated with Supabase backend

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import EventsClient from './events-client'

export const metadata = {
  title: 'Events | Dashboard',
  description: 'Manage your events and conferences'
}

export default async function EventsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial events data from database
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('start_date', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching events:', error)
  }

  // Pass initial data to client component
  return <EventsClient initialEvents={events || []} />
}
