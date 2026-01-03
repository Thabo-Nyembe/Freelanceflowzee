'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

// Types
export interface SalesDeal {
  id: string
  user_id: string
  deal_code: string
  title: string
  description: string | null
  company_name: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_title: string | null
  deal_value: number
  currency: string
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  deal_type: string | null
  expected_close_date: string | null
  actual_close_date: string | null
  last_contact_at: string | null
  next_followup_at: string | null
  assigned_to: string | null
  team_id: string | null
  lead_source: string | null
  campaign_id: string | null
  referral_source: string | null
  won_at: string | null
  lost_at: string | null
  lost_reason: string | null
  competitor: string | null
  tags: string[]
  notes: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface SalesActivity {
  id: string
  deal_id: string
  user_id: string
  activity_type: string
  subject: string | null
  description: string | null
  outcome: string | null
  duration_minutes: number | null
  scheduled_at: string | null
  completed_at: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface PipelineStage {
  id: string
  user_id: string
  name: string
  stage_order: number
  probability: number
  color: string | null
  is_won_stage: boolean
  is_lost_stage: boolean
  metadata: Record<string, any>
  created_at: string
}

export interface SalesStats {
  totalDeals: number
  totalValue: number
  wonDeals: number
  wonValue: number
  lostDeals: number
  avgDealSize: number
  winRate: number
  pipelineValue: number
  avgProbability: number
}

export function useSalesDeals() {
  const supabase = createClient()
  const { toast } = useToast()
  const [deals, setDeals] = useState<SalesDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('sales_deals')
        .select('*')
        .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDeals(data || [])
    } catch (err: any) {
      setError(err.message)
      toast({ title: 'Error', description: 'Failed to fetch deals', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  const createDeal = async (deal: Partial<SalesDeal>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('sales_deals')
        .insert([{ ...deal, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setDeals(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Deal created successfully' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const updateDeal = async (id: string, updates: Partial<SalesDeal>) => {
    try {
      const { data, error } = await supabase
        .from('sales_deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setDeals(prev => prev.map(d => d.id === id ? data : d))
      toast({ title: 'Success', description: 'Deal updated' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const deleteDeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales_deals')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setDeals(prev => prev.filter(d => d.id !== id))
      toast({ title: 'Success', description: 'Deal deleted' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const moveDealToStage = async (id: string, stage: SalesDeal['stage'], probability?: number) => {
    const updates: Partial<SalesDeal> = { stage }
    if (probability !== undefined) updates.probability = probability
    if (stage === 'closed_won') updates.won_at = new Date().toISOString()
    if (stage === 'closed_lost') updates.lost_at = new Date().toISOString()
    return updateDeal(id, updates)
  }

  const winDeal = async (id: string) => {
    return updateDeal(id, {
      stage: 'closed_won',
      probability: 100,
      won_at: new Date().toISOString(),
      actual_close_date: new Date().toISOString().split('T')[0]
    })
  }

  const loseDeal = async (id: string, reason?: string, competitor?: string) => {
    return updateDeal(id, {
      stage: 'closed_lost',
      probability: 0,
      lost_at: new Date().toISOString(),
      lost_reason: reason,
      competitor,
      actual_close_date: new Date().toISOString().split('T')[0]
    })
  }

  const logActivity = async (dealId: string, activity: Partial<SalesActivity>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('sales_activities')
        .insert([{ ...activity, deal_id: dealId, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      // Update last contact
      await updateDeal(dealId, { last_contact_at: new Date().toISOString() })

      toast({ title: 'Success', description: 'Activity logged' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const getStats = useCallback((): SalesStats => {
    const won = deals.filter(d => d.stage === 'closed_won')
    const lost = deals.filter(d => d.stage === 'closed_lost')
    const open = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
    const closed = won.length + lost.length

    return {
      totalDeals: deals.length,
      totalValue: deals.reduce((sum, d) => sum + d.deal_value, 0),
      wonDeals: won.length,
      wonValue: won.reduce((sum, d) => sum + d.deal_value, 0),
      lostDeals: lost.length,
      avgDealSize: deals.length > 0
        ? deals.reduce((sum, d) => sum + d.deal_value, 0) / deals.length
        : 0,
      winRate: closed > 0 ? (won.length / closed) * 100 : 0,
      pipelineValue: open.reduce((sum, d) => sum + (d.deal_value * d.probability / 100), 0),
      avgProbability: open.length > 0
        ? open.reduce((sum, d) => sum + d.probability, 0) / open.length
        : 0
    }
  }, [deals])

  useEffect(() => {
    fetchDeals()

    const channel = supabase
      .channel('sales-deals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_deals' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDeals(prev => [payload.new as SalesDeal, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setDeals(prev => prev.map(d => d.id === payload.new.id ? payload.new as SalesDeal : d))
        } else if (payload.eventType === 'DELETE') {
          setDeals(prev => prev.filter(d => d.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchDeals, supabase])

  return {
    deals,
    loading,
    error,
    fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    moveDealToStage,
    winDeal,
    loseDeal,
    logActivity,
    getStats
  }
}

export function useSalesActivities(dealId: string) {
  const supabase = createClient()
  const [activities, setActivities] = useState<SalesActivity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivities = useCallback(async () => {
    if (!dealId) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sales_activities')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setActivities(data || [])
    } catch (err) {
      console.error('Failed to fetch activities:', err)
    } finally {
      setLoading(false)
    }
  }, [dealId, supabase])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  return { activities, loading }
}

export function usePipelineStages() {
  const supabase = createClient()
  const { toast } = useToast()
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStages = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('sales_pipeline_stages')
        .select('*')
        .eq('user_id', user.id)
        .order('stage_order', { ascending: true })

      if (error) throw error
      setStages(data || [])
    } catch (err) {
      console.error('Failed to fetch stages:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createStage = async (stage: Partial<PipelineStage>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('sales_pipeline_stages')
        .insert([{ ...stage, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setStages(prev => [...prev, data].sort((a, b) => a.stage_order - b.stage_order))
      toast({ title: 'Success', description: 'Stage created' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchStages()
  }, [fetchStages])

  return { stages, loading, createStage }
}
