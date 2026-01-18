'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AIDesign {
  id: string
  user_id: string
  design_code: string
  title: string
  prompt: string
  style: 'modern' | 'minimalist' | 'creative' | 'professional' | 'abstract' | 'vintage'
  category: 'logo' | 'banner' | 'mockup' | 'illustration' | 'icon' | 'social' | 'general'
  thumbnail_url: string | null
  output_url: string | null
  output_urls: string[]
  resolution: string
  format: string
  model: string
  seed: number | null
  cfg_scale: number
  steps: number
  likes: number
  views: number
  downloads: number
  shares: number
  quality_score: number
  generation_time_ms: number
  credits_used: number
  total_cost: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  is_public: boolean
  is_featured: boolean
  tags: string[]
  colors: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseAIDesignsOptions {
  style?: AIDesign['style']
  status?: AIDesign['status']
  isPublic?: boolean
}

interface AIDesignStats {
  total: number
  completed: number
  pending: number
  failed: number
  totalLikes: number
  totalViews: number
  totalDownloads: number
  totalCreditsUsed: number
  avgQualityScore: number
  avgGenerationTime: number
}

export function useAIDesigns(initialDesigns: AIDesign[] = [], options: UseAIDesignsOptions = {}) {
  const [designs, setDesigns] = useState<AIDesign[]>(initialDesigns)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const completedDesigns = designs.filter(d => d.status === 'completed')

  const stats: AIDesignStats = {
    total: designs.length,
    completed: completedDesigns.length,
    pending: designs.filter(d => d.status === 'pending' || d.status === 'processing').length,
    failed: designs.filter(d => d.status === 'failed').length,
    totalLikes: designs.reduce((sum, d) => sum + d.likes, 0),
    totalViews: designs.reduce((sum, d) => sum + d.views, 0),
    totalDownloads: designs.reduce((sum, d) => sum + d.downloads, 0),
    totalCreditsUsed: designs.reduce((sum, d) => sum + d.credits_used, 0),
    avgQualityScore: completedDesigns.length > 0
      ? completedDesigns.reduce((sum, d) => sum + d.quality_score, 0) / completedDesigns.length
      : 0,
    avgGenerationTime: completedDesigns.length > 0
      ? completedDesigns.reduce((sum, d) => sum + d.generation_time_ms, 0) / completedDesigns.length
      : 0
  }

  const fetchDesigns = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('ai_designs')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (options.style) {
        query = query.eq('style', options.style)
      }
      if (options.status) {
        query = query.eq('status', options.status)
      }
      if (options.isPublic !== undefined) {
        query = query.eq('is_public', options.isPublic)
      }

      const { data, error: fetchError } = await query.limit(100)

      if (fetchError) throw fetchError
      setDesigns(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch designs')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, options.style, options.status, options.isPublic])

  useEffect(() => {
    const channel = supabase
      .channel('ai_designs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_designs' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDesigns(prev => [payload.new as AIDesign, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setDesigns(prev => prev.map(d =>
              d.id === payload.new.id ? payload.new as AIDesign : d
            ))
          } else if (payload.eventType === 'DELETE') {
            setDesigns(prev => prev.filter(d => d.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const createDesign = useCallback(async (
    prompt: string,
    style: AIDesign['style'] = 'modern',
    options?: {
      title?: string
      category?: AIDesign['category']
      model?: string
      resolution?: string
      tags?: string[]
    }
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    setIsGenerating(true)
    try {
      const { data, error } = await supabase
        .from('ai_designs')
        .insert({
          user_id: user.id,
          title: options?.title || `${style} Design`,
          prompt,
          style,
          category: options?.category || 'general',
          model: options?.model || 'dall-e-3',
          resolution: options?.resolution || '1024x1024',
          tags: options?.tags || [],
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      setDesigns(prev => [data, ...prev])
      return data
    } finally {
      setIsGenerating(false)
    }
  }, [supabase])

  const updateDesign = useCallback(async (
    designId: string,
    updates: Partial<Pick<AIDesign, 'title' | 'is_public' | 'is_featured' | 'tags' | 'status'>>
  ) => {
    const { error } = await supabase
      .from('ai_designs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', designId)

    if (error) throw error
    setDesigns(prev => prev.map(d =>
      d.id === designId ? { ...d, ...updates } : d
    ))
  }, [supabase])

  // Toggle favorite status (using is_featured field)
  const toggleFavorite = useCallback(async (designId: string) => {
    const design = designs.find(d => d.id === designId)
    if (!design) return

    const newValue = !design.is_featured
    const { error } = await supabase
      .from('ai_designs')
      .update({ is_featured: newValue, updated_at: new Date().toISOString() })
      .eq('id', designId)

    if (error) throw error
    setDesigns(prev => prev.map(d =>
      d.id === designId ? { ...d, is_featured: newValue } : d
    ))
    return newValue
  }, [supabase, designs])

  const likeDesign = useCallback(async (designId: string) => {
    const design = designs.find(d => d.id === designId)
    if (!design) return

    const { error } = await supabase
      .from('ai_designs')
      .update({
        likes: design.likes + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', designId)

    if (error) throw error
    setDesigns(prev => prev.map(d =>
      d.id === designId ? { ...d, likes: d.likes + 1 } : d
    ))
  }, [supabase, designs])

  const incrementViews = useCallback(async (designId: string) => {
    const design = designs.find(d => d.id === designId)
    if (!design) return

    await supabase
      .from('ai_designs')
      .update({ views: design.views + 1 })
      .eq('id', designId)
  }, [supabase, designs])

  const deleteDesign = useCallback(async (designId: string) => {
    const { error } = await supabase
      .from('ai_designs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', designId)

    if (error) throw error
    setDesigns(prev => prev.filter(d => d.id !== designId))
  }, [supabase])

  // Get favorites (designs marked as featured)
  const favorites = designs.filter(d => d.is_featured)

  return {
    designs,
    favorites,
    stats,
    isLoading,
    isGenerating,
    error,
    fetchDesigns,
    createDesign,
    updateDesign,
    toggleFavorite,
    likeDesign,
    incrementViews,
    deleteDesign
  }
}

export function getDesignStyleColor(style: AIDesign['style']): string {
  switch (style) {
    case 'modern':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'minimalist':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    case 'creative':
      return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
    case 'professional':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    case 'abstract':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'vintage':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function getDesignStatusColor(status: AIDesign['status']): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400'
    case 'processing':
      return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400'
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400'
    case 'failed':
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function formatGenerationTime(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`
  }
  return `${ms}ms`
}

export function formatDesignMetric(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

export function formatDesignDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
