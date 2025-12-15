// Broadcasts V2 - Server Component with Real Data
// Created: December 14, 2024
// Integrated with Supabase backend

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import BroadcastsClient from './broadcasts-client'

export const metadata = {
  title: 'Broadcasts | Dashboard',
  description: 'Manage mass communication broadcasts'
}

export default async function BroadcastsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial broadcasts data from database
  const { data: broadcasts, error } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching broadcasts:', error)
  }

  // Pass initial data to client component
  return <BroadcastsClient initialBroadcasts={broadcasts || []} />
}
