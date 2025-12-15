import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import LeadGenerationClient from './lead-generation-client'

export const dynamic = 'force-dynamic'

export default async function LeadGenerationPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let leads: any[] = []
  let stats = {
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    conversionRate: 0,
    avgScore: 0,
    pipelineValue: 0
  }

  if (user) {
    const { data: leadsData } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (leadsData) {
      leads = leadsData

      const converted = leadsData.filter(l => l.status === 'converted').length
      const totalScores = leadsData.reduce((sum, l) => sum + (l.score || 0), 0)

      stats = {
        total: leadsData.length,
        new: leadsData.filter(l => l.status === 'new').length,
        contacted: leadsData.filter(l => l.status === 'contacted').length,
        qualified: leadsData.filter(l => l.status === 'qualified').length,
        converted,
        conversionRate: leadsData.length > 0 ? (converted / leadsData.length) * 100 : 0,
        avgScore: leadsData.length > 0 ? totalScores / leadsData.length : 0,
        pipelineValue: leadsData.reduce((sum, l) => sum + (l.value_estimate || 0), 0)
      }
    }
  }

  return <LeadGenerationClient initialLeads={leads} initialStats={stats} />
}
