'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export type ContactType = 'lead' | 'prospect' | 'customer' | 'partner' | 'vendor' | 'competitor' | 'other'
export type ContactStatus = 'active' | 'inactive' | 'vip' | 'churned' | 'new' | 'qualified' | 'unqualified' | 'blocked'
export type LeadSource = 'website' | 'referral' | 'social_media' | 'email' | 'phone' | 'event' | 'partner' | 'advertisement' | 'organic' | 'other'
export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1001-5000' | '5001+' | 'unknown'
export type ContactMethod = 'email' | 'phone' | 'sms' | 'chat' | 'social_media' | 'none'
export type QualificationStatus = 'qualified' | 'unqualified' | 'pending' | 'nurturing' | 'disqualified'

export interface CrmContact {
  id: string
  user_id: string
  contact_name: string
  email?: string
  phone?: string

  // Company
  company_name?: string
  company_website?: string
  company_size?: CompanySize
  industry?: string

  // Contact details
  job_title?: string
  department?: string
  location?: string
  timezone?: string

  // Classification
  contact_type: ContactType
  status: ContactStatus
  lead_source?: LeadSource

  // Deal pipeline
  deal_stage?: DealStage
  deal_value: number
  expected_close_date?: string
  probability_percentage: number
  pipeline_name?: string

  // Financial
  lifetime_value: number
  total_purchases: number
  avg_purchase_value: number
  purchase_count: number
  outstanding_balance: number
  credit_limit?: number

  // Engagement
  last_contact_date?: string
  last_contact_type?: string
  next_followup_date?: string
  email_count: number
  call_count: number
  meeting_count: number

  // Communication preferences
  preferred_contact_method?: ContactMethod
  email_opt_in: boolean
  sms_opt_in: boolean
  do_not_contact: boolean

  // Relationship
  account_owner_id?: string
  account_owner_name?: string
  assigned_to_id?: string
  assigned_to_name?: string

  // Social media
  linkedin_url?: string
  twitter_url?: string
  facebook_url?: string

  // Scoring
  lead_score: number
  engagement_score: number
  qualification_status?: QualificationStatus

  // Notes
  notes?: string
  tags?: string[]
  custom_fields?: any

  // Conversion
  conversion_date?: string
  conversion_value?: number
  time_to_conversion_days?: number

  // Satisfaction
  satisfaction_score?: number
  nps_score?: number
  last_survey_date?: string

  // Address
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string

  // Integration
  salesforce_id?: string
  hubspot_id?: string
  external_id?: string

  // Timestamps
  created_at: string
  updated_at: string
  deleted_at?: string

  // Metadata
  metadata?: any
}

export function useCrmContacts(filters?: {
  contactType?: ContactType | 'all'
  status?: ContactStatus | 'all'
  dealStage?: DealStage | 'all'
}) {
  const [data, setData] = useState<CrmContact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }

    setIsLoading(true)
    setError(null)

    try {
      let query = supabase.from('crm_contacts').select('*')

      if (filters?.contactType && filters.contactType !== 'all') {
        query = query.eq('contact_type', filters.contactType)
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters?.dealStage && filters.dealStage !== 'all') {
        query = query.eq('deal_stage', filters.dealStage)
      }

      query = query.order('created_at', { ascending: false })

      const { data: result, error: queryError } = await query

      if (queryError) throw new Error(queryError.message)
      setData((result as CrmContact[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase, filters?.contactType, filters?.status, filters?.dealStage])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

export function useCreateCrmContact() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const mutate = useCallback(async (data: Partial<CrmContact>): Promise<CrmContact | null> => {
    if (isDemoModeEnabled()) { setIsLoading(false); return null }

    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error: insertError } = await supabase
        .from('crm_contacts')
        .insert({ ...data, user_id: user.id })
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)
      return result as CrmContact
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  return { mutate, isLoading, error }
}

export function useUpdateCrmContact() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const mutate = useCallback(async (id: string, data: Partial<CrmContact>): Promise<CrmContact | null> => {
    if (isDemoModeEnabled()) { setIsLoading(false); return null }

    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error: updateError } = await supabase
        .from('crm_contacts')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw new Error(updateError.message)
      return result as CrmContact
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  return { mutate, isLoading, error }
}

export function useDeleteCrmContact() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const mutate = useCallback(async (id: string): Promise<boolean> => {
    if (isDemoModeEnabled()) { setIsLoading(false); return false }

    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: deleteError } = await supabase
        .from('crm_contacts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw new Error(deleteError.message)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  return { mutate, isLoading, error }
}
