'use client'

import { useState } from 'react'
import { useVideoProjects, VideoProject, VideoStats } from '@/lib/hooks/use-video-projects'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ProgressCard,
  ActivityFeed,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  Video,
  Play,
  Plus,
  Upload,
  Camera,
  Scissors,
  Brain,
  Eye,
  Share2,
  TrendingUp,
  Settings,
  Film,
  Wand2,
  Target,
  Clock,
  X,
  Loader2,
  Trash2,
  RefreshCw,
  Pencil,
  Layers
} from 'lucide-react'

interface VideoStudioClientProps {
  initialProjects: VideoProject[]
  initialStats: VideoStats
}

export default function VideoStudioClient({ initialProjects, initialStats }: VideoStudioClientProps) {
  const {
    projects,
    stats,
    loading,
    createProject,
    updateProject,
    deleteProject,
    processVideo
  } = useVideoProjects(initialProjects, initialStats)

  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'projects' | 'templates' | 'assets'>('projects')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    description: ''
  })

  const handleCreateProject = async () => {
    if (!newProject.title.trim()) return
    await createProject(newProject)
    setShowCreateModal(false)
    setNewProject({ title: '', description: '' })
  }

  const handleProcessVideo = async (id: string) => {
    setIsProcessing(true)
    await processVideo(id)
    setTimeout(() => setIsProcessing(false), 3000)
  }

  const displayStats = [
    {
      label: 'Total Videos',
      value: stats.total.toString(),
      change: 12.5,
      icon: <Video className="w-5 h-5" />
    },
    {
      label: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      change: 25.3,
      icon: <Eye className="w-5 h-5" />
    },
    {
      label: 'Total Likes',
      value: stats.totalLikes.toLocaleString(),
      change: 8.7,
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      label: 'Ready',
      value: stats.ready.toString(),
      change: 15.2,
      icon: <Play className="w-5 h-5" />
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <Play className="w-3 h-3" />
      case 'processing': return <RefreshCw className="w-3 h-3 animate-spin" />
      case 'draft': return <Pencil className="w-3 h-3" />
      default: return null
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const recentActivity = [
    {
      icon: <Video className="w-5 h-5" />,
      title: 'Video rendered',
      description: 'Project ready for review',
      time: '10 minutes ago',
      status: 'success' as const
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: 'AI enhancement',
      description: 'Auto-captions added',
      time: '1 hour ago',
      status: 'success' as const
    },
    {
      icon: <Upload className="w-5 h-5" />,
      title: 'Asset uploaded',
      description: 'New media added',
      time: '2 hours ago',
      status: 'info' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50/30 to-rose-50/40 dark:from-purple-950 dark:via-pink-950/30 dark:to-rose-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Film className="w-10 h-10 text-purple-600" />
              Video Studio
            </h1>
            <p className="text-muted-foreground">
              Create, edit, and manage your video content
            </p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={<Camera />}
              ariaLabel="Record"
              variant="ghost"
              size="md"
            />
            <IconButton
              icon={<Settings />}
              ariaLabel="Settings"
              variant="ghost"
              size="md"
            />
            <GradientButton
              from="purple"
              to="pink"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Video
            </GradientButton>
          </div>
        </div>

        {/* Stats */}
        <StatGrid columns={4} stats={displayStats} />

        {/* Tabs */}
        <div className="flex items-center gap-3">
          <PillButton
            variant={selectedTab === 'projects' ? 'primary' : 'ghost'}
            onClick={() => setSelectedTab('projects')}
          >
            <Video className="w-4 h-4 mr-2" />
            My Videos
          </PillButton>
          <PillButton
            variant={selectedTab === 'templates' ? 'primary' : 'ghost'}
            onClick={() => setSelectedTab('templates')}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Templates
          </PillButton>
          <PillButton
            variant={selectedTab === 'assets' ? 'primary' : 'ghost'}
            onClick={() => setSelectedTab('assets')}
          >
            <Layers className="w-4 h-4 mr-2" />
            Assets
          </PillButton>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Projects */}
          <div className="lg:col-span-2 space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Video Projects ({projects.length})</h3>
              {loading && projects.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No video projects yet</p>
                  <ModernButton
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Video
                  </ModernButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((video) => (
                    <div
                      key={video.id}
                      className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-16 bg-muted rounded-lg flex items-center justify-center">
                          {video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Video className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{video.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(video.status)}`}>
                              {getStatusIcon(video.status)}
                              {video.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{video.description || 'No description'}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(video.duration_seconds)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {video.views_count} views
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {video.likes_count} likes
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {video.status === 'draft' && (
                            <ModernButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleProcessVideo(video.id)}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Render
                            </ModernButton>
                          )}
                          {video.status === 'ready' && (
                            <ModernButton
                              variant="primary"
                              size="sm"
                              onClick={() => console.log('Share', video.id)}
                            >
                              <Share2 className="w-3 h-3 mr-1" />
                              Share
                            </ModernButton>
                          )}
                          <ModernButton
                            variant="outline"
                            size="sm"
                            onClick={() => deleteProject(video.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton
                  variant="primary"
                  className="w-full justify-start"
                  onClick={() => console.log('Record')}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Record Screen
                </ModernButton>
                <ModernButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => console.log('Upload')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </ModernButton>
                <ModernButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => console.log('AI Enhance')}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Enhance
                </ModernButton>
              </div>
            </BentoCard>

            {/* Progress Card */}
            <ProgressCard
              title="Render Queue"
              current={stats.processing}
              goal={stats.total || 1}
              icon={<Target className="w-5 h-5" />}
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Quick Stats */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg. Duration" value={formatDuration(stats.avgDuration)} change={12.5} />
                <MiniKPI label="Ready Videos" value={stats.ready.toString()} change={5.2} />
                <MiniKPI label="Draft Videos" value={stats.draft.toString()} change={8.7} />
                <MiniKPI label="Processing" value={stats.processing.toString()} change={-2.1} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create Video Project</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter description"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </ModernButton>
                <GradientButton
                  from="purple"
                  to="pink"
                  className="flex-1"
                  onClick={handleCreateProject}
                  disabled={loading || !newProject.title.trim()}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Project'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
