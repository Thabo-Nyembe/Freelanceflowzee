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
  useAICreate,
  getGenerationTypeColor,
  getGenerationStatusColor,
  getQualityScoreColor,
  formatGenerationTokens,
  formatGenerationCost,
  formatGenerationLatency,
  getGenerationTypeIcon,
  type AIGeneration
} from '@/lib/hooks/use-ai-create'

type TypeFilter = 'all' | 'content' | 'code' | 'image' | 'summary' | 'email' | 'social' | 'seo'
type StatusFilter = 'all' | 'pending' | 'processing' | 'completed' | 'failed'

interface AICreateClientProps {
  initialGenerations: AIGeneration[]
}

export default function AICreateClient({ initialGenerations }: AICreateClientProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [prompt, setPrompt] = useState('')
  const [selectedType, setSelectedType] = useState<AIGeneration['generation_type']>('content')
  const [showResult, setShowResult] = useState(false)

  const {
    generations,
    stats,
    isLoading,
    isGenerating,
    createGeneration,
    deleteGeneration,
    regenerate
  } = useAICreate(initialGenerations, {
    generationType: typeFilter === 'all' ? undefined : typeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter
  })

  const filteredGenerations = generations.filter(gen => {
    if (typeFilter !== 'all' && gen.generation_type !== typeFilter) return false
    if (statusFilter !== 'all' && gen.status !== statusFilter) return false
    return true
  })

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    try {
      await createGeneration(prompt, selectedType, {
        title: `${selectedType} Generation`
      })
      setPrompt('')
      setShowResult(true)
    } catch (error) {
      console.error('Failed to create generation:', error)
    }
  }

  const templates = [
    { type: 'content' as const, label: 'Blog Post', icon: '📝', prompt: 'Write a blog post about...' },
    { type: 'social' as const, label: 'Social Media', icon: '📱', prompt: 'Create a social media caption for...' },
    { type: 'email' as const, label: 'Email', icon: '📧', prompt: 'Draft an email about...' },
    { type: 'code' as const, label: 'Code', icon: '💻', prompt: 'Write a function that...' },
    { type: 'seo' as const, label: 'SEO Meta', icon: '🔍', prompt: 'Generate SEO meta tags for...' },
    { type: 'summary' as const, label: 'Summary', icon: '📋', prompt: 'Summarize the following...' }
  ]

  const topGenerations = [...filteredGenerations]
    .filter(g => g.status === 'completed')
    .sort((a, b) => b.quality_score - a.quality_score)
    .slice(0, 5)
    .map((gen, index) => ({
      rank: index + 1,
      label: gen.title,
      value: `${gen.quality_score}%`,
      trend: 'up' as const
    }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              ✨ AI Content Studio
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Create amazing content with the power of AI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              📜 History
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300">
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Generations',
              value: stats.total.toString(),
              change: '+24%',
              trend: 'up' as const,
              subtitle: 'all time'
            },
            {
              label: 'Completed',
              value: stats.completed.toString(),
              change: '+18%',
              trend: 'up' as const,
              subtitle: 'successful'
            },
            {
              label: 'Tokens Used',
              value: formatGenerationTokens(stats.totalTokens),
              change: '+32%',
              trend: 'up' as const,
              subtitle: 'this month'
            },
            {
              label: 'Avg Quality',
              value: `${stats.avgQualityScore.toFixed(0)}%`,
              change: '+5%',
              trend: 'up' as const,
              subtitle: 'score'
            }
          ]}
        />

        {/* Quick Templates */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            Quick Templates
          </h3>
          <div className="flex flex-wrap gap-3">
            {templates.map((template) => (
              <button
                key={template.type}
                onClick={() => {
                  setSelectedType(template.type)
                  setPrompt(template.prompt)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedType === template.type
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                }`}
              >
                <span>{template.icon}</span>
                {template.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Sandbox */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              AI Content Playground
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs ${getGenerationTypeColor(selectedType)}`}>
              {getGenerationTypeIcon(selectedType)} {selectedType}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Write your prompt below and click Generate to create content
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full h-40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-500">
              {prompt.length} characters
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  ✨ Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <PillButton label="All Types" isActive={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
            <PillButton label="Content" isActive={typeFilter === 'content'} onClick={() => setTypeFilter('content')} />
            <PillButton label="Code" isActive={typeFilter === 'code'} onClick={() => setTypeFilter('code')} />
            <PillButton label="Email" isActive={typeFilter === 'email'} onClick={() => setTypeFilter('email')} />
            <PillButton label="Social" isActive={typeFilter === 'social'} onClick={() => setTypeFilter('social')} />
          </div>
          <div className="flex items-center gap-2">
            <PillButton label="All Status" isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
            <PillButton label="Completed" isActive={statusFilter === 'completed'} onClick={() => setStatusFilter('completed')} />
            <PillButton label="Pending" isActive={statusFilter === 'pending'} onClick={() => setStatusFilter('pending')} />
            <PillButton label="Failed" isActive={statusFilter === 'failed'} onClick={() => setStatusFilter('failed')} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Generations List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Recent Generations ({filteredGenerations.length})
              </h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
              ) : filteredGenerations.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <div className="text-6xl mb-4">🧠</div>
                  <p className="text-lg font-medium">No generations yet</p>
                  <p className="text-sm mt-2">Write a prompt above and click Generate to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGenerations.map((generation) => (
                    <div
                      key={generation.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 transition-all hover:shadow-lg hover:shadow-violet-500/10 bg-white dark:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl">{getGenerationTypeIcon(generation.generation_type)}</span>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {generation.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getGenerationStatusColor(generation.status)}`}>
                              {generation.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {generation.prompt}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getGenerationTypeColor(generation.generation_type)}`}>
                          {generation.generation_type}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {generation.model}
                        </span>
                      </div>

                      {generation.status === 'completed' && (
                        <div className="grid grid-cols-4 gap-3 mb-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                          <div className="text-center">
                            <div className="text-xs text-slate-600 dark:text-slate-400">Quality</div>
                            <div className={`font-semibold ${getQualityScoreColor(generation.quality_score)}`}>
                              {generation.quality_score}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-600 dark:text-slate-400">Readability</div>
                            <div className={`font-semibold ${getQualityScoreColor(generation.readability_score)}`}>
                              {generation.readability_score}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-600 dark:text-slate-400">SEO</div>
                            <div className={`font-semibold ${getQualityScoreColor(generation.seo_score)}`}>
                              {generation.seo_score}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-600 dark:text-slate-400">Latency</div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {formatGenerationLatency(generation.latency_ms)}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700 mb-3">
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Tokens</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatGenerationTokens(generation.total_tokens)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Cost</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatGenerationCost(generation.cost)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Created</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {new Date(generation.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                        {generation.status === 'completed' && (
                          <>
                            <button className="flex-1 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded text-xs font-medium hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-all">
                              View Result
                            </button>
                            <button
                              onClick={() => navigator.clipboard.writeText(generation.result || '')}
                              className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => regenerate(generation.id)}
                              className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                            >
                              Regenerate
                            </button>
                          </>
                        )}
                        {generation.status === 'failed' && (
                          <button
                            onClick={() => regenerate(generation.id)}
                            className="flex-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                          >
                            Retry
                          </button>
                        )}
                        <button
                          onClick={() => deleteGeneration(generation.id)}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI label="Completed" value={stats.completed.toString()} trend="up" change="+12" />
              <MiniKPI label="Pending" value={stats.pending.toString()} trend="same" change="0" />
              <MiniKPI label="Failed" value={stats.failed.toString()} trend="down" change="-3" />
              <MiniKPI label="Avg Latency" value={formatGenerationLatency(stats.avgLatency)} trend="down" change="-15%" />
            </div>

            {/* Top Generations */}
            <RankingList
              title="Best Quality Generations"
              items={topGenerations}
            />

            {/* Generation Types */}
            <ProgressCard
              title="Generation Types"
              items={[
                { label: 'Content', value: stats.byType['content'] || 0, total: stats.total, color: 'blue' },
                { label: 'Code', value: stats.byType['code'] || 0, total: stats.total, color: 'green' },
                { label: 'Email', value: stats.byType['email'] || 0, total: stats.total, color: 'amber' },
                { label: 'Social', value: stats.byType['social'] || 0, total: stats.total, color: 'pink' },
                { label: 'SEO', value: stats.byType['seo'] || 0, total: stats.total, color: 'orange' }
              ]}
            />

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Content generated',
                  subject: 'Blog Post',
                  time: '2 min ago',
                  type: 'success'
                },
                {
                  action: 'Code generated',
                  subject: 'API Function',
                  time: '15 min ago',
                  type: 'success'
                },
                {
                  action: 'Email drafted',
                  subject: 'Welcome Email',
                  time: '1 hour ago',
                  type: 'success'
                },
                {
                  action: 'Generation failed',
                  subject: 'Image prompt',
                  time: '2 hours ago',
                  type: 'error'
                }
              ]}
            />

            {/* Usage Summary */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                Usage Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Tokens</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatGenerationTokens(stats.totalTokens)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Cost</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatGenerationCost(stats.totalCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Avg Quality</span>
                  <span className={`font-semibold ${getQualityScoreColor(stats.avgQualityScore)}`}>
                    {stats.avgQualityScore.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
