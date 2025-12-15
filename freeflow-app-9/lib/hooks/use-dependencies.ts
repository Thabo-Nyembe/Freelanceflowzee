'use client'

import { useSupabaseQuery, useSupabaseMutation } from './base-hooks'

export type DependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish'
export type DependencyStatus = 'active' | 'resolved' | 'blocked' | 'cancelled'
export type ImpactLevel = 'critical' | 'high' | 'medium' | 'low'

export interface Dependency {
  id: string
  user_id: string
  dependency_name: string
  predecessor_task: string
  successor_task: string
  dependency_type: DependencyType
  status: DependencyStatus
  impact_level: ImpactLevel
  owner: string | null
  team: string | null
  assigned_to: string | null
  predecessor_progress: number
  successor_progress: number
  overall_progress: number
  created_date: string
  due_date: string | null
  resolution_date: string | null
  days_remaining: number
  blocked_days: number
  total_duration_days: number
  resolution: string | null
  blocker_reason: string | null
  resolution_notes: string | null
  is_on_critical_path: boolean
  critical_path_order: number | null
  slack_days: number
  affected_tasks: number
  affected_teams: number
  estimated_delay_days: number
  risk_score: number
  priority: string | null
  tags: string[] | null
  notes: string | null
  external_reference: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseDependenciesOptions {
  status?: DependencyStatus | 'all'
  type?: DependencyType | 'all'
  impactLevel?: ImpactLevel | 'all'
  criticalPath?: boolean
}

export function useDependencies(options: UseDependenciesOptions = {}) {
  const { status, type, impactLevel, criticalPath } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('dependencies')
      .select('*')
      .is('deleted_at', null)
      .order('created_date', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (type && type !== 'all') {
      query = query.eq('dependency_type', type)
    }

    if (impactLevel && impactLevel !== 'all') {
      query = query.eq('impact_level', impactLevel)
    }

    if (criticalPath !== undefined) {
      query = query.eq('is_on_critical_path', criticalPath)
    }

    return query
  }

  return useSupabaseQuery<Dependency>('dependencies', buildQuery, [status, type, impactLevel, criticalPath])
}

export function useCreateDependency() {
  return useSupabaseMutation<Dependency>('dependencies', 'insert')
}

export function useUpdateDependency() {
  return useSupabaseMutation<Dependency>('dependencies', 'update')
}

export function useDeleteDependency() {
  return useSupabaseMutation<Dependency>('dependencies', 'delete')
}
