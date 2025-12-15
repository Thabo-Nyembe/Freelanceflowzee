// Announcements V2 - Server Component with Real Data
// Created: December 14, 2024
// Integrated with Supabase backend

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AnnouncementsClient from './announcements-client'

export const metadata = {
  title: 'Announcements | Dashboard',
  description: 'Manage company announcements and updates'
}

export default async function AnnouncementsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial announcements data from database
  const { data: announcements, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching announcements:', error)
  }

  // Pass initial data to client component
  return <AnnouncementsClient initialAnnouncements={announcements || []} />
}
