'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export interface ThreeDModel {
  id: string
  user_id: string
  model_code: string
  title: string
  description: string | null
  category: string
  status: string
  file_url: string | null
  thumbnail_url: string | null
  file_format: string
  file_size: number
  polygon_count: number
  vertex_count: number
  texture_count: number
  material_count: number
  render_quality: string
  render_samples: number
  last_render_time: number
  project_id: string | null
  is_public: boolean
  downloads: number
  views: number
  likes: number
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface ThreeDModelFilters {
  category?: string
  status?: string
  fileFormat?: string
}

export function use3DModels(initialModels: ThreeDModel[] = [], filters: ThreeDModelFilters = {}) {
  const supabase = createClientComponentClient()
  const [models, setModels] = useState<ThreeDModel[]>(initialModels)
  const [isLoading, setIsLoading] = useState(false)

  const fetchModels = useCallback(async () => {
    setIsLoading(true)
    let query = supabase
      .from('three_d_models')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.fileFormat) {
      query = query.eq('file_format', filters.fileFormat)
    }

    const { data, error } = await query.limit(100)
    if (!error && data) {
      setModels(data)
    }
    setIsLoading(false)
  }, [supabase, filters.category, filters.status, filters.fileFormat])

  useEffect(() => {
    if (initialModels.length === 0) {
      fetchModels()
    }
  }, [fetchModels, initialModels.length])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('three_d_models_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'three_d_models' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setModels(prev => [payload.new as ThreeDModel, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setModels(prev => prev.map(m => m.id === payload.new.id ? payload.new as ThreeDModel : m))
        } else if (payload.eventType === 'DELETE') {
          setModels(prev => prev.filter(m => m.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Calculate stats
  const stats = {
    total: models.length,
    draft: models.filter(m => m.status === 'draft').length,
    published: models.filter(m => m.status === 'published').length,
    rendering: models.filter(m => m.status === 'rendering').length,
    totalPolygons: models.reduce((sum, m) => sum + m.polygon_count, 0),
    totalDownloads: models.reduce((sum, m) => sum + m.downloads, 0),
    avgRenderTime: models.length > 0 ? models.reduce((sum, m) => sum + m.last_render_time, 0) / models.length : 0,
    publicModels: models.filter(m => m.is_public).length
  }

  return { models, stats, isLoading, refetch: fetchModels }
}

export function use3DModelMutations() {
  const { mutate: createModel, isLoading: isCreating } = useSupabaseMutation('three_d_models', 'INSERT')
  const { mutate: updateModel, isLoading: isUpdating } = useSupabaseMutation('three_d_models', 'UPDATE')
  const { mutate: deleteModel, isLoading: isDeleting } = useSupabaseMutation('three_d_models', 'DELETE')

  return {
    createModel,
    updateModel,
    deleteModel,
    isCreating,
    isUpdating,
    isDeleting
  }
}

export function getModelStatusColor(status: string): string {
  switch (status) {
    case 'published': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
    case 'draft': return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    case 'rendering': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    case 'archived': return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

export function getRenderQualityColor(quality: string): string {
  switch (quality) {
    case 'ultra': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    case 'high': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
    case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    case 'low': return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function formatPolygonCount(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
  return count.toString()
}
