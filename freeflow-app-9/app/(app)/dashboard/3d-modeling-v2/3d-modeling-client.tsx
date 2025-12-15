'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import {
  use3DModels,
  use3DModelMutations,
  getModelStatusColor,
  getRenderQualityColor,
  formatFileSize,
  formatPolygonCount,
  type ThreeDModel
} from '@/lib/hooks/use-3d-models'

type ViewMode = 'all' | 'draft' | 'published' | 'rendering'

interface ThreeDModelingClientProps {
  initialModels: ThreeDModel[]
}

export default function ThreeDModelingClient({ initialModels }: ThreeDModelingClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const { models, stats, isLoading } = use3DModels(initialModels, {
    status: viewMode === 'all' ? undefined : viewMode
  })

  const { createModel, isCreating } = use3DModelMutations()

  const filteredModels = viewMode === 'all'
    ? models
    : models.filter(model => model.status === viewMode)

  const handleCreateModel = () => {
    createModel({
      title: 'New 3D Model',
      category: 'general',
      file_format: 'OBJ',
      render_quality: 'medium'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50 dark:from-slate-950 dark:via-slate-900 dark:to-zinc-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-zinc-600 bg-clip-text text-transparent">
              3D Modeling Studio
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Professional 3D design and rendering
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateModel}
              disabled={isCreating}
              className="px-4 py-2 bg-gradient-to-r from-slate-600 to-zinc-600 text-white rounded-lg hover:shadow-lg hover:shadow-slate-500/50 transition-all duration-300 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'New Model'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: '3D Models',
              value: stats.total.toString(),
              change: '+15',
              trend: 'up' as const,
              subtitle: 'total models'
            },
            {
              label: 'Total Polygons',
              value: formatPolygonCount(stats.totalPolygons),
              change: '+25%',
              trend: 'up' as const,
              subtitle: 'across all models'
            },
            {
              label: 'Avg Render Time',
              value: `${stats.avgRenderTime.toFixed(1)}s`,
              change: '-12%',
              trend: 'up' as const,
              subtitle: 'per render'
            },
            {
              label: 'Downloads',
              value: stats.totalDownloads.toString(),
              change: '+18%',
              trend: 'up' as const,
              subtitle: 'total downloads'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Import Model', icon: '📤', onClick: () => {} },
            { label: 'Quick Render', icon: '⚡', onClick: () => {} },
            { label: 'Primitives', icon: '📦', onClick: () => {} },
            { label: 'Textures', icon: '🎨', onClick: () => {} },
            { label: 'Materials', icon: '🔮', onClick: () => {} },
            { label: 'Export', icon: '📥', onClick: () => {} },
            { label: 'Templates', icon: '📋', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Models"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Draft"
            isActive={viewMode === 'draft'}
            onClick={() => setViewMode('draft')}
          />
          <PillButton
            label="Published"
            isActive={viewMode === 'published'}
            onClick={() => setViewMode('published')}
          />
          <PillButton
            label="Rendering"
            isActive={viewMode === 'rendering'}
            onClick={() => setViewMode('rendering')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Models List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                3D Models ({filteredModels.length})
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                </div>
              ) : filteredModels.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No models found. Click "New Model" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredModels.map((model) => (
                    <div
                      key={model.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-500/50 dark:hover:border-slate-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                    >
                      <div className="flex items-start gap-4">
                        {model.thumbnail_url ? (
                          <img
                            src={model.thumbnail_url}
                            alt={model.title}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-slate-200 to-zinc-300 dark:from-slate-700 dark:to-zinc-800 flex items-center justify-center">
                            <span className="text-3xl">📦</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
                              {model.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getModelStatusColor(model.status)}`}>
                              {model.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getRenderQualityColor(model.render_quality)}`}>
                              {model.render_quality}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                            <span>{model.file_format}</span>
                            <span>{formatFileSize(model.file_size)}</span>
                            <span>{formatPolygonCount(model.polygon_count)} polygons</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>{model.model_code}</span>
                            <span>Category: {model.category}</span>
                            <span>Render: {model.last_render_time}s</span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-slate-600 to-zinc-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                          Open
                        </button>
                      </div>

                      <div className="grid grid-cols-5 gap-3 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-center">
                          <div className="text-xs text-slate-600 dark:text-slate-400">Vertices</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{formatPolygonCount(model.vertex_count)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-600 dark:text-slate-400">Textures</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{model.texture_count}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-600 dark:text-slate-400">Materials</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{model.material_count}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-600 dark:text-slate-400">Downloads</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{model.downloads}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-600 dark:text-slate-400">Views</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{model.views}</div>
                        </div>
                      </div>

                      {model.tags && model.tags.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex flex-wrap gap-2">
                            {model.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Model Status */}
            <ProgressCard
              title="Model Status"
              items={[
                { label: 'Published', value: stats.published, total: stats.total, color: 'green' },
                { label: 'Draft', value: stats.draft, total: stats.total, color: 'gray' },
                { label: 'Rendering', value: stats.rendering, total: stats.total, color: 'blue' },
                { label: 'Public', value: stats.publicModels, total: stats.total, color: 'purple' }
              ]}
            />

            {/* Top Models */}
            <RankingList
              title="Most Downloaded"
              items={models
                .sort((a, b) => b.downloads - a.downloads)
                .slice(0, 5)
                .map((m, i) => ({
                  label: m.title.substring(0, 25) + (m.title.length > 25 ? '...' : ''),
                  value: `${m.downloads} downloads`,
                  rank: i + 1,
                  trend: 'up'
                }))}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Polygons"
                value={formatPolygonCount(stats.total > 0 ? Math.round(stats.totalPolygons / stats.total) : 0)}
                trend="up"
                change="+15%"
              />
              <MiniKPI
                label="Render Time"
                value={`${stats.avgRenderTime.toFixed(1)}s`}
                trend="down"
                change="-12%"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Model rendered',
                  subject: 'Product Mockup exported',
                  time: '10 minutes ago',
                  type: 'success'
                },
                {
                  action: 'Model uploaded',
                  subject: 'Character Model imported',
                  time: '1 hour ago',
                  type: 'info'
                },
                {
                  action: 'Project shared',
                  subject: 'Architecture Design shared',
                  time: '3 hours ago',
                  type: 'info'
                },
                {
                  action: 'Quick render',
                  subject: 'Preview generated',
                  time: '5 hours ago',
                  type: 'success'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
