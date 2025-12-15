import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ReportingClient from './reporting-client'

export const dynamic = 'force-dynamic'

export default async function ReportingPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let reports: any[] = []
  let stats = {
    total: 0,
    ready: 0,
    generating: 0,
    scheduled: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalShares: 0,
    avgGenerationTime: 2.4
  }

  if (user) {
    const { data: reportsData } = await supabase
      .from('business_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (reportsData) {
      reports = reportsData

      stats = {
        total: reportsData.length,
        ready: reportsData.filter(r => r.status === 'ready').length,
        generating: reportsData.filter(r => r.status === 'generating').length,
        scheduled: reportsData.filter(r => r.schedule !== 'on-demand').length,
        totalViews: reportsData.reduce((sum, r) => sum + (r.views_count || 0), 0),
        totalDownloads: reportsData.reduce((sum, r) => sum + (r.downloads_count || 0), 0),
        totalShares: reportsData.reduce((sum, r) => sum + (r.shares_count || 0), 0),
        avgGenerationTime: 2.4
      }
    }
  }

  return <ReportingClient initialReports={reports} initialStats={stats} />
}
