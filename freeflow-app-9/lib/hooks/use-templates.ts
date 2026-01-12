'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { useCallback, useMemo } from 'react'

export interface Template {
  id: string
  user_id: string
  template_code: string
  name: string
  description: string | null
  category: string
  status: string
  access_level: string
  creator_name: string | null
  department: string | null
  version: string
  usage_count: number
  downloads: number
  rating: number
  reviews_count: number
  last_used: string | null
  content: string | null
  template_data: Record<string, unknown>
  tags: string[]
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface TemplateUsage {
  id: string
  user_id: string
  template_id: string
  user_name: string | null
  department: string | null
  action: string
  created_at: string
}

export interface TemplateFilters {
  status?: string
  category?: string
  accessLevel?: string
}

export interface TemplateStats {
  total: number
  active: number
  draft: number
  archived: number
  totalUsage: number
  totalDownloads: number
  avgRating: number
}

export function useTemplates(initialTemplates: Template[] = [], filters: TemplateFilters = {}) {
  const queryKey = ['templates', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('templates')
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.accessLevel) {
      query = query.eq('access_level', filters.accessLevel)
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data as Template[]
  }, [filters])

  const { data: templates, isLoading, error, refetch } = useSupabaseQuery<Template[]>(
    queryKey,
    queryFn,
    { initialData: initialTemplates }
  )

  const stats: TemplateStats = useMemo(() => {
    const templateList = templates || []
    const ratedTemplates = templateList.filter(t => Number(t.rating) > 0)

    return {
      total: templateList.length,
      active: templateList.filter(t => t.status === 'active').length,
      draft: templateList.filter(t => t.status === 'draft').length,
      archived: templateList.filter(t => t.status === 'archived').length,
      totalUsage: templateList.reduce((sum, t) => sum + t.usage_count, 0),
      totalDownloads: templateList.reduce((sum, t) => sum + t.downloads, 0),
      avgRating: ratedTemplates.length > 0
        ? ratedTemplates.reduce((sum, t) => sum + Number(t.rating), 0) / ratedTemplates.length
        : 0
    }
  }, [templates])

  return { templates: templates || [], stats, isLoading, error, refetch }
}

export function useTemplateUsage(templateId: string, initialUsage: TemplateUsage[] = []) {
  const queryKey = ['template-usage', templateId]

  const queryFn = useCallback(async (supabase: any) => {
    const { data, error } = await supabase
      .from('template_usage')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data as TemplateUsage[]
  }, [templateId])

  const { data: usage, isLoading, error, refetch } = useSupabaseQuery<TemplateUsage[]>(
    queryKey,
    queryFn,
    { initialData: initialUsage }
  )

  return { usage: usage || [], isLoading, error, refetch }
}

export function useTemplateMutations() {
  const createMutation = useSupabaseMutation<Partial<Template>, Template>(
    async (supabase, templateData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const templateCode = `TPL-${Date.now().toString(36).toUpperCase()}`

      const { data, error } = await supabase
        .from('templates')
        .insert({
          ...templateData,
          user_id: user.id,
          template_code: templateCode
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['templates']] }
  )

  const updateMutation = useSupabaseMutation<{ id: string; updates: Partial<Template> }, Template>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['templates']] }
  )

  const deleteMutation = useSupabaseMutation<string, void>(
    async (supabase, id) => {
      const { error } = await supabase
        .from('templates')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    { invalidateKeys: [['templates']] }
  )

  const useTemplateMutation = useSupabaseMutation<{ templateId: string; userName?: string; department?: string }, void>(
    async (supabase, { templateId, userName, department }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Record usage
      await supabase
        .from('template_usage')
        .insert({
          user_id: user.id,
          template_id: templateId,
          user_name: userName,
          department,
          action: 'used'
        })

      // Increment usage count
      await supabase.rpc('increment_template_usage', { template_id: templateId })
        .catch(() => {}) // Ignore if RPC doesn't exist
    },
    { invalidateKeys: [['templates'], ['template-usage']] }
  )

  const downloadTemplateMutation = useSupabaseMutation<string, void>(
    async (supabase, templateId) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Record download
      await supabase
        .from('template_usage')
        .insert({
          user_id: user.id,
          template_id: templateId,
          action: 'downloaded'
        })

      // Increment download count
      const { data: template } = await supabase
        .from('templates')
        .select('downloads')
        .eq('id', templateId)
        .single()

      if (template) {
        await supabase
          .from('templates')
          .update({ downloads: (template.downloads || 0) + 1 })
          .eq('id', templateId)
      }
    },
    { invalidateKeys: [['templates']] }
  )

  return {
    createTemplate: createMutation.mutate,
    updateTemplate: updateMutation.mutate,
    deleteTemplate: deleteMutation.mutate,
    applyTemplate: useTemplateMutation.mutate,
    downloadTemplate: downloadTemplateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}

export function getTemplateStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'deprecated': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'email': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'document': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'contract': return 'bg-red-100 text-red-800 border-red-200'
    case 'presentation': return 'bg-green-100 text-green-800 border-green-200'
    case 'form': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'report': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getAccessLevelColor(level: string): string {
  switch (level) {
    case 'public': return 'bg-green-100 text-green-800 border-green-200'
    case 'team': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'private': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'enterprise': return 'bg-purple-100 text-purple-800 border-purple-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}
