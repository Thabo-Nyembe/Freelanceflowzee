'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AIGeneration {
  id: string
  user_id: string
  generation_code: string
  title: string
  generation_type: 'content' | 'code' | 'image' | 'summary' | 'email' | 'social' | 'seo'
  template: string | null
  prompt: string
  result: string | null
  model: string
  temperature: number
  max_tokens: number
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost: number
  quality_score: number
  readability_score: number
  seo_score: number
  analysis: Record<string, unknown>
  keywords: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  latency_ms: number
  error_message: string | null
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseAICreateOptions {
  generationType?: AIGeneration['generation_type']
  status?: AIGeneration['status']
  template?: string
}

interface AICreateStats {
  total: number
  completed: number
  pending: number
  failed: number
  totalTokens: number
  totalCost: number
  avgQualityScore: number
  avgLatency: number
  byType: Record<string, number>
}

export function useAICreate(initialGenerations: AIGeneration[] = [], options: UseAICreateOptions = {}) {
  const [generations, setGenerations] = useState<AIGeneration[]>(initialGenerations)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const completedGenerations = generations.filter(g => g.status === 'completed')

  const stats: AICreateStats = {
    total: generations.length,
    completed: generations.filter(g => g.status === 'completed').length,
    pending: generations.filter(g => g.status === 'pending' || g.status === 'processing').length,
    failed: generations.filter(g => g.status === 'failed').length,
    totalTokens: generations.reduce((sum, g) => sum + g.total_tokens, 0),
    totalCost: generations.reduce((sum, g) => sum + g.cost, 0),
    avgQualityScore: completedGenerations.length > 0
      ? completedGenerations.reduce((sum, g) => sum + g.quality_score, 0) / completedGenerations.length
      : 0,
    avgLatency: completedGenerations.length > 0
      ? completedGenerations.reduce((sum, g) => sum + g.latency_ms, 0) / completedGenerations.length
      : 0,
    byType: generations.reduce((acc, g) => {
      acc[g.generation_type] = (acc[g.generation_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const fetchGenerations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('ai_generations')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (options.generationType) {
        query = query.eq('generation_type', options.generationType)
      }
      if (options.status) {
        query = query.eq('status', options.status)
      }
      if (options.template) {
        query = query.eq('template', options.template)
      }

      const { data, error: fetchError } = await query.limit(100)

      if (fetchError) throw fetchError
      setGenerations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch generations')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, options.generationType, options.status, options.template])

  useEffect(() => {
    const channel = supabase
      .channel('ai_generations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_generations' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setGenerations(prev => [payload.new as AIGeneration, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setGenerations(prev => prev.map(g =>
              g.id === payload.new.id ? payload.new as AIGeneration : g
            ))
          } else if (payload.eventType === 'DELETE') {
            setGenerations(prev => prev.filter(g => g.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const createGeneration = useCallback(async (
    prompt: string,
    generationType: AIGeneration['generation_type'] = 'content',
    options?: {
      title?: string
      template?: string
      model?: string
      temperature?: number
      maxTokens?: number
      tags?: string[]
    }
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    setIsGenerating(true)
    try {
      const { data, error } = await supabase
        .from('ai_generations')
        .insert({
          user_id: user.id,
          title: options?.title || `${generationType} Generation`,
          generation_type: generationType,
          template: options?.template || null,
          prompt,
          model: options?.model || 'gpt-4',
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
          tags: options?.tags || [],
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      setGenerations(prev => [data, ...prev])
      return data
    } finally {
      setIsGenerating(false)
    }
  }, [supabase])

  const updateGeneration = useCallback(async (
    generationId: string,
    updates: Partial<Pick<AIGeneration, 'title' | 'result' | 'status' | 'quality_score' | 'tags' | 'error_message'>>
  ) => {
    const { error } = await supabase
      .from('ai_generations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', generationId)

    if (error) throw error
    setGenerations(prev => prev.map(g =>
      g.id === generationId ? { ...g, ...updates } : g
    ))
  }, [supabase])

  const completeGeneration = useCallback(async (
    generationId: string,
    result: string,
    tokenStats: {
      promptTokens: number
      completionTokens: number
      latencyMs: number
      cost: number
    },
    scores?: {
      qualityScore?: number
      readabilityScore?: number
      seoScore?: number
    }
  ) => {
    const { error } = await supabase
      .from('ai_generations')
      .update({
        result,
        status: 'completed',
        prompt_tokens: tokenStats.promptTokens,
        completion_tokens: tokenStats.completionTokens,
        total_tokens: tokenStats.promptTokens + tokenStats.completionTokens,
        latency_ms: tokenStats.latencyMs,
        cost: tokenStats.cost,
        quality_score: scores?.qualityScore || 0,
        readability_score: scores?.readabilityScore || 0,
        seo_score: scores?.seoScore || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', generationId)

    if (error) throw error
  }, [supabase])

  const failGeneration = useCallback(async (generationId: string, errorMessage: string) => {
    await updateGeneration(generationId, {
      status: 'failed',
      error_message: errorMessage
    })
  }, [updateGeneration])

  const deleteGeneration = useCallback(async (generationId: string) => {
    const { error } = await supabase
      .from('ai_generations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', generationId)

    if (error) throw error
    setGenerations(prev => prev.filter(g => g.id !== generationId))
  }, [supabase])

  const regenerate = useCallback(async (generationId: string) => {
    const generation = generations.find(g => g.id === generationId)
    if (!generation) throw new Error('Generation not found')

    return createGeneration(generation.prompt, generation.generation_type, {
      title: `${generation.title} (Regenerated)`,
      template: generation.template || undefined,
      model: generation.model,
      temperature: generation.temperature,
      maxTokens: generation.max_tokens,
      tags: generation.tags
    })
  }, [generations, createGeneration])

  return {
    generations,
    stats,
    isLoading,
    isGenerating,
    error,
    fetchGenerations,
    createGeneration,
    updateGeneration,
    completeGeneration,
    failGeneration,
    deleteGeneration,
    regenerate
  }
}

export function getGenerationTypeColor(type: AIGeneration['generation_type']): string {
  switch (type) {
    case 'content':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'code':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'image':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'summary':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
    case 'email':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'social':
      return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
    case 'seo':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function getGenerationStatusColor(status: AIGeneration['status']): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
    case 'processing':
      return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
    case 'failed':
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800'
  }
}

export function getQualityScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-amber-600 dark:text-amber-400'
  if (score >= 40) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

export function formatGenerationTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`
  }
  return tokens.toString()
}

export function formatGenerationCost(cost: number): string {
  return `$${cost.toFixed(4)}`
}

export function formatGenerationLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`
  }
  return `${ms}ms`
}

export function getGenerationTypeIcon(type: AIGeneration['generation_type']): string {
  switch (type) {
    case 'content': return '📝'
    case 'code': return '💻'
    case 'image': return '🖼️'
    case 'summary': return '📋'
    case 'email': return '📧'
    case 'social': return '📱'
    case 'seo': return '🔍'
    default: return '✨'
  }
}
