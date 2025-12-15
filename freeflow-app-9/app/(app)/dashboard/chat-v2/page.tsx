// Chat V2 - Server Component with Real Data
// Created: December 14, 2024
// Integrated with Supabase backend

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ChatClient from './chat-client'

export const metadata = {
  title: 'Chat | Dashboard',
  description: 'Real-time team chat and collaboration'
}

export default async function ChatPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial chat messages from database
  const { data: chatMessages, error } = await supabase
    .from('chat')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching chat messages:', error)
  }

  // Pass initial data to client component
  return <ChatClient initialChatMessages={chatMessages || []} />
}
