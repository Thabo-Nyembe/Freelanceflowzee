'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Animation {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string
  status: 'draft' | 'rendering' | 'ready' | 'failed' | 'archived'
  duration_seconds: number
  resolution: string
  fps: number
  file_size_bytes: number
  thumbnail_url: string | null
  video_url: string | null
  likes_count: number
  downloads_count: number
  views_count: number
  is_template: boolean
  preset_type: string | null
  tags: string[]
  metadata: Record<string, any>
  rendered_at: string | null
  created_at: string
  updated_at: string
}

export interface AnimationStats {
  total: number
  draft: number
  rendering: number
  ready: number
  templates: number
  totalLikes: number
  totalDownloads: number
  totalViews: number
  avgRenderTime: number
}

export interface AnimationInput {
  title: string
  description?: string
  category?: string
  resolution?: string
  fps?: number
  is_template?: boolean
  preset_type?: string
  tags?: string[]
}

export function useAnimations(initialAnimations: Animation[] = [], initialStats: AnimationStats) {
  const [animations, setAnimations] = useState<Animation[]>(initialAnimations)
  const [stats, setStats] = useState<AnimationStats>(initialStats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Calculate stats from animations
  const calculateStats = useCallback((anims: Animation[]): AnimationStats => {
    return {
      total: anims.length,
      draft: anims.filter(a => a.status === 'draft').length,
      rendering: anims.filter(a => a.status === 'rendering').length,
      ready: anims.filter(a => a.status === 'ready').length,
      templates: anims.filter(a => a.is_template).length,
      totalLikes: anims.reduce((sum, a) => sum + a.likes_count, 0),
      totalDownloads: anims.reduce((sum, a) => sum + a.downloads_count, 0),
      totalViews: anims.reduce((sum, a) => sum + a.views_count, 0),
      avgRenderTime: anims.length > 0 ? anims.reduce((sum, a) => sum + a.duration_seconds, 0) / anims.length : 0
    }
  }, [])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('animations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'animations' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAnimations(prev => {
              const updated = [payload.new as Animation, ...prev]
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setAnimations(prev => {
              const updated = prev.map(a => a.id === payload.new.id ? payload.new as Animation : a)
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setAnimations(prev => {
              const updated = prev.filter(a => a.id !== payload.old.id)
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

  const createAnimation = useCallback(async (input: AnimationInput) => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertError } = await supabase
        .from('animations')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          category: input.category || 'general',
          resolution: input.resolution || '1080p',
          fps: input.fps || 30,
          is_template: input.is_template || false,
          preset_type: input.preset_type || null,
          tags: input.tags || []
        })
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create animation')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const updateAnimation = useCallback(async (id: string, updates: Partial<AnimationInput>) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('animations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update animation')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const deleteAnimation = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('animations')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete animation')
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const startRender = useCallback(async (id: string) => {
    return updateAnimation(id, { status: 'rendering' } as any)
  }, [updateAnimation])

  const likeAnimation = useCallback(async (id: string) => {
    const animation = animations.find(a => a.id === id)
    if (!animation) return null

    const { data, error: updateError } = await supabase
      .from('animations')
      .update({ likes_count: animation.likes_count + 1 })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return null
    }
    return data
  }, [supabase, animations])

  const downloadAnimation = useCallback(async (id: string) => {
    const animation = animations.find(a => a.id === id)
    if (!animation) return null

    const { data, error: updateError } = await supabase
      .from('animations')
      .update({ downloads_count: animation.downloads_count + 1 })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return null
    }
    return data
  }, [supabase, animations])

  return {
    animations,
    stats,
    loading,
    error,
    createAnimation,
    updateAnimation,
    deleteAnimation,
    startRender,
    likeAnimation,
    downloadAnimation
  }
}
