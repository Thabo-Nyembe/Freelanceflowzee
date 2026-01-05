'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type VideoProjectStatus = 'draft' | 'editing' | 'rendering' | 'published' | 'archived'
export type RenderStatus = 'queued' | 'processing' | 'completed' | 'failed'

export interface VideoProject {
  id: string
  title: string
  description?: string
  status: VideoProjectStatus
  thumbnail?: string
  thumbnailUrl?: string
  duration: number
  resolution: string
  fps: number
  template?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface VideoAsset {
  id: string
  projectId: string
  filename: string
  originalName: string
  url: string
  type: string
  size: number
  duration?: number
  width?: number
  height?: number
  fps?: number
  codec?: string
  status: 'uploading' | 'ready' | 'error'
  uploadedAt: string
}

export interface RenderJob {
  jobId: string
  projectId: string
  status: RenderStatus
  progress: number
  currentStep?: string
  format: string
  quality: string
  estimatedDuration?: number
  outputUrl?: string
  error?: string
  createdAt: string
}

export interface VideoTemplate {
  id: string
  name: string
  category: string
  thumbnail: string
  description: string
  resolution: string
  duration: number
}

export interface VideoStats {
  totalProjects: number
  totalDuration: number
  totalStorage: number
  publishedVideos: number
  draftVideos: number
  renderingVideos: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockProjects: VideoProject[] = [
  {
    id: 'vp-1',
    title: 'Product Launch Video',
    description: 'Promotional video for new product launch',
    status: 'editing',
    thumbnailUrl: '/images/video-thumb-1.jpg',
    duration: 120,
    resolution: '1920x1080',
    fps: 30,
    userId: 'user_1',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'vp-2',
    title: 'Tutorial Series - Episode 1',
    description: 'Getting started tutorial',
    status: 'published',
    thumbnailUrl: '/images/video-thumb-2.jpg',
    duration: 540,
    resolution: '1920x1080',
    fps: 30,
    userId: 'user_1',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'vp-3',
    title: 'Social Media Promo',
    description: 'Short promo for Instagram/TikTok',
    status: 'draft',
    thumbnailUrl: '/images/video-thumb-3.jpg',
    duration: 30,
    resolution: '1080x1920',
    fps: 60,
    template: 'social-vertical',
    userId: 'user_1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'vp-4',
    title: 'Company Overview',
    description: 'Corporate overview video',
    status: 'rendering',
    thumbnailUrl: '/images/video-thumb-4.jpg',
    duration: 300,
    resolution: '3840x2160',
    fps: 30,
    userId: 'user_1',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const mockAssets: VideoAsset[] = [
  {
    id: 'va-1',
    projectId: 'vp-1',
    filename: 'intro-clip.mp4',
    originalName: 'intro_final_v2.mp4',
    url: '/uploads/videos/intro-clip.mp4',
    type: 'video/mp4',
    size: 15000000,
    duration: 15,
    width: 1920,
    height: 1080,
    fps: 30,
    codec: 'h264',
    status: 'ready',
    uploadedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'va-2',
    projectId: 'vp-1',
    filename: 'product-shot.mp4',
    originalName: 'product_hero_4k.mp4',
    url: '/uploads/videos/product-shot.mp4',
    type: 'video/mp4',
    size: 45000000,
    duration: 30,
    width: 3840,
    height: 2160,
    fps: 60,
    codec: 'h265',
    status: 'ready',
    uploadedAt: new Date(Date.now() - 43200000).toISOString()
  }
]

const mockRenderJobs: RenderJob[] = [
  {
    jobId: 'rj-1',
    projectId: 'vp-4',
    status: 'processing',
    progress: 65,
    currentStep: 'Encoding video',
    format: 'mp4',
    quality: 'high',
    estimatedDuration: 180,
    createdAt: new Date(Date.now() - 600000).toISOString()
  }
]

const mockTemplates: VideoTemplate[] = [
  { id: 't-1', name: 'YouTube Intro', category: 'intro', thumbnail: '/templates/yt-intro.jpg', description: 'Professional YouTube channel intro', resolution: '1920x1080', duration: 10 },
  { id: 't-2', name: 'Product Showcase', category: 'promo', thumbnail: '/templates/product.jpg', description: 'E-commerce product showcase', resolution: '1920x1080', duration: 30 },
  { id: 't-3', name: 'Social Story', category: 'social', thumbnail: '/templates/story.jpg', description: 'Instagram/TikTok story template', resolution: '1080x1920', duration: 15 },
  { id: 't-4', name: 'Corporate Intro', category: 'corporate', thumbnail: '/templates/corp.jpg', description: 'Professional business intro', resolution: '1920x1080', duration: 15 },
  { id: 't-5', name: 'Tutorial Opener', category: 'education', thumbnail: '/templates/tutorial.jpg', description: 'Educational content opener', resolution: '1920x1080', duration: 8 },
  { id: 't-6', name: 'Cinematic Title', category: 'cinematic', thumbnail: '/templates/cinematic.jpg', description: 'Movie-style title sequence', resolution: '3840x2160', duration: 12 }
]

const mockStats: VideoStats = {
  totalProjects: mockProjects.length,
  totalDuration: mockProjects.reduce((sum, p) => sum + p.duration, 0),
  totalStorage: mockAssets.reduce((sum, a) => sum + a.size, 0),
  publishedVideos: mockProjects.filter(p => p.status === 'published').length,
  draftVideos: mockProjects.filter(p => p.status === 'draft').length,
  renderingVideos: mockProjects.filter(p => p.status === 'rendering').length
}

// ============================================================================
// HOOK
// ============================================================================

interface UseVideoStudioOptions {
  
  autoRefresh?: boolean
  refreshInterval?: number
  projectId?: string
}

export function useVideoStudio(options: UseVideoStudioOptions = {}) {
  const {
    
    autoRefresh = false,
    refreshInterval = 15000,
    projectId,
  } = options

  // State
  const [projects, setProjects] = useState<VideoProject[]>([])
  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null)
  const [assets, setAssets] = useState<VideoAsset[]>([])
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>([])
  const [templates, setTemplates] = useState<VideoTemplate[]>([])
  const [stats, setStats] = useState<VideoStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)

  // Transform database format to API format
  const transformProject = (dbProject: any): VideoProject => ({
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description || '',
    status: dbProject.status || 'draft',
    thumbnailUrl: dbProject.thumbnail_url || dbProject.thumbnailUrl,
    duration: dbProject.duration || 0,
    resolution: dbProject.resolution || '1920x1080',
    fps: dbProject.fps || 30,
    template: dbProject.template,
    userId: dbProject.user_id || dbProject.userId,
    createdAt: dbProject.created_at || dbProject.createdAt,
    updatedAt: dbProject.updated_at || dbProject.updatedAt
  })

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/video/projects')
      const result = await response.json()

      if (result.success && result.projects?.length > 0) {
        const transformed = result.projects.map(transformProject)
        setProjects(transformed)
        calculateStats(transformed)
        return transformed
      } else {
        // Fallback to mock data if no projects
        setProjects([])
        setStats(null)
        return []
      }
    } catch (err) {
      console.error('Error fetching video projects:', err)
      setProjects([])
      setStats(null)
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'))
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch single project
  const fetchProject = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/video/projects/${id}`)
      const result = await response.json()

      if (result.success && result.project) {
        const transformed = transformProject(result.project)
        setCurrentProject(transformed)
        return transformed
      }
      return null
    } catch (err) {
      console.error('Error fetching project:', err)
      return null
    }
  }, [])

  // Fetch project assets
  const fetchAssets = useCallback(async (projectIdParam?: string) => {
    const targetProjectId = projectIdParam || projectId

    try {
      const response = await fetch('/api/video/upload')
      const result = await response.json()

      if (result.success && result.videos?.length > 0) {
        setAssets(result.videos)
        return result.videos
      } else {
        setAssets(mockAssets)
        return []
      }
    } catch (err) {
      console.error('Error fetching assets:', err)
      setAssets(mockAssets)
      return []
    }
  }, [ projectId])

  // Fetch render jobs
  const fetchRenderJobs = useCallback(async () => {
    // Render jobs are typically short-lived, use mock for demo
    setRenderJobs(mockRenderJobs)
    return []
  }, [])

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    // Templates are static, always use mock
    setTemplates([])
    return []
  }, [])

  // Calculate stats from projects
  const calculateStats = (projectList: VideoProject[]) => {
    const newStats: VideoStats = {
      totalProjects: projectList.length,
      totalDuration: projectList.reduce((sum, p) => sum + p.duration, 0),
      totalStorage: assets.reduce((sum, a) => sum + a.size, 0),
      publishedVideos: projectList.filter(p => p.status === 'published').length,
      draftVideos: projectList.filter(p => p.status === 'draft').length,
      renderingVideos: projectList.filter(p => p.status === 'rendering').length
    }
    setStats(newStats)
  }

  // Create project
  const createProject = useCallback(async (data: {
    title: string
    description?: string
    resolution?: string
    fps?: number
    template?: string
  }) => {
    try {
      const response = await fetch('/api/video/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      if (result.success) {
        await fetchProjects()
        return { success: true, project: result.project }
      }
      return { success: false, error: result.error || 'Failed to create project' }
    } catch (err) {
      console.error('Error creating project:', err)
      return { success: false, error: 'Failed to create project' }
    }
  }, [fetchProjects])

  // Update project
  const updateProject = useCallback(async (id: string, data: Partial<VideoProject>) => {
    try {
      const response = await fetch(`/api/video/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      if (result.success) {
        await fetchProjects()
        return { success: true, project: result.project }
      }
      return { success: false, error: result.error || 'Failed to update project' }
    } catch (err) {
      console.error('Error updating project:', err)
      return { success: false, error: 'Failed to update project' }
    }
  }, [fetchProjects])

  // Delete project
  const deleteProject = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/video/projects/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        await fetchProjects()
        return { success: true }
      }
      return { success: false, error: result.error || 'Failed to delete project' }
    } catch (err) {
      console.error('Error deleting project:', err)
      return { success: false, error: 'Failed to delete project' }
    }
  }, [fetchProjects])

  // Duplicate project
  const duplicateProject = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/video/projects/${id}/duplicate`, {
        method: 'POST'
      })

      const result = await response.json()
      if (result.success) {
        await fetchProjects()
        return { success: true, project: result.project }
      }
      return { success: false, error: result.error || 'Failed to duplicate project' }
    } catch (err) {
      console.error('Error duplicating project:', err)
      return { success: false, error: 'Failed to duplicate project' }
    }
  }, [fetchProjects])

  // Publish project
  const publishProject = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/video/projects/${id}/publish`, {
        method: 'POST'
      })

      const result = await response.json()
      if (result.success) {
        await fetchProjects()
        return { success: true }
      }
      return { success: false, error: result.error || 'Failed to publish project' }
    } catch (err) {
      console.error('Error publishing project:', err)
      return { success: false, error: 'Failed to publish project' }
    }
  }, [fetchProjects])

  // Upload video asset
  const uploadAsset = useCallback(async (file: File, projectIdParam?: string) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (projectIdParam || projectId) {
        formData.append('projectId', projectIdParam || projectId!)
      }

      // Simulate progress (since fetch doesn't support progress natively)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/video/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()
      if (result.success) {
        await fetchAssets()
        return { success: true, video: result.video }
      }
      return { success: false, error: result.error || 'Failed to upload video' }
    } catch (err) {
      console.error('Error uploading video:', err)
      return { success: false, error: 'Failed to upload video' }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [fetchAssets, projectId])

  // Start render job
  const startRender = useCallback(async (renderData: {
    projectId: string
    format: string
    quality?: string
    clips?: any[]
    effects?: any[]
    settings?: any
  }) => {
    try {
      const response = await fetch('/api/video/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(renderData)
      })

      const result = await response.json()
      if (result.success) {
        // Add to render jobs
        const newJob: RenderJob = {
          jobId: result.jobId,
          projectId: renderData.projectId,
          status: 'queued',
          progress: 0,
          format: renderData.format,
          quality: renderData.quality || 'high',
          estimatedDuration: result.estimatedDuration,
          createdAt: new Date().toISOString()
        }
        setRenderJobs(prev => [newJob, ...prev])

        // Update project status
        await updateProject(renderData.projectId, { status: 'rendering' as VideoProjectStatus })

        return { success: true, jobId: result.jobId }
      }
      return { success: false, error: result.error || 'Failed to start render' }
    } catch (err) {
      console.error('Error starting render:', err)
      return { success: false, error: 'Failed to start render' }
    }
  }, [updateProject])

  // Check render status
  const checkRenderStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/video/render?jobId=${jobId}`)
      const result = await response.json()

      // Update local state
      setRenderJobs(prev => prev.map(job =>
        job.jobId === jobId
          ? { ...job, ...result }
          : job
      ))

      return result
    } catch (err) {
      console.error('Error checking render status:', err)
      return null
    }
  }, [])

  // Export video
  const exportVideo = useCallback(async (exportData: {
    projectId: string
    format: string
    quality?: string
  }) => {
    try {
      const response = await fetch('/api/video/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      })

      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error exporting video:', err)
      return { success: false, error: 'Failed to export video' }
    }
  }, [])

  // Refresh all data
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await Promise.all([
      fetchProjects(),
      fetchAssets(),
      fetchRenderJobs(),
      fetchTemplates()
    ])
    if (projectId) {
      await fetchProject(projectId)
    }
  }, [fetchProjects, fetchAssets, fetchRenderJobs, fetchTemplates, fetchProject, projectId])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      fetchProjects()
      // Check status of active render jobs
      renderJobs
        .filter(job => job.status === 'queued' || job.status === 'processing')
        .forEach(job => checkRenderStatus(job.jobId))
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchProjects, renderJobs, checkRenderStatus])

  // Computed values
  const hasProjects = useMemo(() => projects.length > 0, [projects])

  const recentProjects = useMemo(() =>
    [...projects].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ).slice(0, 5),
  [projects])

  const projectsByStatus = useMemo(() => {
    const grouped: Record<VideoProjectStatus, VideoProject[]> = {
      draft: [],
      editing: [],
      rendering: [],
      published: [],
      archived: []
    }
    projects.forEach(project => {
      grouped[project.status].push(project)
    })
    return grouped
  }, [projects])

  const activeRenderJobs = useMemo(() =>
    renderJobs.filter(job => job.status === 'queued' || job.status === 'processing'),
  [renderJobs])

  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, VideoTemplate[]> = {}
    templates.forEach(template => {
      if (!grouped[template.category]) {
        grouped[template.category] = []
      }
      grouped[template.category].push(template)
    })
    return grouped
  }, [templates])

  return {
    // Data
    projects,
    currentProject,
    assets,
    renderJobs,
    templates,
    stats,
    recentProjects,
    projectsByStatus,
    activeRenderJobs,
    templatesByCategory,

    // State
    isLoading,
    error,
    hasProjects,
    uploadProgress,
    isUploading,

    // Fetch methods
    refresh,
    fetchProjects,
    fetchProject,
    fetchAssets,
    fetchRenderJobs,
    fetchTemplates,

    // Project actions
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    publishProject,

    // Asset actions
    uploadAsset,

    // Render actions
    startRender,
    checkRenderStatus,
    exportVideo,
  }
}

export default useVideoStudio
