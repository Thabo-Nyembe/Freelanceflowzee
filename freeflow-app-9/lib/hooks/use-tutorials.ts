'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

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

export function useTutorials(initialTutorials: Tutorial[] = [], initialStats?: TutorialStats) {
  const [tutorials, setTutorials] = useState<Tutorial[]>(initialTutorials)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const defaultStats: TutorialStats = {
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    totalEnrollments: 0,
    avgCompletionRate: 0
  }

  const calculateStats = useCallback((tutorialList: Tutorial[]): TutorialStats => {
    const withEnrollments = tutorialList.filter(t => (t.enrollments_count || 0) > 0)
    return {
      total: tutorialList.length,
      published: tutorialList.filter(t => t.status === 'published').length,
      draft: tutorialList.filter(t => t.status === 'draft').length,
      scheduled: tutorialList.filter(t => t.status === 'scheduled').length,
      totalEnrollments: tutorialList.reduce((sum, t) => sum + (t.enrollments_count || 0), 0),
      avgCompletionRate: withEnrollments.length > 0
        ? withEnrollments.reduce((sum, t) => {
            const completions = t.completions_count || 0
            const enrollments = t.enrollments_count || 1
            return sum + (completions / enrollments)
          }, 0) / withEnrollments.length * 100
        : 0
    }
  }, [])

  const [stats, setStats] = useState<TutorialStats>(initialStats || calculateStats(initialTutorials))

  useEffect(() => {
    const channel = supabase
      .channel('tutorials_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tutorials' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTutorials(prev => {
              const updated = [payload.new as Tutorial, ...prev]
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setTutorials(prev => {
              const updated = prev.map(t => t.id === payload.new.id ? payload.new as Tutorial : t)
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setTutorials(prev => {
              const updated = prev.filter(t => t.id !== payload.old.id)
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

  return { tutorials, stats, loading }
}
