import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import StockClient from './stock-client'

export const dynamic = 'force-dynamic'

export default async function StockPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch stock movements data
  const { data: movements } = await supabase
    .from('stock_movements')
    .select('*')
    .eq('user_id', user.id)
    .order('movement_date', { ascending: false })
    .limit(50)

  return <StockClient initialMovements={movements || []} />
}
