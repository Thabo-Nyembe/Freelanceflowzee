import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SecurityAuditClient from './security-audit-client'

export const dynamic = 'force-dynamic'

/**
 * Security Audit V2 - Compliance Audits & Security Assessments
 * Server-side rendered with real-time client updates
 */
export default async function SecurityAuditV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let audits: any[] = []
  let stats = {
    total: 0,
    scheduled: 0,
    inProgress: 0,
    passed: 0,
    failed: 0,
    warning: 0,
    totalFindings: 0,
    avgScore: 0,
    remediationRate: 0
  }

  if (user) {
    // Fetch security audits
    const { data: auditsData } = await supabase
      .from('security_audits')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    audits = auditsData || []

    if (audits.length > 0) {
      const withScores = audits.filter(a => a.security_score !== null && a.security_score > 0)
      const totalFindings = audits.reduce((sum, a) =>
        sum + (a.findings_critical || 0) + (a.findings_high || 0) + (a.findings_medium || 0) + (a.findings_low || 0), 0
      )
      const totalRemediated = audits.reduce((sum, a) => sum + (a.remediated_count || 0), 0)
      const totalRecommendations = audits.reduce((sum, a) => sum + (a.total_recommendations || 0), 0)

      stats = {
        total: audits.length,
        scheduled: audits.filter(a => a.status === 'scheduled').length,
        inProgress: audits.filter(a => a.status === 'in-progress').length,
        passed: audits.filter(a => a.status === 'passed').length,
        failed: audits.filter(a => a.status === 'failed').length,
        warning: audits.filter(a => a.status === 'warning').length,
        totalFindings,
        avgScore: withScores.length > 0
          ? withScores.reduce((sum, a) => sum + (a.security_score || 0), 0) / withScores.length
          : 0,
        remediationRate: totalRecommendations > 0
          ? (totalRemediated / totalRecommendations) * 100
          : 0
      }
    }
  }

  return (
    <SecurityAuditClient
      initialAudits={audits}
      initialStats={stats}
    />
  )
}
