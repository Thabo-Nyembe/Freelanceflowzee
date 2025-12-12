"use client"

import { useState } from 'react'
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
  Copy
} from 'lucide-react'

/**
 * Motion Graphics V2 - Groundbreaking Animation & Video Creation
 * Showcases motion design tools with modern components
 */
export default function MotionGraphicsV2() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>('1')
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)

  const stats = [
    { label: 'Animations', value: '124', change: 25.3, icon: <Film className="w-5 h-5" /> },
    { label: 'Templates', value: '42', change: 12.5, icon: <Layers className="w-5 h-5" /> },
    { label: 'Render Time', value: '3.2s', change: -18.7, icon: <Zap className="w-5 h-5" /> },
    { label: 'Total Views', value: '8.4K', change: 32.1, icon: <Eye className="w-5 h-5" /> }
  ]

  const motionTemplates = [
    {
      id: '1',
      title: 'Logo Reveal',
      category: 'Branding',
      duration: '5s',
      resolution: '4K',
      fps: 60,
      thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=225&fit=crop',
      likes: 247,
      downloads: 89
    },
    {
      id: '2',
      title: 'Social Media Intro',
      category: 'Marketing',
      duration: '8s',
      resolution: '1080p',
      fps: 30,
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop',
      likes: 189,
      downloads: 67
    },
    {
      id: '3',
      title: 'Text Animation',
      category: 'Typography',
      duration: '3s',
      resolution: '4K',
      fps: 60,
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop',
      likes: 324,
      downloads: 112
    }
  ]

  const animationPresets = [
    { name: 'Fade In', description: 'Smooth opacity transition', color: 'from-blue-500 to-cyan-500' },
    { name: 'Slide Up', description: 'Bottom to top motion', color: 'from-purple-500 to-pink-500' },
    { name: 'Scale & Rotate', description: 'Dynamic entrance', color: 'from-orange-500 to-red-500' },
    { name: 'Bounce', description: 'Elastic animation', color: 'from-green-500 to-emerald-500' }
  ]

  const recentActivity = [
    { icon: <Film className="w-5 h-5" />, title: 'Animation rendered', description: 'Logo Reveal exported in 4K', time: '10 minutes ago', status: 'success' as const },
    { icon: <Download className="w-5 h-5" />, title: 'Template downloaded', description: 'Social Media Intro', time: '1 hour ago', status: 'info' as const },
    { icon: <Heart className="w-5 h-5" />, title: 'Animation liked', description: 'Text Animation received 12 likes', time: '3 hours ago', status: 'info' as const },
    { icon: <Upload className="w-5 h-5" />, title: 'Project uploaded', description: 'New motion graphics project', time: '5 hours ago', status: 'success' as const }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Film className="w-10 h-10 text-cyan-600" />
              Motion Graphics
            </h1>
            <p className="text-muted-foreground">Create stunning animations and video effects</p>
          </div>
          <GradientButton from="cyan" to="blue" onClick={() => console.log('New animation')}>
            <Sparkles className="w-5 h-5 mr-2" />
            New Animation
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Film />} title="Quick Render" description="Fast export" onClick={() => console.log('Render')} />
          <BentoQuickAction icon={<Copy />} title="Templates" description="Pre-made" onClick={() => console.log('Templates')} />
          <BentoQuickAction icon={<Layers />} title="Compositions" description="Multi-layer" onClick={() => console.log('Compositions')} />
          <BentoQuickAction icon={<Zap />} title="AI Effects" description="Auto animate" onClick={() => console.log('AI')} />
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
                    <div className="h-full bg-white" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <ModernButton variant="primary" onClick={() => console.log('Render')}>
                  <Zap className="w-4 h-4 mr-2" />
                  Render Animation
                </ModernButton>
                <ModernButton variant="outline" onClick={() => console.log('Settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </ModernButton>
                <ModernButton variant="outline" onClick={() => console.log('Export')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </ModernButton>
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Animation Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {motionTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`rounded-xl border overflow-hidden transition-all cursor-pointer ${
                      selectedTemplate === template.id
                        ? 'border-cyan-500 shadow-lg'
                        : 'border-border hover:border-cyan-300'
                    }`}
                  >
                    <div className="relative aspect-video bg-muted">
                      <img src={template.thumbnail} alt={template.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs">
                        {template.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{template.title}</h4>
                        <span className="text-xs px-2 py-1 rounded-md bg-cyan-100 text-cyan-700">
                          {template.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span>{template.resolution}</span>
                        <span>{template.fps} FPS</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {template.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {template.downloads}
                          </span>
                        </div>
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Use', template.id)}>
                          Use Template
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Render Queue"
              current={3}
              goal={10}
              unit=""
              icon={<Film className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Render Time" value="3.2s" change={-18.7} />
                <MiniKPI label="Export Quality" value="98%" change={5.2} />
                <MiniKPI label="Animations Created" value="124" change={25.3} />
                <MiniKPI label="Template Usage" value="67%" change={12.5} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
