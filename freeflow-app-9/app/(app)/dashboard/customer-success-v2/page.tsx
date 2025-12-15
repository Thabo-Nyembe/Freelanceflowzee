import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CustomerSuccessClient from './customer-success-client'

export default async function CustomerSuccessPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: customers, error } = await supabase
    .from('customer_success')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('health_score', { ascending: false })
    .limit(50)

  return <CustomerSuccessClient initialCustomers={customers || []} />
}
