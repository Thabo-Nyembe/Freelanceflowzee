import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AddOnsClient from './add-ons-client'

export const dynamic = 'force-dynamic'

export default async function AddOnsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: addOns } = await supabase
    .from('add_ons')
    .select('*')
    .is('deleted_at', null)
    .order('rating', { ascending: false })
    .limit(100)

  return <AddOnsClient initialAddOns={addOns || []} />
}
