import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CustomersClient from './customers-client'

export default async function CustomersPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('lifetime_value', { ascending: false })
    .limit(50)

  return <CustomersClient initialCustomers={customers || []} />
}
