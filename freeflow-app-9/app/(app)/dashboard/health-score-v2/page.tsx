'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type HealthCategory = 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
type ScoreComponent = 'product-usage' | 'engagement' | 'support' | 'financial' | 'sentiment'
type TrendDirection = 'improving' | 'stable' | 'declining'
type ViewMode = 'all' | 'excellent' | 'good' | 'declining'

export default function HealthScoreV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample health score data
  const healthScores = [
    {
      id: 'HS-2847',
      customer: 'Acme Corporation',
      overallScore: 92,
      category: 'excellent' as const,
      trend: 'improving' as const,
      productUsage: 87,
      engagement: 95,
      support: 92,
      financial: 98,
      sentiment: 88,
      lastUpdated: '2024-02-14',
      previousScore: 89,
      scoreChange: 3,
      riskFactors: 0,
      opportunities: 3,
      monthlyTrend: [85, 87, 89, 92]
    },
    {
      id: 'HS-2846',
      customer: 'TechStart Inc',
      overallScore: 42,
      category: 'poor' as const,
      trend: 'declining' as const,
      productUsage: 28,
      engagement: 32,
      support: 45,
      financial: 68,
      sentiment: 38,
      lastUpdated: '2024-02-14',
      previousScore: 58,
      scoreChange: -16,
      riskFactors: 5,
      opportunities: 1,
      monthlyTrend: [68, 62, 58, 42]
    },
    {
      id: 'HS-2845',
      customer: 'Global Solutions Ltd',
      overallScore: 88,
      category: 'excellent' as const,
      trend: 'stable' as const,
      productUsage: 92,
      engagement: 88,
      support: 84,
      financial: 95,
      sentiment: 82,
      lastUpdated: '2024-02-14',
      previousScore: 87,
      scoreChange: 1,
      riskFactors: 0,
      opportunities: 2,
      monthlyTrend: [86, 87, 87, 88]
    },
    {
      id: 'HS-2844',
      customer: 'StartupXYZ',
      overallScore: 65,
      category: 'fair' as const,
      trend: 'improving' as const,
      productUsage: 45,
      engagement: 72,
      support: 68,
      financial: 78,
      sentiment: 62,
      lastUpdated: '2024-02-14',
      previousScore: 58,
      scoreChange: 7,
      riskFactors: 2,
      opportunities: 4,
      monthlyTrend: [52, 55, 58, 65]
    },
    {
      id: 'HS-2843',
      customer: 'MidMarket Corp',
      overallScore: 74,
      category: 'good' as const,
      trend: 'stable' as const,
      productUsage: 68,
      engagement: 75,
      support: 72,
      financial: 82,
      sentiment: 73,
      lastUpdated: '2024-02-14',
      previousScore: 73,
      scoreChange: 1,
      riskFactors: 1,
      opportunities: 3,
      monthlyTrend: [72, 73, 73, 74]
    }
  ]

  const scoreComponents = [
    {
      id: 'COMP-1',
      name: 'Product Usage',
      weight: 30,
      avgScore: 68,
      description: 'Feature adoption and active usage'
    },
    {
      id: 'COMP-2',
      name: 'Engagement',
      weight: 25,
      avgScore: 72,
      description: 'User login frequency and session duration'
    },
    {
      id: 'COMP-3',
      name: 'Support Health',
      weight: 15,
      avgScore: 76,
      description: 'Ticket volume and satisfaction'
    },
    {
      id: 'COMP-4',
      name: 'Financial',
      weight: 20,
      avgScore: 84,
      description: 'Payment history and contract value'
    },
    {
      id: 'COMP-5',
      name: 'Sentiment',
      weight: 10,
      avgScore: 69,
      description: 'NPS and feedback scores'
    }
  ]

  const getCategoryColor = (category: HealthCategory) => {
    switch (category) {
      case 'excellent': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'good': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'fair': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'poor': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const getTrendColor = (trend: TrendDirection) => {
    switch (trend) {
      case 'improving': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'stable': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'declining': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const filteredScores = viewMode === 'all'
    ? healthScores
    : viewMode === 'declining'
    ? healthScores.filter(score => score.trend === 'declining')
    : healthScores.filter(score => score.category === viewMode)

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
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
              Recalculate Scores
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Avg Health Score',
              value: '76',
              change: '+3',
              trend: 'up' as const,
              subtitle: 'across all customers'
            },
            {
              label: 'Excellent Health',
              value: '124',
              change: '+12',
              trend: 'up' as const,
              subtitle: 'score 80+'
            },
            {
              label: 'Declining Scores',
              value: '18',
              change: '-6',
              trend: 'up' as const,
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
                            {score.customer}
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
                            Updated: {score.lastUpdated}
                          </span>
                          <span className={`flex items-center gap-1 ${score.scoreChange > 0 ? 'text-green-600 dark:text-green-400' : score.scoreChange < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                            <span className="text-cyan-500">{score.scoreChange > 0 ? '↑' : score.scoreChange < 0 ? '↓' : '→'}</span>
                            {score.scoreChange > 0 ? '+' : ''}{score.scoreChange} from last month
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-cyan-500">⚠️</span>
                            {score.riskFactors} risks
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(score.overallScore)}`}>
                          {score.overallScore}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Overall Score
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-center">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Usage</div>
                        <div className={`text-lg font-bold ${getScoreColor(score.productUsage)}`}>
                          {score.productUsage}
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
                        <div className={`text-lg font-bold ${getScoreColor(score.support)}`}>
                          {score.support}
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

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                        <span>Health Trend (Last 4 Months)</span>
                        <span>Score: {score.overallScore}/100</span>
                      </div>
                      <div className="flex items-end gap-1 h-12">
                        {score.monthlyTrend.map((value, index) => (
                          <div
                            key={index}
                            className="flex-1 bg-gradient-to-t from-cyan-600 to-teal-600 rounded-t transition-all duration-300 hover:opacity-80"
                            style={{ height: `${value}%` }}
                            title={`Month ${index + 1}: ${value}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            {score.riskFactors} Risk Factors
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Score Components */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Score Components</h3>
              <div className="space-y-3">
                {scoreComponents.map((component) => (
                  <div key={component.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-slate-900 dark:text-white text-sm">
                        {component.name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {component.weight}% weight
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {component.description}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Avg: {component.avgScore}</span>
                    </div>
                    <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-600 to-teal-600 rounded-full"
                        style={{ width: `${component.avgScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Distribution */}
            <ProgressCard
              title="Score Distribution"
              items={[
                { label: 'Excellent (80-100)', value: 124, total: 284, color: 'green' },
                { label: 'Good (60-79)', value: 98, total: 284, color: 'blue' },
                { label: 'Fair (40-59)', value: 42, total: 284, color: 'yellow' },
                { label: 'Poor (20-39)', value: 12, total: 284, color: 'orange' },
                { label: 'Critical (<20)', value: 8, total: 284, color: 'red' }
              ]}
            />

            {/* Score Trends */}
            <RankingList
              title="Biggest Improvements"
              items={[
                { label: 'StartupXYZ', value: '+7 points', rank: 1, trend: 'up' },
                { label: 'Acme Corp', value: '+3 points', rank: 2, trend: 'up' },
                { label: 'Global Solutions', value: '+1 point', rank: 3, trend: 'up' },
                { label: 'MidMarket', value: '+1 point', rank: 4, trend: 'up' },
                { label: 'TechStart', value: '-16 points', rank: 5, trend: 'down' }
              ]}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Change"
                value="+2.4"
                trend="up"
                change="+0.8"
              />
              <MiniKPI
                label="Volatility"
                value="Low"
                trend="up"
                change="Stable"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Score improved',
                  subject: 'StartupXYZ +7 points',
                  time: '1 hour ago',
                  type: 'success'
                },
                {
                  action: 'Score declined',
                  subject: 'TechStart -16 points',
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
