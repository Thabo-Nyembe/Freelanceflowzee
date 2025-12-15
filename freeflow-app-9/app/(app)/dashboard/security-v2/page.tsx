import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SecurityClient from './security-client'

export const dynamic = 'force-dynamic'

/**
 * Security V2 - Security Center & Access Control
 * Server-side rendered with real-time client updates
 */
export default async function SecurityV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let settings: any = null
  let events: any[] = []
  let sessions: any[] = []
  let stats = {
    securityScore: 0,
    totalEvents: 0,
    unresolvedEvents: 0,
    activeSessions: 0,
    blockedAttempts: 0,
    twoFactorEnabled: false,
    criticalEvents: 0
  }

  if (user) {
    // Fetch security settings
    const { data: settingsData } = await supabase
      .from('security_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Fetch security events
    const { data: eventsData } = await supabase
      .from('security_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    // Fetch active sessions
    const { data: sessionsData } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('last_active_at', { ascending: false })

    settings = settingsData
    events = eventsData || []
    sessions = sessionsData || []

    stats = {
      securityScore: settings?.security_score || 0,
      totalEvents: events.length,
      unresolvedEvents: events.filter(e => !e.is_resolved).length,
      activeSessions: sessions.length,
      blockedAttempts: events.filter(e => e.is_blocked).length,
      twoFactorEnabled: settings?.two_factor_enabled || false,
      criticalEvents: events.filter(e => e.severity === 'critical').length
    }
  }

  return (
    <SecurityClient
      initialSettings={settings}
      initialEvents={events}
      initialSessions={sessions}
      initialStats={stats}
    />
  )
}
