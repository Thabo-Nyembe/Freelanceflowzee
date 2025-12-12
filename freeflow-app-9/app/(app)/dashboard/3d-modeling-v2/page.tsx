"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ProgressCard,
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Box,
  Cube,
  Layers,
  Sparkles,
  Download,
  Upload,
  Settings,
  Rotate3d,
  Eye,
  Zap,
  Grid3x3,
  Move3d,
  Palette,
  Share2
} from 'lucide-react'

/**
 * 3D Modeling V2 - Groundbreaking 3D Design & Rendering
 * Showcases 3D modeling tools with modern components
 */
export default function ThreeDModelingV2() {
  const [selectedView, setSelectedView] = useState<'perspective' | 'orthographic' | 'top'>('perspective')
  const [selectedModel, setSelectedModel] = useState<string | null>('1')

  const stats = [
    { label: '3D Models', value: '87', change: 15.2, icon: <Box className="w-5 h-5" /> },
    { label: 'Render Time', value: '4.2s', change: -12.5, icon: <Zap className="w-5 h-5" /> },
    { label: 'Polygons', value: '2.4M', change: 25.3, icon: <Grid3x3 className="w-5 h-5" /> },
    { label: 'Projects', value: '34', change: 18.7, icon: <Cube className="w-5 h-5" /> }
  ]

  const models = [
    {
      id: '1',
      title: 'Product Mockup',
      category: 'Commercial',
      polygons: '847K',
      format: 'OBJ',
      size: '24.3 MB',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
      renderQuality: 'High',
      lastModified: '2 hours ago'
    },
    {
      id: '2',
      title: 'Character Model',
      category: 'Gaming',
      polygons: '1.2M',
      format: 'FBX',
      size: '42.7 MB',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
      renderQuality: 'Ultra',
      lastModified: '1 day ago'
    },
    {
      id: '3',
      title: 'Architectural Design',
      category: 'Architecture',
      polygons: '2.4M',
      format: 'BLEND',
      size: '67.2 MB',
      thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
      renderQuality: 'Ultra',
      lastModified: '3 days ago'
    }
  ]

  const modelingTools = [
    { name: 'Extrude', description: 'Extend geometry', icon: <Move3d className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { name: 'Sculpt', description: 'Organic shaping', icon: <Palette className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { name: 'UV Unwrap', description: 'Texture mapping', icon: <Grid3x3 className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { name: 'Boolean', description: 'Combine objects', icon: <Layers className="w-5 h-5" />, color: 'from-orange-500 to-red-500' }
  ]

  const renderPresets = [
    { name: 'Quick Preview', quality: 'Low', time: '0.5s', samples: 32 },
    { name: 'Standard', quality: 'Medium', time: '2.1s', samples: 128 },
    { name: 'High Quality', quality: 'High', time: '4.2s', samples: 512 },
    { name: 'Production', quality: 'Ultra', time: '12.8s', samples: 2048 }
  ]

  const recentActivity = [
    { icon: <Box className="w-5 h-5" />, title: 'Model rendered', description: 'Product Mockup exported', time: '10 minutes ago', status: 'success' as const },
    { icon: <Upload className="w-5 h-5" />, title: 'Model uploaded', description: 'Character Model imported', time: '1 hour ago', status: 'info' as const },
    { icon: <Share2 className="w-5 h-5" />, title: 'Project shared', description: 'Architectural Design shared', time: '3 hours ago', status: 'info' as const },
    { icon: <Zap className="w-5 h-5" />, title: 'Quick render', description: 'Preview generated', time: '5 hours ago', status: 'success' as const }
  ]

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Ultra': return 'bg-purple-100 text-purple-700'
      case 'High': return 'bg-green-100 text-green-700'
      case 'Medium': return 'bg-yellow-100 text-yellow-700'
      case 'Low': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Cube className="w-10 h-10 text-slate-600" />
              3D Modeling Studio
            </h1>
            <p className="text-muted-foreground">Professional 3D design and rendering</p>
          </div>
          <GradientButton from="slate" to="gray" onClick={() => console.log('New model')}>
            <Sparkles className="w-5 h-5 mr-2" />
            New Model
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Box />} title="Primitives" description="Basic shapes" onClick={() => console.log('Primitives')} />
          <BentoQuickAction icon={<Upload />} title="Import" description="Upload 3D" onClick={() => console.log('Import')} />
          <BentoQuickAction icon={<Rotate3d />} title="Transform" description="Move/rotate" onClick={() => console.log('Transform')} />
          <BentoQuickAction icon={<Zap />} title="Quick Render" description="Fast preview" onClick={() => console.log('Render')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedView === 'perspective' ? 'primary' : 'ghost'} onClick={() => setSelectedView('perspective')}>
            <Eye className="w-4 h-4 mr-2" />
            Perspective
          </PillButton>
          <PillButton variant={selectedView === 'orthographic' ? 'primary' : 'ghost'} onClick={() => setSelectedView('orthographic')}>
            <Grid3x3 className="w-4 h-4 mr-2" />
            Orthographic
          </PillButton>
          <PillButton variant={selectedView === 'top' ? 'primary' : 'ghost'} onClick={() => setSelectedView('top')}>
            <Box className="w-4 h-4 mr-2" />
            Top View
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">3D Viewport</h3>
              <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-gray-900 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cube className="w-24 h-24 text-slate-600 animate-pulse" />
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="px-3 py-1 rounded-md bg-black/70 text-white text-xs">
                    {selectedView}
                  </div>
                  <div className="px-3 py-1 rounded-md bg-black/70 text-white text-xs">
                    2.4M polygons
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                  <ModernButton variant="outline" size="sm" onClick={() => console.log('Rotate')}>
                    <Rotate3d className="w-3 h-3 mr-1" />
                    Rotate
                  </ModernButton>
                  <ModernButton variant="outline" size="sm" onClick={() => console.log('Move')}>
                    <Move3d className="w-3 h-3 mr-1" />
                    Move
                  </ModernButton>
                  <ModernButton variant="outline" size="sm" onClick={() => console.log('Scale')}>
                    <Grid3x3 className="w-3 h-3 mr-1" />
                    Scale
                  </ModernButton>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <ModernButton variant="primary" onClick={() => console.log('Render')}>
                  <Zap className="w-4 h-4 mr-2" />
                  Render Scene
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
              <h3 className="text-xl font-semibold mb-4">3D Models Library</h3>
              <div className="space-y-4">
                {models.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedModel === model.id
                        ? 'border-slate-500 bg-slate-50 dark:bg-slate-950'
                        : 'border-border bg-background hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        <img src={model.thumbnail} alt={model.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{model.title}</h4>
                          <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                            {model.category}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-md ${getQualityColor(model.renderQuality)}`}>
                            {model.renderQuality}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span>{model.polygons} polygons</span>
                          <span>{model.format}</span>
                          <span>{model.size}</span>
                          <span>Modified {model.lastModified}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Open', model.id)}>
                            <Eye className="w-3 h-3 mr-1" />
                            Open
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Render', model.id)}>
                            <Zap className="w-3 h-3 mr-1" />
                            Render
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Export', model.id)}>
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Modeling Tools</h3>
              <div className="space-y-3">
                {modelingTools.map((tool) => (
                  <button
                    key={tool.name}
                    onClick={() => console.log('Use tool', tool.name)}
                    className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center text-white`}>
                        {tool.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Render Presets</h3>
              <div className="space-y-2">
                {renderPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => console.log('Apply preset', preset.name)}
                    className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{preset.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-md ${getQualityColor(preset.quality)}`}>
                        {preset.quality}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{preset.time}</span>
                      <span>{preset.samples} samples</span>
                    </div>
                  </button>
                ))}
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <MiniKPI label="Render Speed" value="4.2s" change={-12.5} />
                <MiniKPI label="GPU Usage" value="78%" change={5.2} />
                <MiniKPI label="Models Created" value="87" change={15.2} />
                <MiniKPI label="Avg Polygon Count" value="1.8M" change={25.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
