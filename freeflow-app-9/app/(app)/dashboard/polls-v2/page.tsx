// Polls V2 - Server Component with Real Data
// Created: December 14, 2024
// Integrated with Supabase backend

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PollsClient from './polls-client'

export const metadata = {
  title: 'Polls | Dashboard',
  description: 'Create and manage polls for quick feedback'
}

export default async function PollsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial polls data from database
  const { data: polls, error } = await supabase
    .from('polls')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching polls:', error)
  }

  // Pass initial data to client component
  return <PollsClient initialPolls={polls || []} />
}
