import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import OrdersClient from './orders-client'

export default async function OrdersPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [ordersResult] = await Promise.all([
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50)
  ])

  return (
    <OrdersClient
      initialOrders={ordersResult.data || []}
    />
  )
}
