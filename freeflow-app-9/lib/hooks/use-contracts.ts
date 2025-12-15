// Hook for Contracts management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type ContractType = 'service' | 'product' | 'employment' | 'nda' | 'partnership' | 'license' | 'lease' | 'custom'
export type ContractStatus = 'draft' | 'pending-review' | 'pending-signature' | 'active' | 'completed' | 'cancelled' | 'expired' | 'terminated' | 'renewed'

export interface Contract {
  id: string
  user_id: string
  organization_id: string | null
  client_id: string | null
  project_id: string | null
  contract_number: string
  title: string
  description: string | null
  contract_type: ContractType
  status: ContractStatus
  contract_value: number
  payment_schedule: string | null
  currency: string
  start_date: string
  end_date: string | null
  signed_date: string | null
  effective_date: string | null
  termination_date: string | null
  renewal_date: string | null
  party_a_name: string | null
  party_a_email: string | null
  party_a_address: string | null
  party_a_signature: string | null
  party_a_signed_at: string | null
  party_b_name: string | null
  party_b_email: string | null
  party_b_address: string | null
  party_b_signature: string | null
  party_b_signed_at: string | null
  terms: string
  clauses: any
  deliverables: any
  milestones: any
  is_auto_renewable: boolean
  renewal_notice_period_days: number
  termination_notice_period_days: number
  termination_clause: string | null
  is_template: boolean
  template_id: string | null
  version: number
  parent_contract_id: string | null
  attachments: any
  has_attachments: boolean
  document_url: string | null
  requires_legal_review: boolean
  legal_review_status: string | null
  legal_reviewer_id: string | null
  legal_review_date: string | null
  notes: string | null
  internal_notes: string | null
  metadata: any
  tags: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseContractsOptions {
  status?: ContractStatus | 'all'
  contractType?: ContractType | 'all'
  limit?: number
}

export function useContracts(options: UseContractsOptions = {}) {
  const { status, contractType, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (contractType && contractType !== 'all') filters.contract_type = contractType

  const queryOptions: any = {
    table: 'contracts',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Contract>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'contracts',
    onSuccess: refetch
  })

  return {
    contracts: data,
    loading,
    error,
    mutating,
    createContract: create,
    updateContract: update,
    deleteContract: remove,
    refetch
  }
}
