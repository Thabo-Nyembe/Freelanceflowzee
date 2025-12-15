import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import GrowthHubClient from './growth-hub-client'

export const dynamic = 'force-dynamic'

export default async function GrowthHubPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let metrics: any[] = []
  let stats = {
    total: 0,
    revenue: 0,
    users: 0,
    conversion: 0,
    goals: 0,
    avgGrowthRate: 0,
    totalCurrentValue: 0,
    totalTargetValue: 0
  }

  if (user) {
    const { data: metricsData } = await supabase
      .from('growth_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (metricsData) {
      metrics = metricsData

      const totalGrowth = metricsData.reduce((sum, m) => sum + (m.growth_rate || 0), 0)

      stats = {
        total: metricsData.length,
        revenue: metricsData.filter(m => m.metric_type === 'revenue').length,
        users: metricsData.filter(m => m.metric_type === 'users').length,
        conversion: metricsData.filter(m => m.metric_type === 'conversion').length,
        goals: metricsData.filter(m => m.is_goal).length,
        avgGrowthRate: metricsData.length > 0 ? totalGrowth / metricsData.length : 0,
        totalCurrentValue: metricsData.reduce((sum, m) => sum + (m.current_value || 0), 0),
        totalTargetValue: metricsData.reduce((sum, m) => sum + (m.target_value || 0), 0)
      }
    }
  }

  return <GrowthHubClient initialMetrics={metrics} initialStats={stats} />
}
