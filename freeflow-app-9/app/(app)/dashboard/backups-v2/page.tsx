import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import BackupsClient from './backups-client'

export const dynamic = 'force-dynamic'

/**
 * Backups V2 - Backup Management & Recovery
 * Server-side rendered with real-time client updates
 */
export default async function BackupsV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let backups: any[] = []
  let stats = {
    total: 0,
    scheduled: 0,
    completed: 0,
    failed: 0,
    inProgress: 0,
    totalSizeBytes: 0,
    avgSuccessRate: 100,
    avgDuration: 0
  }

  if (user) {
    // Fetch backups
    const { data: backupsData } = await supabase
      .from('backups')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    backups = backupsData || []

    if (backups.length > 0) {
      stats = {
        total: backups.length,
        scheduled: backups.filter(b => b.status === 'scheduled').length,
        completed: backups.filter(b => b.status === 'completed').length,
        failed: backups.filter(b => b.status === 'failed').length,
        inProgress: backups.filter(b => b.status === 'in-progress').length,
        totalSizeBytes: backups.reduce((sum, b) => sum + (b.size_bytes || 0), 0),
        avgSuccessRate: backups.reduce((sum, b) => sum + (b.success_rate || 100), 0) / backups.length,
        avgDuration: backups.reduce((sum, b) => sum + (b.duration_seconds || 0), 0) / backups.length
      }
    }
  }

  return (
    <BackupsClient
      initialBackups={backups}
      initialStats={stats}
    />
  )
}
