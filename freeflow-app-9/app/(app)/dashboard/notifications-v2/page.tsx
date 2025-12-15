// Notifications V2 - Server Component with Real Data
// Created: December 14, 2024
// Integrated with Supabase backend

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import NotificationsClient from './notifications-client'

export const metadata = {
  title: 'Notifications | Dashboard',
  description: 'Manage your system notifications and alerts'
}

export default async function NotificationsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial notifications data from database
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching notifications:', error)
  }

  // Pass initial data to client component
  return <NotificationsClient initialNotifications={notifications || []} />
}
