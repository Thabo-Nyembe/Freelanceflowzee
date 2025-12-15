import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import InvestorMetricsClient from './investor-metrics-client'

export const dynamic = 'force-dynamic'

export default async function InvestorMetricsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let metrics: any[] = []
  let stats = {
    total: 0,
    revenue: 0,
    growth: 0,
    efficiency: 0,
    engagement: 0,
    avgChangePercent: 0,
    totalCurrentValue: 0
  }

  if (user) {
    const { data: metricsData } = await supabase
      .from('investor_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (metricsData) {
      metrics = metricsData

      const totalChange = metricsData.reduce((sum, m) => sum + (m.change_percent || 0), 0)

      stats = {
        total: metricsData.length,
        revenue: metricsData.filter(m => m.category === 'revenue').length,
        growth: metricsData.filter(m => m.category === 'growth').length,
        efficiency: metricsData.filter(m => m.category === 'efficiency').length,
        engagement: metricsData.filter(m => m.category === 'engagement').length,
        avgChangePercent: metricsData.length > 0 ? totalChange / metricsData.length : 0,
        totalCurrentValue: metricsData.reduce((sum, m) => sum + (m.current_value || 0), 0)
      }
    }
  }

  return <InvestorMetricsClient initialMetrics={metrics} initialStats={stats} />
}
