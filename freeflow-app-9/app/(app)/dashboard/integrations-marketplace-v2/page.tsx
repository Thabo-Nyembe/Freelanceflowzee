import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import IntegrationsMarketplaceClient from './integrations-marketplace-client'
import { MarketplaceIntegration, MarketplaceStats } from '@/lib/hooks/use-marketplace-integrations'

export const dynamic = 'force-dynamic'

export default async function IntegrationsMarketplacePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let integrations: MarketplaceIntegration[] = []
  let stats: MarketplaceStats = {
    total: 0,
    connected: 0,
    available: 0,
    totalUsers: 0,
    avgRating: 0
  }

  if (user) {
    const { data } = await supabase
      .from('marketplace_integrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      integrations = data as MarketplaceIntegration[]

      stats = {
        total: integrations.length,
        connected: integrations.filter(i => i.status === 'connected').length,
        available: integrations.filter(i => i.status === 'available').length,
        totalUsers: integrations.reduce((sum, i) => sum + (i.users_count || 0), 0),
        avgRating: integrations.length > 0
          ? integrations.reduce((sum, i) => sum + (i.rating || 0), 0) / integrations.length
          : 0
      }
    }
  }

  return <IntegrationsMarketplaceClient initialIntegrations={integrations} initialStats={stats} />
}
