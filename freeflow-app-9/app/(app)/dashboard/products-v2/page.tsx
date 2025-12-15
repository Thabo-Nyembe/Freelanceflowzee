import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProductsClient from './products-client'

export default async function ProductsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [productsResult] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('total_revenue', { ascending: false })
      .limit(50)
  ])

  return (
    <ProductsClient
      initialProducts={productsResult.data || []}
    />
  )
}
