'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'

// Types
export type InitiativeStatus = 'planned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
export type InitiativePriority = 'low' | 'medium' | 'high' | 'critical'
export type InitiativeImpact = 'low' | 'medium' | 'high' | 'very_high' | 'critical'
export type InitiativeEffort = 'small' | 'medium' | 'large' | 'extra_large'
export type MilestoneStatus = 'planned' | 'on_track' | 'at_risk' | 'delayed' | 'completed'

export interface RoadmapInitiative {
  id: string
  user_id: string
  title: string
  description: string | null
  quarter: string | null
  year: number | null
  theme: string | null
  team: string | null
  status: InitiativeStatus
  priority: InitiativePriority
  progress_percentage: number
  impact: InitiativeImpact
  effort: InitiativeEffort
  stakeholders: string[]
  owner_id: string | null
  start_date: string | null
  target_date: string | null
  completed_date: string | null
  tags: string[]
  dependencies: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface RoadmapMilestone {
  id: string
  user_id: string
  milestone_name: string
  description: string | null
  target_date: string
  completed_date: string | null
  status: MilestoneStatus
  initiatives_count: number
  completion_percentage: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Hook Options
interface UseInitiativesOptions {
  status?: InitiativeStatus
  priority?: InitiativePriority
  quarter?: string
  year?: number
  theme?: string
  searchQuery?: string
}

interface UseMilestonesOptions {
  status?: MilestoneStatus
}

// Initiatives Hook
export function useRoadmapInitiatives(options: UseInitiativesOptions = {}) {
  const { status, priority, quarter, year, theme, searchQuery } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('roadmap_initiatives')
      .select('*')
      .is('deleted_at', null)
      .order('priority', { ascending: false })
      .order('target_date', { ascending: true, nullsFirst: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    if (quarter) {
      query = query.eq('quarter', quarter)
    }

    if (year) {
      query = query.eq('year', year)
    }

    if (theme) {
      query = query.eq('theme', theme)
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }

    return query
  }

  return useSupabaseQuery<RoadmapInitiative>('roadmap_initiatives', buildQuery, [status, priority, quarter, year, theme, searchQuery])
}

// Single Initiative Hook
export function useRoadmapInitiative(initiativeId: string | null) {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('roadmap_initiatives')
      .select('*')
      .eq('id', initiativeId)
      .single()
  }

  return useSupabaseQuery<RoadmapInitiative>(
    'roadmap_initiatives',
    buildQuery,
    [initiativeId],
    { enabled: !!initiativeId }
  )
}

// Milestones Hook
export function useRoadmapMilestones(options: UseMilestonesOptions = {}) {
  const { status } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('roadmap_milestones')
      .select('*')
      .is('deleted_at', null)
      .order('target_date', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    return query
  }

  return useSupabaseQuery<RoadmapMilestone>('roadmap_milestones', buildQuery, [status])
}

// Roadmap Statistics Hook
export function useRoadmapStats() {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('roadmap_initiatives')
      .select('status, priority, impact, progress_percentage, theme, quarter')
      .is('deleted_at', null)
  }

  const { data, ...rest } = useSupabaseQuery<any>('roadmap_initiatives', buildQuery, [])

  const stats = data ? {
    totalInitiatives: data.length,
    completedInitiatives: data.filter((i: any) => i.status === 'completed').length,
    inProgressInitiatives: data.filter((i: any) => i.status === 'in_progress').length,
    plannedInitiatives: data.filter((i: any) => i.status === 'planned').length,
    averageProgress: data.length > 0
      ? data.reduce((sum: number, i: any) => sum + (i.progress_percentage || 0), 0) / data.length
      : 0,
    highPriorityCount: data.filter((i: any) => i.priority === 'high' || i.priority === 'critical').length,
    byTheme: data.reduce((acc: Record<string, number>, i: any) => {
      if (i.theme) {
        acc[i.theme] = (acc[i.theme] || 0) + 1
      }
      return acc
    }, {}),
    byQuarter: data.reduce((acc: Record<string, number>, i: any) => {
      if (i.quarter) {
        acc[i.quarter] = (acc[i.quarter] || 0) + 1
      }
      return acc
    }, {}),
    byStatus: data.reduce((acc: Record<string, number>, i: any) => {
      acc[i.status] = (acc[i.status] || 0) + 1
      return acc
    }, {})
  } : null

  return { stats, ...rest }
}

// Initiatives by Quarter Hook
export function useInitiativesByQuarter(quarter: string, year: number) {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('roadmap_initiatives')
      .select('*')
      .eq('quarter', quarter)
      .eq('year', year)
      .is('deleted_at', null)
      .order('priority', { ascending: false })
  }

  return useSupabaseQuery<RoadmapInitiative>(
    'roadmap_initiatives',
    buildQuery,
    [quarter, year],
    { enabled: !!quarter && !!year }
  )
}

// Mutations
export function useRoadmapMutations() {
  return useSupabaseMutation()
}
