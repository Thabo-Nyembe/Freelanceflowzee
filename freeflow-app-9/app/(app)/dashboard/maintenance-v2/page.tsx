import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import MaintenanceClient from './maintenance-client'

export const dynamic = 'force-dynamic'

/**
 * Maintenance V2 - System Maintenance Windows
 * Server-side rendered with real-time client updates
 */
export default async function MaintenanceV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let windows: any[] = []
  let stats = {
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    delayed: 0,
    avgCompletionRate: 0,
    upcomingCount: 0,
    criticalCount: 0
  }

  if (user) {
    // Fetch maintenance windows
    const { data: windowsData } = await supabase
      .from('maintenance_windows')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('start_time', { ascending: true })
      .limit(100)

    windows = windowsData || []

    if (windows.length > 0) {
      const now = new Date()
      stats = {
        total: windows.length,
        scheduled: windows.filter(w => w.status === 'scheduled').length,
        inProgress: windows.filter(w => w.status === 'in-progress').length,
        completed: windows.filter(w => w.status === 'completed').length,
        cancelled: windows.filter(w => w.status === 'cancelled').length,
        delayed: windows.filter(w => w.status === 'delayed').length,
        avgCompletionRate: windows.reduce((sum, w) => sum + (w.completion_rate || 0), 0) / windows.length,
        upcomingCount: windows.filter(w =>
          w.status === 'scheduled' && new Date(w.start_time) > now
        ).length,
        criticalCount: windows.filter(w => w.impact === 'critical').length
      }
    }
  }

  return (
    <MaintenanceClient
      initialWindows={windows}
      initialStats={stats}
    />
  )
}
