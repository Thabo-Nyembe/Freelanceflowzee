import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AuditClient from './audit-client'

export default async function AuditPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [eventsResult, checksResult] = await Promise.all([
    supabase
      .from('audit_events')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('event_timestamp', { ascending: false })
      .limit(100),
    supabase
      .from('compliance_checks')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('last_check_at', { ascending: false })
      .limit(20)
  ])

  return (
    <AuditClient
      initialEvents={eventsResult.data || []}
      initialComplianceChecks={checksResult.data || []}
    />
  )
}
