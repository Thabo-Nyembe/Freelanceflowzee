'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Lead {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  title: string | null
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost' | 'archived'
  score: number
  source: string
  notes: string | null
  value_estimate: number
  last_contact_at: string | null
  next_follow_up: string | null
  assigned_to: string | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface LeadStats {
  total: number
  new: number
  contacted: number
  qualified: number
  converted: number
  conversionRate: number
  avgScore: number
  pipelineValue: number
}

export interface LeadInput {
  name: string
  email?: string
  phone?: string
  company?: string
  title?: string
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost' | 'archived'
  score?: number
  source?: string
  notes?: string
  value_estimate?: number
  tags?: string[]
}

export function useLeads(initialLeads: Lead[] = [], initialStats: LeadStats) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [stats, setStats] = useState<LeadStats>(initialStats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const calculateStats = useCallback((lds: Lead[]): LeadStats => {
    const converted = lds.filter(l => l.status === 'converted').length
    const totalScores = lds.reduce((sum, l) => sum + l.score, 0)
    return {
      total: lds.length,
      new: lds.filter(l => l.status === 'new').length,
      contacted: lds.filter(l => l.status === 'contacted').length,
      qualified: lds.filter(l => l.status === 'qualified').length,
      converted,
      conversionRate: lds.length > 0 ? (converted / lds.length) * 100 : 0,
      avgScore: lds.length > 0 ? totalScores / lds.length : 0,
      pipelineValue: lds.reduce((sum, l) => sum + l.value_estimate, 0)
    }
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLeads(prev => {
              const updated = [payload.new as Lead, ...prev]
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setLeads(prev => {
              const updated = prev.map(l => l.id === payload.new.id ? payload.new as Lead : l)
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setLeads(prev => {
              const updated = prev.filter(l => l.id !== payload.old.id)
              setStats(calculateStats(updated))
              return updated
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, calculateStats])

  const createLead = useCallback(async (input: LeadInput) => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertError } = await supabase
        .from('leads')
        .insert({
          user_id: user.id,
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          company: input.company || null,
          title: input.title || null,
          status: input.status || 'new',
          score: input.score || 50,
          source: input.source || 'website',
          notes: input.notes || null,
          value_estimate: input.value_estimate || 0,
          tags: input.tags || []
        })
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const updateLead = useCallback(async (id: string, updates: Partial<LeadInput>) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const deleteLead = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead')
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const qualifyLead = useCallback(async (id: string) => {
    return updateLead(id, { status: 'qualified' })
  }, [updateLead])

  const contactLead = useCallback(async (id: string) => {
    const { data, error: updateError } = await supabase
      .from('leads')
      .update({
        status: 'contacted',
        last_contact_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return null
    }
    return data
  }, [supabase])

  const convertLead = useCallback(async (id: string) => {
    return updateLead(id, { status: 'converted' })
  }, [updateLead])

  const updateScore = useCallback(async (id: string, score: number) => {
    return updateLead(id, { score: Math.max(0, Math.min(100, score)) })
  }, [updateLead])

  const refreshLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setLeads(data || [])
      setStats(calculateStats(data || []))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh leads')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  return {
    leads,
    stats,
    loading,
    error,
    createLead,
    updateLead,
    deleteLead,
    qualifyLead,
    contactLead,
    convertLead,
    updateScore,
    refreshLeads
  }
}
