import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AICreateClient from './ai-create-client'

export const dynamic = 'force-dynamic'

export default async function AICreatePage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: generations } = await supabase
    .from('ai_generations')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  return <AICreateClient initialGenerations={generations || []} />
}
