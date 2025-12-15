'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface EscrowDeposit {
  id: string
  user_id: string
  client_id: string | null
  project_id: string | null
  project_title: string
  client_name: string | null
  client_email: string | null
  client_avatar: string | null
  amount: number
  currency: string
  released_amount: number
  status: 'pending' | 'active' | 'completed' | 'disputed' | 'cancelled' | 'refunded'
  progress_percentage: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  completed_at: string | null
  milestones?: EscrowMilestone[]
}

export interface EscrowMilestone {
  id: string
  escrow_id: string
  title: string
  description: string | null
  amount: number
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  due_date: string | null
  completed_at: string | null
  sort_order: number
}

export function useEscrow(initialDeposits: EscrowDeposit[] = []) {
  const [deposits, setDeposits] = useState<EscrowDeposit[]>(initialDeposits)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const fetchDeposits = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('escrow_deposits')
        .select(`
          *,
          milestones:escrow_milestones(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDeposits(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const createDeposit = async (deposit: Partial<EscrowDeposit>) => {
    const { data, error } = await supabase
      .from('escrow_deposits')
      .insert([deposit])
      .select()
      .single()

    if (error) throw error
    setDeposits(prev => [data, ...prev])
    return data
  }

  const updateDeposit = async (id: string, updates: Partial<EscrowDeposit>) => {
    const { data, error } = await supabase
      .from('escrow_deposits')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setDeposits(prev => prev.map(d => d.id === id ? data : d))
    return data
  }

  const deleteDeposit = async (id: string) => {
    const { error } = await supabase
      .from('escrow_deposits')
      .delete()
      .eq('id', id)

    if (error) throw error
    setDeposits(prev => prev.filter(d => d.id !== id))
  }

  const releaseFunds = async (id: string, amount: number) => {
    const deposit = deposits.find(d => d.id === id)
    if (!deposit) throw new Error('Deposit not found')

    const newReleasedAmount = (deposit.released_amount || 0) + amount
    const isComplete = newReleasedAmount >= deposit.amount

    return updateDeposit(id, {
      released_amount: newReleasedAmount,
      status: isComplete ? 'completed' : 'active',
      completed_at: isComplete ? new Date().toISOString() : null,
      progress_percentage: Math.round((newReleasedAmount / deposit.amount) * 100)
    })
  }

  const createMilestone = async (escrowId: string, milestone: Partial<EscrowMilestone>) => {
    const { data, error } = await supabase
      .from('escrow_milestones')
      .insert([{ ...milestone, escrow_id: escrowId }])
      .select()
      .single()

    if (error) throw error
    await fetchDeposits()
    return data
  }

  const updateMilestone = async (id: string, updates: Partial<EscrowMilestone>) => {
    const { data, error } = await supabase
      .from('escrow_milestones')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    await fetchDeposits()
    return data
  }

  const completeMilestone = async (id: string) => {
    return updateMilestone(id, { status: 'completed', completed_at: new Date().toISOString() })
  }

  useEffect(() => {
    const channel = supabase
      .channel('escrow_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escrow_deposits' },
        () => fetchDeposits()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escrow_milestones' },
        () => fetchDeposits()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchDeposits])

  const stats = {
    total: deposits.length,
    pending: deposits.filter(d => d.status === 'pending').length,
    active: deposits.filter(d => d.status === 'active').length,
    completed: deposits.filter(d => d.status === 'completed').length,
    disputed: deposits.filter(d => d.status === 'disputed').length,
    totalInEscrow: deposits.filter(d => d.status === 'active' || d.status === 'pending').reduce((sum, d) => sum + (d.amount || 0), 0),
    totalReleased: deposits.filter(d => d.status === 'completed').reduce((sum, d) => sum + (d.amount || 0), 0)
  }

  return {
    deposits,
    stats,
    isLoading,
    error,
    fetchDeposits,
    createDeposit,
    updateDeposit,
    deleteDeposit,
    releaseFunds,
    createMilestone,
    updateMilestone,
    completeMilestone
  }
}
