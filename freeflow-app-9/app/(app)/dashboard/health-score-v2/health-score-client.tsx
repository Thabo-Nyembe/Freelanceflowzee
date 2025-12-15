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
  useHealthScores,
  useHealthScoreMutations,
  getCategoryColor,
  getTrendColor,
  getScoreColor,
  type HealthScore
} from '@/lib/hooks/use-health-scores'

type ViewMode = 'all' | 'excellent' | 'good' | 'declining'

interface HealthScoreClientProps {
  initialHealthScores: HealthScore[]
}

export default function HealthScoreClient({ initialHealthScores }: HealthScoreClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const { healthScores, stats, isLoading } = useHealthScores(initialHealthScores, {
    category: viewMode === 'declining' ? undefined : viewMode === 'all' ? undefined : viewMode,
    trend: viewMode === 'declining' ? 'declining' : undefined
  })

  const { createHealthScore, recalculateHealthScore, isCreating } = useHealthScoreMutations()

  const filteredScores = viewMode === 'all'
    ? healthScores
    : viewMode === 'declining'
    ? healthScores.filter(score => score.trend === 'declining')
    : healthScores.filter(score => score.category === viewMode)

  const handleCreateHealthScore = () => {
    createHealthScore({
      customer_name: 'New Customer',
      product_usage: 50,
      engagement: 50,
      support_health: 50,
      financial: 50,
      sentiment: 50
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Customer Health Scores
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track and analyze customer health metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateHealthScore}
              disabled={isCreating}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Add Customer'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Avg Health Score',
              value: stats.avgScore.toFixed(0),
              change: '+3',
              trend: 'up' as const,
              subtitle: 'across all customers'
            },
            {
              label: 'Excellent Health',
              value: stats.excellent.toString(),
              change: '+12',
              trend: 'up' as const,
              subtitle: 'score 80+'
            },
            {
              label: 'Declining Scores',
              value: stats.declining.toString(),
              change: '-6',
              trend: stats.declining > 0 ? 'down' as const : 'same' as const,
              subtitle: 'require intervention'
            },
            {
              label: 'Score Accuracy',
              value: '94%',
              change: '+2%',
              trend: 'up' as const,
              subtitle: 'prediction confidence'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Score Overview', icon: '📊', onClick: () => {} },
            { label: 'Configure Weights', icon: '⚖️', onClick: () => {} },
            { label: 'Trend Analysis', icon: '📈', onClick: () => {} },
            { label: 'Risk Alerts', icon: '⚠️', onClick: () => {} },
            { label: 'Benchmarks', icon: '🎯', onClick: () => {} },
            { label: 'Export Data', icon: '📥', onClick: () => {} },
            { label: 'Reports', icon: '📋', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Scores"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Excellent"
            isActive={viewMode === 'excellent'}
            onClick={() => setViewMode('excellent')}
          />
          <PillButton
            label="Good"
            isActive={viewMode === 'good'}
            onClick={() => setViewMode('good')}
          />
          <PillButton
            label="Declining"
            isActive={viewMode === 'declining'}
            onClick={() => setViewMode('declining')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Health Scores List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Health Scores ({filteredScores.length})
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                </div>
              ) : filteredScores.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No health scores found. Click "Add Customer" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredScores.map((score) => (
                    <div
                      key={score.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {score.customer_name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(score.category)}`}>
                              {score.category}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getTrendColor(score.trend)}`}>
                              {score.trend}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="text-cyan-500">📅</span>
                              Updated: {score.last_calculated_at?.split('T')[0] || 'N/A'}
                            </span>
                            <span className={`flex items-center gap-1 ${score.score_change > 0 ? 'text-green-600 dark:text-green-400' : score.score_change < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                              <span className="text-cyan-500">{score.score_change > 0 ? '↑' : score.score_change < 0 ? '↓' : '→'}</span>
                              {score.score_change > 0 ? '+' : ''}{score.score_change} from last
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-cyan-500">⚠️</span>
                              {score.risk_factors} risks
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${getScoreColor(score.overall_score)}`}>
                            {score.overall_score}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Overall Score
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-center">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Usage</div>
                          <div className={`text-lg font-bold ${getScoreColor(score.product_usage)}`}>
                            {score.product_usage}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Engage</div>
                          <div className={`text-lg font-bold ${getScoreColor(score.engagement)}`}>
                            {score.engagement}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Support</div>
                          <div className={`text-lg font-bold ${getScoreColor(score.support_health)}`}>
                            {score.support_health}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Finance</div>
                          <div className={`text-lg font-bold ${getScoreColor(score.financial)}`}>
                            {score.financial}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Sentiment</div>
                          <div className={`text-lg font-bold ${getScoreColor(score.sentiment)}`}>
                            {score.sentiment}
                          </div>
                        </div>
                      </div>

                      {score.monthly_trend && score.monthly_trend.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                            <span>Health Trend</span>
                            <span>Score: {score.overall_score}/100</span>
                          </div>
                          <div className="flex items-end gap-1 h-12">
                            {score.monthly_trend.slice(-4).map((value, index) => (
                              <div
                                key={index}
                                className="flex-1 bg-gradient-to-t from-cyan-600 to-teal-600 rounded-t transition-all duration-300 hover:opacity-80"
                                style={{ height: `${value}%` }}
                                title={`${value}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                              {score.risk_factors} Risk Factors
                            </span>
                            <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              {score.opportunities} Opportunities
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Score Distribution */}
            <ProgressCard
              title="Score Distribution"
              items={[
                { label: 'Excellent (80-100)', value: stats.excellent, total: stats.total, color: 'green' },
                { label: 'Good (60-79)', value: stats.good, total: stats.total, color: 'blue' },
                { label: 'Fair (40-59)', value: stats.fair, total: stats.total, color: 'yellow' },
                { label: 'Poor (20-39)', value: stats.poor, total: stats.total, color: 'orange' },
                { label: 'Critical (<20)', value: stats.critical, total: stats.total, color: 'red' }
              ]}
            />

            {/* Score Trends */}
            <RankingList
              title="Biggest Improvements"
              items={healthScores
                .sort((a, b) => b.score_change - a.score_change)
                .slice(0, 5)
                .map((h, i) => ({
                  label: h.customer_name,
                  value: `${h.score_change > 0 ? '+' : ''}${h.score_change} points`,
                  rank: i + 1,
                  trend: h.score_change > 0 ? 'up' : h.score_change < 0 ? 'down' : 'same'
                }))}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Usage"
                value={`${stats.avgUsage.toFixed(0)}`}
                trend="up"
                change="+5"
              />
              <MiniKPI
                label="Avg Engagement"
                value={`${stats.avgEngagement.toFixed(0)}`}
                trend="up"
                change="+3"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Score improved',
                  subject: 'Customer +7 points',
                  time: '1 hour ago',
                  type: 'success'
                },
                {
                  action: 'Score declined',
                  subject: 'Customer -16 points',
                  time: '3 hours ago',
                  type: 'error'
                },
                {
                  action: 'Risk factor detected',
                  subject: 'Low usage alert - 3 customers',
                  time: '1 day ago',
                  type: 'warning'
                },
                {
                  action: 'Scores recalculated',
                  subject: 'All customers - Daily update',
                  time: '1 day ago',
                  type: 'info'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
