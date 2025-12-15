import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import WarehouseClient from './warehouse-client'

export const dynamic = 'force-dynamic'

export default async function WarehousePage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch warehouses data
  const { data: warehouses } = await supabase
    .from('warehouses')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  return <WarehouseClient initialWarehouses={warehouses || []} />
}
