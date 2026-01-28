'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { useCallback, useMemo } from 'react'

// Demo mode detection - return empty data in demo mode to avoid 400 errors
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

export interface Milestone {
  id: string
  user_id: string
  milestone_code: string
  name: string
  description: string | null
  type: string
  status: string
  priority: string
  due_date: string | null
  days_remaining: number
  progress: number
  owner_name: string | null
  owner_email: string | null
  team_name: string | null
  deliverables: number
  completed_deliverables: number
  budget: number
  spent: number
  currency: string
  dependencies: number
  stakeholders: string[]
  tags: string[]
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MilestoneDeliverable {
  id: string
  user_id: string
  milestone_id: string
  deliverable_code: string
  name: string
  description: string | null
  status: string
  due_date: string | null
  completed_date: string | null
  assignee_name: string | null
  assignee_email: string | null
  progress: number
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface MilestoneFilters {
  status?: string
  type?: string
  priority?: string
  owner?: string
}

export interface MilestoneStats {
  total: number
  upcoming: number
  inProgress: number
  atRisk: number
  completed: number
  missed: number
  avgProgress: number
  onTimeRate: number
}

export function useMilestones(initialMilestones: Milestone[] = [], filters: MilestoneFilters = {}) {
  const queryKey = ['milestones', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    // In demo mode, return empty array to avoid unauthenticated Supabase queries
    if (isDemoModeEnabled()) {
      return []
    }
    let query = supabase
      .from('milestones')
      .select('*')
      .is('deleted_at', null)
      .order('due_date', { ascending: true })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters.owner) {
      query = query.ilike('owner_name', `%${filters.owner}%`)
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data as Milestone[]
  }, [filters])

  const { data: milestones, isLoading, error, refetch } = useSupabaseQuery<Milestone[]>(
    queryKey,
    queryFn,
    { initialData: initialMilestones }
  )

  const stats: MilestoneStats = useMemo(() => {
    const list = milestones || []
    const completedOnTime = list.filter(m => m.status === 'completed' && m.days_remaining >= 0).length
    const totalCompleted = list.filter(m => m.status === 'completed').length

    return {
      total: list.length,
      upcoming: list.filter(m => m.status === 'upcoming').length,
      inProgress: list.filter(m => m.status === 'in-progress').length,
      atRisk: list.filter(m => m.status === 'at-risk').length,
      completed: totalCompleted,
      missed: list.filter(m => m.status === 'missed').length,
      avgProgress: list.length > 0
        ? list.reduce((sum, m) => sum + m.progress, 0) / list.length
        : 0,
      onTimeRate: totalCompleted > 0 ? (completedOnTime / totalCompleted) * 100 : 0
    }
  }, [milestones])

  return { milestones: milestones || [], stats, isLoading, error, refetch }
}

export function useMilestoneDeliverables(milestoneId: string, initialDeliverables: MilestoneDeliverable[] = []) {
  const queryKey = ['milestone-deliverables', milestoneId]

  const queryFn = useCallback(async (supabase: any) => {
    const { data, error } = await supabase
      .from('milestone_deliverables')
      .select('*')
      .eq('milestone_id', milestoneId)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data as MilestoneDeliverable[]
  }, [milestoneId])

  const { data: deliverables, isLoading, error, refetch } = useSupabaseQuery<MilestoneDeliverable[]>(
    queryKey,
    queryFn,
    { initialData: initialDeliverables }
  )

  return { deliverables: deliverables || [], isLoading, error, refetch }
}

export function useMilestoneMutations() {
  const createMutation = useSupabaseMutation<Partial<Milestone>, Milestone>(
    async (supabase, data) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const milestoneCode = `MLS-${Date.now().toString(36).toUpperCase()}`

      const { data: result, error } = await supabase
        .from('milestones')
        .insert({
          ...data,
          user_id: user.id,
          milestone_code: milestoneCode
        })
        .select()
        .single()

      if (error) throw error
      return result
    },
    { invalidateKeys: [['milestones']] }
  )

  const updateMutation = useSupabaseMutation<{ id: string; updates: Partial<Milestone> }, Milestone>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['milestones']] }
  )

  const deleteMutation = useSupabaseMutation<string, void>(
    async (supabase, id) => {
      const { error } = await supabase
        .from('milestones')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    { invalidateKeys: [['milestones']] }
  )

  return {
    createMilestone: createMutation.mutate,
    updateMilestone: updateMutation.mutate,
    deleteMilestone: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}

export function getMilestoneStatusColor(status: string): string {
  switch (status) {
    case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'at-risk': return 'bg-red-100 text-red-800 border-red-200'
    case 'completed': return 'bg-green-100 text-green-800 border-green-200'
    case 'missed': return 'bg-orange-100 text-orange-800 border-orange-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getMilestoneTypeColor(type: string): string {
  switch (type) {
    case 'project': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'product': return 'bg-green-100 text-green-800 border-green-200'
    case 'business': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'technical': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
    case 'compliance': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getMilestonePriorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (amount === 0) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function calculateDaysRemaining(dueDate: string | null): number {
  if (!dueDate) return 0
  const due = new Date(dueDate)
  const now = new Date()
  const diff = due.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
