import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import CustomerSupportClient from './customer-support-client'
import { SupportAgent, SupportConversation, CustomerSupportStats } from '@/lib/hooks/use-customer-support'

export const dynamic = 'force-dynamic'

export default async function CustomerSupportPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let agents: SupportAgent[] = []
  let conversations: SupportConversation[] = []
  let stats: CustomerSupportStats = {
    totalAgents: 0,
    onlineAgents: 0,
    busyAgents: 0,
    totalActiveConversations: 0,
    avgSatisfaction: 0,
    resolvedToday: 0
  }

  if (user) {
    const [agentsResult, conversationsResult] = await Promise.all([
      supabase
        .from('support_agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('support_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ])

    if (agentsResult.data) {
      agents = agentsResult.data as SupportAgent[]
    }
    if (conversationsResult.data) {
      conversations = conversationsResult.data as SupportConversation[]
    }

    const onlineAgents = agents.filter(a => a.status === 'online').length
    const busyAgents = agents.filter(a => a.status === 'busy').length
    const totalActiveConversations = agents.reduce((sum, a) => sum + (a.active_conversations || 0), 0)
    const avgSatisfaction = agents.length > 0
      ? agents.reduce((sum, a) => sum + (a.satisfaction_score || 0), 0) / agents.length
      : 0
    const resolvedToday = agents.reduce((sum, a) => sum + (a.resolved_today || 0), 0)

    stats = {
      totalAgents: agents.length,
      onlineAgents,
      busyAgents,
      totalActiveConversations,
      avgSatisfaction,
      resolvedToday
    }
  }

  return <CustomerSupportClient initialAgents={agents} initialConversations={conversations} initialStats={stats} />
}
