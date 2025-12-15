import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ReportsClient from './reports-client'

export const dynamic = 'force-dynamic'

export default async function ReportsV2Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let reports: any[] = []
  let stats = {
    total: 0,
    draft: 0,
    ready: 0,
    scheduled: 0,
    archived: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0
  }

  if (user) {
    // Fetch reports
    const { data: reportsData } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    reports = reportsData || []

    // Fetch revenue entries for stats
    const { data: revenueData } = await supabase
      .from('revenue_entries')
      .select('amount, type')
      .eq('user_id', user.id)

    const revenue = revenueData || []
    const income = revenue.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
    const expenses = revenue.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
    const refunds = revenue.filter(r => r.type === 'refund').reduce((sum, r) => sum + r.amount, 0)

    stats = {
      total: reports.length,
      draft: reports.filter(r => r.status === 'draft').length,
      ready: reports.filter(r => r.status === 'ready').length,
      scheduled: reports.filter(r => r.status === 'scheduled').length,
      archived: reports.filter(r => r.status === 'archived').length,
      totalRevenue: income,
      totalExpenses: expenses + refunds,
      netIncome: income - expenses - refunds
    }
  }

  return <ReportsClient initialReports={reports} initialStats={stats} />
}
