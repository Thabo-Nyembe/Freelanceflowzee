import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ThirdPartyIntegrationsClient from './third-party-integrations-client'
import { ThirdPartyIntegration, ThirdPartyIntegrationStats } from '@/lib/hooks/use-third-party-integrations'

export const dynamic = 'force-dynamic'

export default async function ThirdPartyIntegrationsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let integrations: ThirdPartyIntegration[] = []
  let stats: ThirdPartyIntegrationStats = {
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    totalApiCalls: 0,
    avgUptime: 99.9
  }

  if (user) {
    const { data } = await supabase
      .from('third_party_integrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      integrations = data as ThirdPartyIntegration[]

      stats = {
        total: integrations.length,
        active: integrations.filter(i => i.status === 'active').length,
        pending: integrations.filter(i => i.status === 'pending').length,
        inactive: integrations.filter(i => i.status === 'inactive').length,
        totalApiCalls: integrations.reduce((sum, i) => sum + (i.api_calls_count || 0), 0),
        avgUptime: integrations.length > 0
          ? integrations.reduce((sum, i) => sum + (i.uptime_percent || 99.9), 0) / integrations.length
          : 99.9
      }
    }
  }

  return <ThirdPartyIntegrationsClient initialIntegrations={integrations} initialStats={stats} />
}
