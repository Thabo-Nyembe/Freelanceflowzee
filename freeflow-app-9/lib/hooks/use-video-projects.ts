'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export interface VideoProject {
  id: string
  user_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_url: string | null
  duration_seconds: number
  file_size_bytes: number
  status: 'draft' | 'processing' | 'ready' | 'failed' | 'archived'
  views_count: number
  likes_count: number
  comments_count: number
  tags: string[]
  category: string | null
  ai_analysis: Record<string, any>
  has_captions: boolean
  has_thumbnail: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  rendered_at: string | null
}

export interface VideoStats {
  total: number
  draft: number
  processing: number
  ready: number
  totalViews: number
  totalLikes: number
  avgDuration: number
}

export function useVideoProjects(initialProjects: VideoProject[] = [], initialStats?: VideoStats) {
  const [projects, setProjects] = useState<VideoProject[]>(initialProjects)
  const [stats, setStats] = useState<VideoStats>(initialStats || {
    total: 0,
    draft: 0,
    processing: 0,
    ready: 0,
    totalViews: 0,
    totalLikes: 0,
    avgDuration: 0
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const calculateStats = useCallback((projectsList: VideoProject[]): VideoStats => {
    const totalDuration = projectsList.reduce((sum, p) => sum + p.duration_seconds, 0)
    return {
      total: projectsList.length,
      draft: projectsList.filter(p => p.status === 'draft').length,
      processing: projectsList.filter(p => p.status === 'processing').length,
      ready: projectsList.filter(p => p.status === 'ready').length,
      totalViews: projectsList.reduce((sum, p) => sum + p.views_count, 0),
      totalLikes: projectsList.reduce((sum, p) => sum + p.likes_count, 0),
      avgDuration: projectsList.length > 0 ? Math.round(totalDuration / projectsList.length) : 0
    }
  }, [])

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('video_projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
      setStats(calculateStats(data || []))
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch video projects',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, calculateStats])

  const createProject = useCallback(async (projectData: Partial<VideoProject>) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('video_projects')
        .insert({
          ...projectData,
          user_id: user.id,
          tags: projectData.tags || [],
          ai_analysis: projectData.ai_analysis || {},
          metadata: projectData.metadata || {}
        })
        .select()
        .single()

      if (error) throw error

      const updatedProjects = [data, ...projects]
      setProjects(updatedProjects)
      setStats(calculateStats(updatedProjects))

      toast({
        title: 'Success',
        description: 'Video project created successfully'
      })

      return data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create video project',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, projects, calculateStats])

  const updateProject = useCallback(async (id: string, updates: Partial<VideoProject>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('video_projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updatedProjects = projects.map(p => p.id === id ? data : p)
      setProjects(updatedProjects)
      setStats(calculateStats(updatedProjects))

      toast({
        title: 'Success',
        description: 'Video project updated successfully'
      })

      return data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update video project',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, projects, calculateStats])

  const deleteProject = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('video_projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      const updatedProjects = projects.filter(p => p.id !== id)
      setProjects(updatedProjects)
      setStats(calculateStats(updatedProjects))

      toast({
        title: 'Success',
        description: 'Video project deleted successfully'
      })

      return true
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete video project',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, projects, calculateStats])

  const processVideo = useCallback(async (id: string) => {
    await updateProject(id, { status: 'processing' })
    // Simulate processing
    setTimeout(async () => {
      await updateProject(id, {
        status: 'ready',
        rendered_at: new Date().toISOString()
      })
    }, 3000)
    return true
  }, [updateProject])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('video_projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_projects'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProjects(prev => {
              const updated = [payload.new as VideoProject, ...prev]
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setProjects(prev => {
              const updated = prev.map(p =>
                p.id === payload.new.id ? payload.new as VideoProject : p
              )
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setProjects(prev => {
              const updated = prev.filter(p => p.id !== payload.old.id)
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

  return {
    projects,
    stats,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    processVideo
  }
}
