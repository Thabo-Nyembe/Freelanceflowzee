'use client'

/**
 * World-Class Motion Graphics Studio
 * Complete implementation of motion design and animation tools
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Play, Pause, SkipBack, SkipForward, Film, Layers,
  Type, Image, Video, Zap, Download, Upload,
  Plus, Eye, Grid3x3, Sparkles, RotateCw, Maximize2, Move, Copy, Lock, Share2, BarChart3, Filter, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import {
  MotionProject
} from '@/lib/motion-graphics-types'
import {
  MOTION_TEMPLATES,
  formatDuration,
  formatFileSize,
  formatResolution,
  calculateStoragePercentage
} from '@/lib/motion-graphics-utils'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createFeatureLogger('MotionGraphicsPage')

type ViewMode = 'projects' | 'editor' | 'templates' | 'assets'
type EditorPanel = 'layers' | 'timeline' | 'properties' | 'effects'

export default function MotionGraphicsPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // Database state
  const [motionProjects, setMotionProjects] = useState<any[]>([])
  const [motionStats, setMotionStats] = useState<any>(null)
  const [motionAssets, setMotionAssets] = useState<any[]>([])

  const [viewMode, setViewMode] = useState<ViewMode>('projects')
  const [selectedProject, setSelectedProject] = useState<MotionProject | null>(null)
  const [activePanel, setActivePanel] = useState<EditorPanel>('layers')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedLayers, setSelectedLayers] = useState<string[]>([])
  const [zoomLevel, setZoomLevel] = useState([100])

  const storagePercentage = calculateStoragePercentage(
    motionStats?.storageUsed || 0,
    motionStats?.storageLimit || 1
  )

  // A+++ LOAD MOTION GRAPHICS DATA
  useEffect(() => {
    const loadMotionGraphicsData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading motion graphics data', { userId })

        const { getMotionProjects, getMotionStats } = await import('@/lib/motion-graphics-queries')

        const [projectsResult, statsResult] = await Promise.all([
          getMotionProjects(userId),
          getMotionStats(userId)
        ])

        setMotionProjects(projectsResult.data || [])
        setMotionStats(statsResult.data || null)

        setIsLoading(false)
        toast.success('Motion graphics loaded', {
          description: `${projectsResult.data?.length || 0} projects from database`
        })
        logger.info('Motion graphics data loaded successfully', {
          projectsCount: projectsResult.data?.length
        })
        announce('Motion graphics studio loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load motion graphics studio'
        setError(errorMessage)
        setIsLoading(false)
        logger.error('Failed to load motion graphics data', { error: errorMessage, userId })
        toast.error('Failed to load motion graphics', { description: errorMessage })
        announce('Error loading motion graphics studio', 'assertive')
      }
    }

    loadMotionGraphicsData()
  }, [userId, announce])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Premium Background */}
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent opacity-50" />

        {/* Animated Gradient Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-fuchsia-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center">
              <CardSkeleton />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <CardSkeleton />
            <div className="flex justify-center gap-2">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Premium Background */}
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent opacity-50" />

        {/* Animated Gradient Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-fuchsia-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-2xl mx-auto">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent opacity-50" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-fuchsia-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <ScrollReveal variant="slide-up" duration={0.6}>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 rounded-full text-sm font-medium mb-6 border border-violet-500/30"
              >
                <Film className="w-4 h-4" />
                Motion Graphics
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Studio Pro
                </Badge>
              </motion.div>

              <TextShimmer className="text-5xl md:text-6xl font-bold mb-6" duration={2}>
                Create Stunning Animations
              </TextShimmer>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Professional motion design tools with keyframe animation, effects, and templates
              </p>
            </div>
          </ScrollReveal>

          {/* Stats Row */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Projects', value: motionStats?.totalProjects || 0, icon: Film, color: 'violet' },
                { label: 'Animations', value: motionStats?.totalAnimations || 0, icon: Zap, color: 'purple' },
                { label: 'Exports', value: motionStats?.totalExports || 0, icon: Download, color: 'fuchsia' },
                { label: 'Templates', value: MOTION_TEMPLATES.length, icon: Grid3x3, color: 'pink' }
              ].map((stat, index) => (
                <LiquidGlassCard key={index} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/20 flex items-center justify-center shrink-0`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          </ScrollReveal>

          {/* Storage Info */}
          <ScrollReveal variant="slide-up" duration={0.6} delay={0.2}>
            <LiquidGlassCard className="p-4 mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium text-white">Storage Usage</span>
                </div>
                <span className="text-sm text-gray-400">
                  {formatFileSize(motionStats?.storageUsed || 0)} / {formatFileSize(motionStats?.storageLimit || 0)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          {/* View Mode Tabs */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.3}>
            <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
              {[
                { id: 'projects' as ViewMode, label: 'Projects', icon: Film },
                { id: 'editor' as ViewMode, label: 'Editor', icon: Layers },
                { id: 'templates' as ViewMode, label: 'Templates', icon: Grid3x3 },
                { id: 'assets' as ViewMode, label: 'Assets', icon: Image }
              ].map((mode) => (
                <Button
                  key={mode.id}
                  variant={viewMode === mode.id ? "default" : "outline"}
                  onClick={() => setViewMode(mode.id)}
                  className={viewMode === mode.id ? "bg-gradient-to-r from-violet-600 to-purple-600" : "border-gray-700 hover:bg-slate-800"}
                >
                  <mode.icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </ScrollReveal>

          {/* Projects View */}
          {viewMode === 'projects' && (
            <div className="space-y-6">
              {/* Create New Project */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full"
              >
                <LiquidGlassCard className="p-6 border-2 border-dashed border-gray-700 hover:border-violet-500/50 transition-colors">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-violet-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-white">Create New Project</h3>
                      <p className="text-sm text-gray-400">Start a new motion graphics project</p>
                    </div>
                  </div>
                </LiquidGlassCard>
              </motion.button>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {motionProjects.map((project) => (
                  <motion.div key={project.id} whileHover={{ scale: 1.02 }}>
                    <LiquidGlassCard className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">{project.name}</h3>
                            <p className="text-sm text-gray-400">{project.description}</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {project.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400 block">Duration</span>
                            <span className="text-white font-medium">{formatDuration(project.duration)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Resolution</span>
                            <span className="text-white font-medium">{formatResolution(project.width, project.height)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">FPS</span>
                            <span className="text-white font-medium">{project.frameRate}</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-700 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-gray-700 hover:bg-slate-800"
                            onClick={() => {
                              setSelectedProject(project)
                              setViewMode('editor')
                            }}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Open
                          </Button>
                          <Button variant="outline" size="icon" className="border-gray-700 hover:bg-slate-800">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="border-gray-700 hover:bg-slate-800">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </LiquidGlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Editor View */}
          {viewMode === 'editor' && (
            <div className="space-y-6">
              {/* Toolbar */}
              <LiquidGlassCard className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="border-gray-700 hover:bg-slate-800">
                      <Move className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="border-gray-700 hover:bg-slate-800">
                      <Type className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="border-gray-700 hover:bg-slate-800">
                      <Image className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="border-gray-700 hover:bg-slate-800">
                      <Video className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-700" />
                    <Button variant="outline" size="icon" className="border-gray-700 hover:bg-slate-800">
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="border-gray-700 hover:bg-slate-800">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Zoom:</span>
                    <Slider
                      value={zoomLevel}
                      onValueChange={setZoomLevel}
                      min={25}
                      max={400}
                      step={25}
                      className="w-32"
                    />
                    <span className="text-sm text-white font-medium w-12">{zoomLevel[0]}%</span>
                  </div>
                </div>
              </LiquidGlassCard>

              {/* Canvas Area */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Layers Panel */}
                <div className="lg:col-span-1">
                  <LiquidGlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white">Layers</h3>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {['Text Layer', 'Shape Layer', 'Image Layer'].map((layer, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg border border-gray-700 hover:border-violet-500/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Layers className="w-4 h-4 text-violet-400 shrink-0" />
                            <span className="text-sm text-white truncate">{layer}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Lock className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </LiquidGlassCard>
                </div>

                {/* Canvas */}
                <div className="lg:col-span-2">
                  <LiquidGlassCard className="p-6">
                    <div className="aspect-video bg-slate-950 rounded-lg border border-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Canvas Preview</p>
                        <p className="text-sm text-gray-500 mt-2">1920x1080 • 30fps</p>
                      </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 w-16">00:00:00</span>
                        <Slider
                          value={[currentTime]}
                          onValueChange={(value) => setCurrentTime(value[0])}
                          min={0}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-400 w-16">00:00:15</span>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="icon" className="border-gray-700 hover:bg-slate-800">
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={handlePlayPause}
                          className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-purple-600"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </Button>
                        <Button variant="outline" size="icon" className="border-gray-700 hover:bg-slate-800">
                          <SkipForward className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </LiquidGlassCard>
                </div>

                {/* Properties Panel */}
                <div className="lg:col-span-1">
                  <LiquidGlassCard className="p-6">
                    <h3 className="font-semibold text-white mb-4">Properties</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-2">Position</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="X"
                            className="bg-slate-900/50 border-gray-700 text-sm"
                          />
                          <Input
                            type="number"
                            placeholder="Y"
                            className="bg-slate-900/50 border-gray-700 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-gray-400 block mb-2">Scale</label>
                        <Slider
                          defaultValue={[100]}
                          min={0}
                          max={200}
                          step={1}
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-400 block mb-2">Rotation</label>
                        <Slider
                          defaultValue={[0]}
                          min={0}
                          max={360}
                          step={1}
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-400 block mb-2">Opacity</label>
                        <Slider
                          defaultValue={[100]}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>
                  </LiquidGlassCard>
                </div>
              </div>
            </div>
          )}

          {/* Templates View */}
          {viewMode === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOTION_TEMPLATES.map((template) => (
                <motion.div key={template.id} whileHover={{ scale: 1.02 }}>
                  <LiquidGlassCard className="p-6 h-full">
                    <div className="space-y-4">
                      <div className="aspect-video bg-slate-950 rounded-lg border border-gray-700 flex items-center justify-center mb-4">
                        <Film className="w-12 h-12 text-gray-600" />
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                          <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                        </div>
                        {template.popularity >= 90 && (
                          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                            <Star className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-400">{template.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400 block">Duration</span>
                          <span className="text-white font-medium">{formatDuration(template.duration)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Resolution</span>
                          <span className="text-white font-medium">{formatResolution(template.width, template.height)}</span>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600">
                        <Zap className="w-4 h-4 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </LiquidGlassCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Assets View */}
          {viewMode === 'assets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search assets..."
                    className="w-64 bg-slate-900/50 border-gray-700"
                  />
                  <Button variant="outline" size="icon" className="border-gray-700 hover:bg-slate-800">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Asset
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {motionAssets.map((asset) => (
                  <motion.div key={asset.id} whileHover={{ scale: 1.05 }}>
                    <LiquidGlassCard className="p-4">
                      <div className="space-y-3">
                        <div className="aspect-square bg-slate-950 rounded-lg border border-gray-700 flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-600" />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-white truncate">{asset.name}</p>
                          <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                            <span className="uppercase">{asset.format}</span>
                            <span>{formatFileSize(asset.size)}</span>
                          </div>
                        </div>
                      </div>
                    </LiquidGlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
