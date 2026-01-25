'use client'

import { useCallback, useState, useMemo } from 'react'
import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export interface Tutorial {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'published' | 'draft' | 'scheduled' | 'archived'
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  format: 'video' | 'text' | 'interactive' | 'mixed'
  duration_minutes?: number
  lessons_count?: number
  author?: string
  published_at?: string
  views_count?: number
  enrollments_count?: number
  completions_count?: number
  rating?: number
  reviews_count?: number
  likes_count?: number
  comments_count?: number
  thumbnail_url?: string
  video_url?: string
  content?: string
  tags?: string[]
  prerequisites?: string[]
  created_at: string
  updated_at: string
}

export interface TutorialStats {
  total: number
  published: number
  draft: number
  scheduled: number
  totalEnrollments: number
  avgCompletionRate: number
}

export interface CreateTutorialInput {
  title: string
  description?: string
  status?: 'published' | 'draft' | 'scheduled' | 'archived'
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  format?: 'video' | 'text' | 'interactive' | 'mixed'
  duration_minutes?: number
  lessons_count?: number
  author?: string
  thumbnail_url?: string
  video_url?: string
  content?: string
  tags?: string[]
  prerequisites?: string[]
}

export interface UpdateTutorialInput {
  id: string
  title?: string
  description?: string
  status?: 'published' | 'draft' | 'scheduled' | 'archived'
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  format?: 'video' | 'text' | 'interactive' | 'mixed'
  duration_minutes?: number
  lessons_count?: number
  author?: string
  published_at?: string
  views_count?: number
  enrollments_count?: number
  completions_count?: number
  rating?: number
  reviews_count?: number
  thumbnail_url?: string
  video_url?: string
  content?: string
  tags?: string[]
  prerequisites?: string[]
}

export interface UseTutorialsOptions {
  status?: 'published' | 'draft' | 'scheduled' | 'archived' | 'all'
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all'
  limit?: number
}

export function useTutorials(options: UseTutorialsOptions = {}) {
  const { status, level, limit } = options
  const [mutationLoading, setMutationLoading] = useState(false)
  const [mutationError, setMutationError] = useState<Error | null>(null)

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (level && level !== 'all') filters.level = level

  const queryOptions: any = {
    table: 'tutorials',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true,
    softDelete: false
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Tutorial>(queryOptions)

  const { create, update, remove } = useSupabaseMutation({
    table: 'tutorials',
    onSuccess: () => {
      refetch()
    },
    onError: (err) => {
      setMutationError(err)
    }
  })

  // Calculate stats from the tutorials data
  const stats = useMemo((): TutorialStats => {
    const tutorials = data || []
    const withEnrollments = tutorials.filter(t => (t.enrollments_count || 0) > 0)
    return {
      total: tutorials.length,
      published: tutorials.filter(t => t.status === 'published').length,
      draft: tutorials.filter(t => t.status === 'draft').length,
      scheduled: tutorials.filter(t => t.status === 'scheduled').length,
      totalEnrollments: tutorials.reduce((sum, t) => sum + (t.enrollments_count || 0), 0),
      avgCompletionRate: withEnrollments.length > 0
        ? withEnrollments.reduce((sum, t) => {
            const completions = t.completions_count || 0
            const enrollments = t.enrollments_count || 1
            return sum + (completions / enrollments)
          }, 0) / withEnrollments.length * 100
        : 0
    }
  }, [data])

  // Create a new tutorial
  const createTutorial = useCallback(async (input: CreateTutorialInput) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const tutorialData = {
        title: input.title,
        description: input.description || null,
        status: input.status || 'draft',
        level: input.level || 'beginner',
        format: input.format || 'video',
        duration_minutes: input.duration_minutes || 0,
        lessons_count: input.lessons_count || 0,
        author: input.author || null,
        thumbnail_url: input.thumbnail_url || null,
        video_url: input.video_url || null,
        content: input.content || null,
        tags: input.tags || [],
        prerequisites: input.prerequisites || [],
        views_count: 0,
        enrollments_count: 0,
        completions_count: 0,
        rating: 0,
        reviews_count: 0,
        likes_count: 0,
        comments_count: 0
      }
      const result = await create(tutorialData)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create tutorial')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [create])

  // Update an existing tutorial
  const updateTutorial = useCallback(async (input: UpdateTutorialInput) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const { id, ...updateData } = input
      const result = await update(id, updateData)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update tutorial')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [update])

  // Delete a tutorial
  const deleteTutorial = useCallback(async (id: string) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      await remove(id)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete tutorial')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [remove])

  // Publish a tutorial
  const publishTutorial = useCallback(async (id: string) => {
    return updateTutorial({
      id,
      status: 'published',
      published_at: new Date().toISOString()
    })
  }, [updateTutorial])

  // Archive a tutorial
  const archiveTutorial = useCallback(async (id: string) => {
    return updateTutorial({
      id,
      status: 'archived'
    })
  }, [updateTutorial])

  // Increment view count
  const incrementViews = useCallback(async (id: string, currentViews: number) => {
    return updateTutorial({
      id,
      views_count: currentViews + 1
    })
  }, [updateTutorial])

  return {
    tutorials: data,
    stats,
    loading,
    error,
    refetch,
    mutationLoading,
    mutationError,
    createTutorial,
    updateTutorial,
    deleteTutorial,
    publishTutorial,
    archiveTutorial,
    incrementViews
  }
}
