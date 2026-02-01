'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { createRenewal, updateRenewal, markRenewalAtRisk, winRenewal, loseRenewal, deleteRenewal } from '@/app/actions/renewals'

export interface Renewal {
  id: string
  user_id: string
  renewal_code: string
  customer_name: string
  customer_id: string | null
  status: string
  renewal_type: string
  priority: string
  current_arr: number
  proposed_arr: number
  expansion_value: number
  currency: string
  renewal_date: string | null
  days_to_renewal: number
  contract_term: number
  probability: number
  health_score: number
  csm_name: string | null
  csm_email: string | null
  last_contact_date: string | null
  meetings_scheduled: number
  proposal_sent: boolean
  proposal_sent_date: string | null
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface RenewalFilters {
  status?: string
  priority?: string
}

export function useRenewals(initialRenewals: Renewal[] = [], filters: RenewalFilters = {}) {
  const { data: renewals, isLoading, error, refetch } = useSupabaseQuery<Renewal>(
    'renewals',
    {
      filters: {
        ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {}),
        ...(filters.priority && filters.priority !== 'all' ? { priority: filters.priority } : {})
      },
      orderBy: { column: 'renewal_date', ascending: true }
    },
    initialRenewals
  )

  const stats = {
    total: renewals.length,
    upcoming: renewals.filter(r => r.status === 'upcoming').length,
    inNegotiation: renewals.filter(r => r.status === 'in-negotiation').length,
    renewed: renewals.filter(r => r.status === 'renewed').length,
    atRisk: renewals.filter(r => r.status === 'at-risk').length,
    churned: renewals.filter(r => r.status === 'churned').length,
    totalCurrentARR: renewals.reduce((sum, r) => sum + Number(r.current_arr), 0),
    totalProposedARR: renewals.reduce((sum, r) => sum + Number(r.proposed_arr), 0),
    totalExpansion: renewals.filter(r => r.expansion_value > 0).reduce((sum, r) => sum + Number(r.expansion_value), 0),
    avgProbability: renewals.length > 0
      ? renewals.reduce((sum, r) => sum + r.probability, 0) / renewals.length
      : 0,
    avgHealthScore: renewals.length > 0
      ? renewals.reduce((sum, r) => sum + r.health_score, 0) / renewals.length
      : 0
  }

  return { renewals, stats, isLoading, error, refetch }
}

export function useRenewalMutations() {
  const createMutation = useSupabaseMutation(createRenewal)
  const updateMutation = useSupabaseMutation(updateRenewal)
  const atRiskMutation = useSupabaseMutation(markRenewalAtRisk)
  const winMutation = useSupabaseMutation(winRenewal)
  const loseMutation = useSupabaseMutation(loseRenewal)
  const deleteMutation = useSupabaseMutation(deleteRenewal)

  return {
    createRenewal: createMutation.mutate,
    updateRenewal: (id: string, data: Parameters<typeof updateRenewal>[1]) =>
      updateMutation.mutate({ id, ...data }),
    markRenewalAtRisk: atRiskMutation.mutate,
    winRenewal: winMutation.mutate,
    loseRenewal: loseMutation.mutate,
    deleteRenewal: deleteMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading
  }
}

export function getRenewalStatusColor(status: string): string {
  switch (status) {
    case 'upcoming': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'in-negotiation': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    case 'renewed': return 'bg-green-500/10 text-green-500 border-green-500/20'
    case 'churned': return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'at-risk': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}

export function getRenewalTypeColor(type: string): string {
  switch (type) {
    case 'expansion': return 'bg-green-500/10 text-green-500 border-green-500/20'
    case 'flat': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'contraction': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    case 'downgrade': return 'bg-red-500/10 text-red-500 border-red-500/20'
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}

export function getRenewalPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
