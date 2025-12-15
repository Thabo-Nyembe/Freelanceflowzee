import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AuditLogsClient from './audit-logs-client'

export default async function AuditLogsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [logsResult, rulesResult] = await Promise.all([
    supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('audit_alert_rules')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('rule_name', { ascending: true })
      .limit(20)
  ])

  return (
    <AuditLogsClient
      initialLogs={logsResult.data || []}
      initialRules={rulesResult.data || []}
    />
  )
}
