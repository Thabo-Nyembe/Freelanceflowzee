'use client'

import { useState } from 'react'
import { useAnimations, Animation, AnimationStats } from '@/lib/hooks/use-animations'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ActivityFeed,
  MiniKPI,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Film,
  Play,
  Pause,
  Layers,
  Sparkles,
  Download,
  Upload,
  Settings,
  Zap,
  Clock,
  Eye,
  Heart,
  Share2,
  Copy,
  Plus,
  X,
  Loader2,
  Trash2
} from 'lucide-react'

interface MotionGraphicsClientProps {
  initialAnimations: Animation[]
  initialStats: AnimationStats
}

export default function MotionGraphicsClient({ initialAnimations, initialStats }: MotionGraphicsClientProps) {
  const {
    animations,
    stats,
    loading,
    createAnimation,
    deleteAnimation,
    likeAnimation,
    downloadAnimation,
    startRender
  } = useAnimations(initialAnimations, initialStats)

  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(animations[0]?.id || null)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'ready' | 'rendering'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAnimation, setNewAnimation] = useState({
    title: '',
    description: '',
    category: 'general',
    resolution: '1080p',
    fps: 30,
    is_template: false
  })

  const filteredAnimations = animations.filter(anim => {
    if (statusFilter === 'all') return true
    return anim.status === statusFilter
  })

  const handleCreateAnimation = async () => {
    if (!newAnimation.title.trim()) return
    await createAnimation(newAnimation)
    setShowCreateModal(false)
    setNewAnimation({ title: '', description: '', category: 'general', resolution: '1080p', fps: 30, is_template: false })
  }

  const displayStats = [
    { label: 'Animations', value: stats.total.toString(), change: 25.3, icon: <Film className="w-5 h-5" /> },
    { label: 'Templates', value: stats.templates.toString(), change: 12.5, icon: <Layers className="w-5 h-5" /> },
    { label: 'Total Likes', value: stats.totalLikes.toLocaleString(), change: 32.1, icon: <Heart className="w-5 h-5" /> },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), change: 28.4, icon: <Eye className="w-5 h-5" /> }
  ]

  const animationPresets = [
    { name: 'Fade In', description: 'Smooth opacity transition', color: 'from-blue-500 to-cyan-500' },
    { name: 'Slide Up', description: 'Bottom to top motion', color: 'from-purple-500 to-pink-500' },
    { name: 'Scale & Rotate', description: 'Dynamic entrance', color: 'from-orange-500 to-red-500' },
    { name: 'Bounce', description: 'Elastic animation', color: 'from-green-500 to-emerald-500' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'rendering': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50/30 to-indigo-50/40 dark:from-cyan-950 dark:via-blue-950/30 dark:to-indigo-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Film className="w-10 h-10 text-cyan-600" />
              Motion Graphics
            </h1>
            <p className="text-muted-foreground">Create stunning animations and video effects</p>
          </div>
          <GradientButton from="cyan" to="blue" onClick={() => setShowCreateModal(true)}>
            <Sparkles className="w-5 h-5 mr-2" />
            New Animation
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={displayStats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Film />} title="Quick Render" description="Fast export" onClick={() => selectedAnimation && startRender(selectedAnimation)} />
          <BentoQuickAction icon={<Copy />} title="Templates" description="Pre-made" onClick={() => setStatusFilter('all')} />
          <BentoQuickAction icon={<Layers />} title="Compositions" description="Multi-layer" onClick={() => console.log('Compositions')} />
          <BentoQuickAction icon={<Zap />} title="AI Effects" description="Auto animate" onClick={() => console.log('AI')} />
        </div>

        <div className="flex items-center gap-2">
          <PillButton variant={statusFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('all')}>All</PillButton>
          <PillButton variant={statusFilter === 'draft' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('draft')}>Draft</PillButton>
          <PillButton variant={statusFilter === 'rendering' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('rendering')}>Rendering</PillButton>
          <PillButton variant={statusFilter === 'ready' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('ready')}>Ready</PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="relative aspect-video bg-gradient-to-br from-cyan-900 to-blue-900 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
                    className="w-16 h-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                  >
                    {isPreviewPlaying ? (
                      <Pause className="w-8 h-8 text-cyan-600" />
                    ) : (
                      <Play className="w-8 h-8 text-cyan-600 ml-1" />
                    )}
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white text-sm mb-2">
                    <Clock className="w-4 h-4" />
                    <span>0:00 / 0:05</span>
                  </div>
                  <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white dark:bg-slate-800" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <ModernButton variant="primary" onClick={() => selectedAnimation && startRender(selectedAnimation)} disabled={!selectedAnimation}>
                  <Zap className="w-4 h-4 mr-2" />
                  Render Animation
                </ModernButton>
                <ModernButton variant="outline" onClick={() => console.log('Settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </ModernButton>
                <ModernButton variant="outline" onClick={() => selectedAnimation && downloadAnimation(selectedAnimation)} disabled={!selectedAnimation}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </ModernButton>
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Your Animations</h3>
              {loading && animations.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                </div>
              ) : filteredAnimations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No animations found</p>
                  <ModernButton variant="outline" size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Animation
                  </ModernButton>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAnimations.map((animation) => (
                    <div
                      key={animation.id}
                      onClick={() => setSelectedAnimation(animation.id)}
                      className={`rounded-xl border overflow-hidden transition-all cursor-pointer ${
                        selectedAnimation === animation.id
                          ? 'border-cyan-500 shadow-lg'
                          : 'border-border hover:border-cyan-300'
                      }`}
                    >
                      <div className="relative aspect-video bg-muted">
                        {animation.thumbnail_url ? (
                          <img src={animation.thumbnail_url} alt={animation.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900">
                            <Film className="w-12 h-12 text-cyan-500 opacity-50" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs">
                          {animation.duration_seconds}s
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{animation.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(animation.status)}`}>
                            {animation.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span>{animation.resolution}</span>
                          <span>{animation.fps} FPS</span>
                          <span className="capitalize">{animation.category}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {animation.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {animation.downloads_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {animation.views_count}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ModernButton variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); likeAnimation(animation.id) }}>
                              <Heart className="w-3 h-3" />
                            </ModernButton>
                            <ModernButton variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); deleteAnimation(animation.id) }}>
                              <Trash2 className="w-3 h-3" />
                            </ModernButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Animation Presets</h3>
              <div className="space-y-3">
                {animationPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => console.log('Apply', preset.name)}
                    className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${preset.color}`} />
                      <div>
                        <p className="text-sm font-medium">{preset.name}</p>
                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </BentoCard>

            <ProgressCard
              title="Render Queue"
              current={stats.rendering}
              goal={10}
              unit=""
              icon={<Film className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <MiniKPI label="Ready" value={stats.ready.toString()} change={18.7} />
                <MiniKPI label="Rendering" value={stats.rendering.toString()} change={5.2} />
                <MiniKPI label="Total Downloads" value={stats.totalDownloads.toLocaleString()} change={25.3} />
                <MiniKPI label="Templates" value={stats.templates.toString()} change={12.5} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create Animation</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={newAnimation.title}
                  onChange={(e) => setNewAnimation({ ...newAnimation, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter animation title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newAnimation.description}
                  onChange={(e) => setNewAnimation({ ...newAnimation, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newAnimation.category}
                    onChange={(e) => setNewAnimation({ ...newAnimation, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="general">General</option>
                    <option value="branding">Branding</option>
                    <option value="marketing">Marketing</option>
                    <option value="typography">Typography</option>
                    <option value="effects">Effects</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Resolution</label>
                  <select
                    value={newAnimation.resolution}
                    onChange={(e) => setNewAnimation({ ...newAnimation, resolution: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">FPS</label>
                  <select
                    value={newAnimation.fps}
                    onChange={(e) => setNewAnimation({ ...newAnimation, fps: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value={24}>24 FPS</option>
                    <option value={30}>30 FPS</option>
                    <option value={60}>60 FPS</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAnimation.is_template}
                      onChange={(e) => setNewAnimation({ ...newAnimation, is_template: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Save as template</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</ModernButton>
                <GradientButton from="cyan" to="blue" className="flex-1" onClick={handleCreateAnimation} disabled={loading || !newAnimation.title.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Animation'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
