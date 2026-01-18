'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface Deal {
  id: string
  user_id: string
  client_id: string
  deal_code: string
  title: string
  description: string | null
  value: number
  currency: string
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expected_close_date: string | null
  actual_close_date: string | null
  source: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to: string | null
  tags: string[]
  notes: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  client?: {
    id: string
    name: string
    company: string | null
    email: string | null
  }
}

export interface DealFilters {
  clientId?: string
  stage?: string
  priority?: string
  assignedTo?: string
}

export interface DealStats {
  total: number
  totalValue: number
  avgValue: number
  byStage: Record<string, { count: number; value: number }>
  wonDeals: number
  lostDeals: number
  winRate: number
  pipeline: number
}

const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

export function useDeals(filters: DealFilters = {}) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchDeals = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('deals')
        .select(`
          *,
          client:clients(id, name, company, email)
        `)
        .order('created_at', { ascending: false })

      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId)
      }
      if (filters.stage) {
        query = query.eq('stage', filters.stage)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
      }

      const { data, error: fetchError } = await query.limit(100)

      if (fetchError) throw fetchError
      setDeals(data || [])
    } catch (err: unknown) {
      setError(err.message)
      console.error('Failed to fetch deals:', err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, filters.clientId, filters.stage, filters.priority, filters.assignedTo])

  const createDeal = async (deal: Partial<Deal>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const dealCode = `DEAL-${Date.now().toString(36).toUpperCase()}`

      const { data, error } = await supabase
        .from('deals')
        .insert({
          ...deal,
          user_id: user.id,
          deal_code: dealCode,
          stage: deal.stage || 'lead',
          probability: deal.probability || getProbabilityForStage(deal.stage || 'lead'),
          currency: deal.currency || 'USD',
          priority: deal.priority || 'medium',
          tags: deal.tags || [],
          metadata: deal.metadata || {}
        })
        .select(`
          *,
          client:clients(id, name, company, email)
        `)
        .single()

      if (error) throw error
      setDeals(prev => [data, ...prev])
      toast.success('Deal created', { description: `${data.title} added to pipeline` })
      return data
    } catch (err: unknown) {
      toast.error('Failed to create deal', { description: err instanceof Error ? err.message : 'Operation failed' })
      throw err
    }
  }

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    try {
      // Auto-update probability when stage changes
      if (updates.stage && !updates.probability) {
        updates.probability = getProbabilityForStage(updates.stage)
      }

      const { data, error } = await supabase
        .from('deals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          client:clients(id, name, company, email)
        `)
        .single()

      if (error) throw error
      setDeals(prev => prev.map(d => d.id === id ? data : d))
      toast.success('Deal updated')
      return data
    } catch (err: unknown) {
      toast.error('Failed to update deal', { description: err instanceof Error ? err.message : 'Operation failed' })
      throw err
    }
  }

  const updateStage = async (id: string, stage: Deal['stage']) => {
    const updates: Partial<Deal> = { stage }

    if (stage === 'closed_won') {
      updates.actual_close_date = new Date().toISOString()
      updates.probability = 100
    } else if (stage === 'closed_lost') {
      updates.actual_close_date = new Date().toISOString()
      updates.probability = 0
    }

    return updateDeal(id, updates)
  }

  const deleteDeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id)

      if (error) throw error
      setDeals(prev => prev.filter(d => d.id !== id))
      toast.success('Deal deleted')
    } catch (err: unknown) {
      toast.error('Failed to delete deal', { description: err instanceof Error ? err.message : 'Operation failed' })
      throw err
    }
  }

  // Real-time subscription
  useEffect(() => {
    fetchDeals()

    const channel = supabase
      .channel('deals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => {
        fetchDeals()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchDeals])

  // Calculate stats
  const stats: DealStats = {
    total: deals.length,
    totalValue: deals.reduce((sum, d) => sum + (d.value || 0), 0),
    avgValue: deals.length > 0 ? deals.reduce((sum, d) => sum + (d.value || 0), 0) / deals.length : 0,
    byStage: STAGES.reduce((acc, stage) => {
      const stageDeals = deals.filter(d => d.stage === stage)
      acc[stage] = {
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
      }
      return acc
    }, {} as Record<string, { count: number; value: number }>),
    wonDeals: deals.filter(d => d.stage === 'closed_won').length,
    lostDeals: deals.filter(d => d.stage === 'closed_lost').length,
    winRate: (() => {
      const closed = deals.filter(d => d.stage === 'closed_won' || d.stage === 'closed_lost')
      if (closed.length === 0) return 0
      return (deals.filter(d => d.stage === 'closed_won').length / closed.length) * 100
    })(),
    pipeline: deals
      .filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
      .reduce((sum, d) => sum + (d.value || 0) * (d.probability / 100), 0)
  }

  return {
    deals,
    stats,
    isLoading,
    error,
    fetchDeals,
    createDeal,
    updateDeal,
    updateStage,
    deleteDeal
  }
}

// Helper functions
function getProbabilityForStage(stage: string): number {
  switch (stage) {
    case 'lead': return 10
    case 'qualified': return 25
    case 'proposal': return 50
    case 'negotiation': return 75
    case 'closed_won': return 100
    case 'closed_lost': return 0
    default: return 10
  }
}

export function getStageColor(stage: string): string {
  switch (stage) {
    case 'lead': return 'bg-gray-100 text-gray-800'
    case 'qualified': return 'bg-blue-100 text-blue-800'
    case 'proposal': return 'bg-purple-100 text-purple-800'
    case 'negotiation': return 'bg-yellow-100 text-yellow-800'
    case 'closed_won': return 'bg-green-100 text-green-800'
    case 'closed_lost': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value)
}
