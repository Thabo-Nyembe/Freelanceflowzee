import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AllocationClient from './allocation-client'

export const dynamic = 'force-dynamic'

export default async function AllocationPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch allocations from database
  const { data: allocations } = await supabase
    .from('allocations')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('start_date', { ascending: false })
    .limit(200)

  return (
    <AllocationClient
      initialAllocations={allocations || []}
    />
  )
}
