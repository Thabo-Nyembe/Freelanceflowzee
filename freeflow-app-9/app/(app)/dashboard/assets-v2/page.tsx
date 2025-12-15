import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AssetsClient from './assets-client'

export default async function AssetsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [assetsResult, collectionsResult] = await Promise.all([
    supabase
      .from('digital_assets')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('asset_collections')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .limit(20)
  ])

  return (
    <AssetsClient
      initialAssets={assetsResult.data || []}
      initialCollections={collectionsResult.data || []}
    />
  )
}
