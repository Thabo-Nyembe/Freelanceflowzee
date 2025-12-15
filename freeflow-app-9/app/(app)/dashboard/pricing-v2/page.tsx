import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import PricingClient from './pricing-client'

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let plans: any[] = []
  let stats = {
    total: 0,
    active: 0,
    featured: 0,
    totalSubscribers: 0,
    totalRevenueMonthly: 0,
    totalRevenueAnnual: 0,
    avgChurnRate: 0,
    avgUpgradeRate: 0,
    arpu: 0
  }

  if (user) {
    const { data: plansData } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (plansData) {
      plans = plansData

      const totalSubs = plansData.reduce((sum, p) => sum + (p.subscribers_count || 0), 0)
      const totalRevMonthly = plansData.reduce((sum, p) => sum + (p.revenue_monthly || 0), 0)
      const totalRevAnnual = plansData.reduce((sum, p) => sum + (p.revenue_annual || 0), 0)
      const totalChurn = plansData.reduce((sum, p) => sum + (p.churn_rate || 0), 0)
      const totalUpgrade = plansData.reduce((sum, p) => sum + (p.upgrade_rate || 0), 0)

      stats = {
        total: plansData.length,
        active: plansData.filter(p => p.is_active).length,
        featured: plansData.filter(p => p.is_featured).length,
        totalSubscribers: totalSubs,
        totalRevenueMonthly: totalRevMonthly,
        totalRevenueAnnual: totalRevAnnual,
        avgChurnRate: plansData.length > 0 ? totalChurn / plansData.length : 0,
        avgUpgradeRate: plansData.length > 0 ? totalUpgrade / plansData.length : 0,
        arpu: totalSubs > 0 ? totalRevMonthly / totalSubs : 0
      }
    }
  }

  return <PricingClient initialPlans={plans} initialStats={stats} />
}
