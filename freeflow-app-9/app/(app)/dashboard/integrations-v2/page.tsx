import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import IntegrationsClient from './integrations-client'

export const dynamic = 'force-dynamic'

export default async function IntegrationsV2Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let integrations: any[] = []
  let stats = {
    total: 0,
    connected: 0,
    disconnected: 0,
    totalApiCalls: 0,
    totalDataSynced: 0
  }

  if (user) {
    // Fetch integrations
    const { data: integrationsData } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (integrationsData) {
      integrations = integrationsData

      // Calculate stats
      stats = {
        total: integrationsData.length,
        connected: integrationsData.filter(i => i.is_connected).length,
        disconnected: integrationsData.filter(i => !i.is_connected).length,
        totalApiCalls: integrationsData.reduce((sum, i) => sum + (i.api_calls_count || 0), 0),
        totalDataSynced: integrationsData.reduce((sum, i) => sum + (i.data_synced_count || 0), 0)
      }
    }
  }

  return <IntegrationsClient initialIntegrations={integrations} initialStats={stats} />
}
