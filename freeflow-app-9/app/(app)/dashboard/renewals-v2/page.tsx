import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RenewalsClient from './renewals-client'

export const dynamic = 'force-dynamic'

export default async function RenewalsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: renewals } = await supabase
    .from('renewals')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('renewal_date', { ascending: true })
    .limit(100)

  return <RenewalsClient initialRenewals={renewals || []} />
}
