'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { useCallback, useMemo } from 'react'

export interface Resource {
  id: string
  user_id: string
  resource_code: string
  name: string
  email: string | null
  type: string
  skill_level: string
  status: string
  department: string | null
  location: string | null
  capacity: number
  allocated: number
  utilization: number
  skills: string[]
  projects: string[]
  hourly_rate: number
  currency: string
  availability_date: string | null
  hire_date: string | null
  phone: string | null
  avatar_url: string | null
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ResourceSkill {
  id: string
  user_id: string
  resource_id: string
  skill_name: string
  proficiency_level: number
  years_experience: number
  certified: boolean
  certification_date: string | null
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ResourceFilters {
  status?: string
  type?: string
  skillLevel?: string
  department?: string
}

export interface ResourceStats {
  total: number
  available: number
  assigned: number
  overallocated: number
  unavailable: number
  avgUtilization: number
  totalCapacity: number
  totalAllocated: number
}

export function useResources(initialResources: Resource[] = [], filters: ResourceFilters = {}) {
  const queryKey = ['resources', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('resources')
      .select('*')
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    if (filters.skillLevel) {
      query = query.eq('skill_level', filters.skillLevel)
    }
    if (filters.department) {
      query = query.ilike('department', `%${filters.department}%`)
    }

    const { data, error } = await query.limit(200)
    if (error) throw error
    return data as Resource[]
  }, [filters])

  const { data: resources, isLoading, error, refetch } = useSupabaseQuery<Resource[]>(
    queryKey,
    queryFn,
    { initialData: initialResources }
  )

  const stats: ResourceStats = useMemo(() => {
    const list = resources || []

    return {
      total: list.length,
      available: list.filter(r => r.status === 'available').length,
      assigned: list.filter(r => r.status === 'assigned').length,
      overallocated: list.filter(r => r.status === 'overallocated').length,
      unavailable: list.filter(r => r.status === 'unavailable').length,
      avgUtilization: list.length > 0
        ? list.reduce((sum, r) => sum + Number(r.utilization), 0) / list.length
        : 0,
      totalCapacity: list.reduce((sum, r) => sum + r.capacity, 0),
      totalAllocated: list.reduce((sum, r) => sum + r.allocated, 0)
    }
  }, [resources])

  return { resources: resources || [], stats, isLoading, error, refetch }
}

export function useResourceSkills(resourceId: string, initialSkills: ResourceSkill[] = []) {
  const queryKey = ['resource-skills', resourceId]

  const queryFn = useCallback(async (supabase: any) => {
    const { data, error } = await supabase
      .from('resource_skills')
      .select('*')
      .eq('resource_id', resourceId)
      .order('proficiency_level', { ascending: false })

    if (error) throw error
    return data as ResourceSkill[]
  }, [resourceId])

  const { data: skills, isLoading, error, refetch } = useSupabaseQuery<ResourceSkill[]>(
    queryKey,
    queryFn,
    { initialData: initialSkills }
  )

  return { skills: skills || [], isLoading, error, refetch }
}

export function useResourceMutations() {
  const createMutation = useSupabaseMutation<Partial<Resource>, Resource>(
    async (supabase, data) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const resourceCode = `RES-${Date.now().toString(36).toUpperCase()}`

      const { data: result, error } = await supabase
        .from('resources')
        .insert({
          ...data,
          user_id: user.id,
          resource_code: resourceCode
        })
        .select()
        .single()

      if (error) throw error
      return result
    },
    { invalidateKeys: [['resources']] }
  )

  const updateMutation = useSupabaseMutation<{ id: string; updates: Partial<Resource> }, Resource>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['resources']] }
  )

  const deleteMutation = useSupabaseMutation<string, void>(
    async (supabase, id) => {
      const { error } = await supabase
        .from('resources')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    { invalidateKeys: [['resources']] }
  )

  const updateUtilizationMutation = useSupabaseMutation<{ id: string; allocated: number; capacity: number }, Resource>(
    async (supabase, { id, allocated, capacity }) => {
      const utilization = capacity > 0 ? (allocated / capacity) * 100 : 0
      let status = 'available'
      if (utilization >= 100) status = 'overallocated'
      else if (utilization > 0) status = 'assigned'

      const { data, error } = await supabase
        .from('resources')
        .update({ allocated, utilization, status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['resources']] }
  )

  return {
    createResource: createMutation.mutate,
    updateResource: updateMutation.mutate,
    deleteResource: deleteMutation.mutate,
    updateUtilization: updateUtilizationMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}

export function getResourceStatusColor(status: string): string {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800 border-green-200'
    case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'overallocated': return 'bg-red-100 text-red-800 border-red-200'
    case 'unavailable': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getResourceTypeColor(type: string): string {
  switch (type) {
    case 'developer': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'designer': return 'bg-pink-100 text-pink-800 border-pink-200'
    case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'qa': return 'bg-green-100 text-green-800 border-green-200'
    case 'devops': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'other': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getSkillLevelColor(level: string): string {
  switch (level) {
    case 'junior': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'mid-level': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
    case 'senior': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'lead': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'principal': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getUtilizationColor(utilization: number): string {
  if (utilization > 100) return 'text-red-600'
  if (utilization >= 90) return 'text-yellow-600'
  if (utilization >= 70) return 'text-green-600'
  return 'text-blue-600'
}
