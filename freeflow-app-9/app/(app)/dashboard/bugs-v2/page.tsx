import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import BugsClient from './bugs-client'

export const dynamic = 'force-dynamic'

export default async function BugsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch bugs data
  const { data: bugs } = await supabase
    .from('bugs')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_date', { ascending: false })
    .limit(50)

  return <BugsClient initialBugs={bugs || []} />
}
