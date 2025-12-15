import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MarketplaceClient from './marketplace-client'

export default async function MarketplacePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [appsResult, featuredResult] = await Promise.all([
    supabase
      .from('marketplace_apps')
      .select('*')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('total_downloads', { ascending: false })
      .limit(50),
    supabase
      .from('marketplace_apps')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('average_rating', { ascending: false })
      .limit(10)
  ])

  return (
    <MarketplaceClient
      initialApps={appsResult.data || []}
      initialFeaturedApps={featuredResult.data || []}
    />
  )
}
