import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AIAssistantClient from './ai-assistant-client'

export const dynamic = 'force-dynamic'

export default async function AIAssistantPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: conversations } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(50)

  return <AIAssistantClient initialConversations={conversations || []} />
}
