import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MessagingClient from './messaging-client'

export default async function MessagingPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [conversationsResult, messagesResult] = await Promise.all([
    supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(50),
    supabase
      .from('direct_messages')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('sent_at', { ascending: false })
      .limit(100)
  ])

  return (
    <MessagingClient
      initialConversations={conversationsResult.data || []}
      initialMessages={messagesResult.data || []}
    />
  )
}
