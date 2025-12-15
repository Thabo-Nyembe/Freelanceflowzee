// Messages V2 - Server Component with Real Data
// Created: December 14, 2024
// Integrated with Supabase backend

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MessagesClient from './messages-client'

export const metadata = {
  title: 'Messages | Dashboard',
  description: 'Communicate with your clients'
}

export default async function MessagesPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial messages data from database
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching messages:', error)
  }

  // Pass initial data to client component
  return <MessagesClient initialMessages={messages || []} />
}
