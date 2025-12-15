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
  useSurveys,
  useSurveyMutations,
  getSurveyStatusColor,
  getSurveyTypeColor,
  formatSurveyDate,
  calculateResponseRate,
  calculateSurveyProgress,
  type Survey
} from '@/lib/hooks/use-surveys'

type ViewMode = 'all' | 'active' | 'closed' | 'draft'

interface SurveysClientProps {
  initialSurveys: Survey[]
}

export default function SurveysClient({ initialSurveys }: SurveysClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const { surveys, stats, isLoading } = useSurveys(initialSurveys, {
    status: viewMode === 'all' ? undefined : viewMode
  })

  const { createSurvey, publishSurvey, isCreating } = useSurveyMutations()

  const filteredSurveys = viewMode === 'all'
    ? surveys
    : surveys.filter(survey => survey.status === viewMode)

  const handleCreateSurvey = () => {
    createSurvey({
      title: 'New Survey',
      description: 'Survey description',
      survey_type: 'customer-feedback',
      target_responses: 100
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-green-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Surveys
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Gather insights and feedback from your audience
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateSurvey}
              disabled={isCreating}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Survey'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Surveys',
              value: stats.total.toString(),
              change: '+15',
              trend: 'up' as const,
              subtitle: 'all time'
            },
            {
              label: 'Total Responses',
              value: stats.totalResponses.toLocaleString(),
              change: '+28.7%',
              trend: 'up' as const,
              subtitle: 'this month'
            },
            {
              label: 'Avg Completion',
              value: `${stats.avgCompletionRate.toFixed(1)}%`,
              change: '+6.4%',
              trend: 'up' as const,
              subtitle: 'completion rate'
            },
            {
              label: 'Avg NPS Score',
              value: stats.avgNPS > 0 ? stats.avgNPS.toFixed(0) : 'N/A',
              change: '+8.2',
              trend: 'up' as const,
              subtitle: 'across surveys'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Create Survey', icon: '➕', onClick: handleCreateSurvey },
            { label: 'Publish Survey', icon: '📤', onClick: () => {} },
            { label: 'Schedule Survey', icon: '📅', onClick: () => {} },
            { label: 'View Analytics', icon: '📊', onClick: () => {} },
            { label: 'Export Responses', icon: '📥', onClick: () => {} },
            { label: 'Import Questions', icon: '📤', onClick: () => {} },
            { label: 'Manage Templates', icon: '📋', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Surveys"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Active"
            isActive={viewMode === 'active'}
            onClick={() => setViewMode('active')}
          />
          <PillButton
            label="Closed"
            isActive={viewMode === 'closed'}
            onClick={() => setViewMode('closed')}
          />
          <PillButton
            label="Drafts"
            isActive={viewMode === 'draft'}
            onClick={() => setViewMode('draft')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Surveys List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Surveys ({filteredSurveys.length})
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : filteredSurveys.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No surveys found. Click "Create Survey" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSurveys.map((survey) => (
                    <div
                      key={survey.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-green-500/50 dark:hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs border ${getSurveyStatusColor(survey.status)}`}>
                              {survey.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getSurveyTypeColor(survey.survey_type)}`}>
                              {survey.survey_type}
                            </span>
                            {survey.nps_score && (
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                NPS: {survey.nps_score}
                              </span>
                            )}
                            {survey.csat_score && (
                              <span className="px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                CSAT: {survey.csat_score}/10
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mb-2">
                            {survey.title}
                          </h3>
                          {survey.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                              {survey.description}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {survey.survey_code} • Created by {survey.created_by || 'Unknown'} • {formatSurveyDate(survey.created_at)}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                          View
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Questions</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{survey.total_questions}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Responses</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{survey.total_responses.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Completion</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{Number(survey.completion_rate).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Avg Time</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{Number(survey.average_time).toFixed(1)} min</div>
                        </div>
                      </div>

                      {survey.status !== 'draft' && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                          <div>
                            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                              <span>Response Progress</span>
                              <span>{survey.total_responses.toLocaleString()} / {survey.target_responses.toLocaleString()} ({calculateSurveyProgress(survey.total_responses, survey.target_responses)}%)</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-full transition-all"
                                style={{ width: `${Math.min(calculateSurveyProgress(survey.total_responses, survey.target_responses), 100)}%` }}
                              />
                            </div>
                          </div>

                          {survey.sent_to > 0 && (
                            <div>
                              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                                <span>Response Rate</span>
                                <span>{calculateResponseRate(survey.total_responses, survey.sent_to)}%</span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all"
                                  style={{ width: `${calculateResponseRate(survey.total_responses, survey.sent_to)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {survey.tags && survey.tags.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex flex-wrap gap-2">
                            {survey.tags.map((tag, index) => (
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

            {/* Survey Status */}
            <ProgressCard
              title="Survey Status"
              items={[
                { label: 'Active', value: stats.active, total: stats.total, color: 'green' },
                { label: 'Closed', value: stats.closed, total: stats.total, color: 'blue' },
                { label: 'Paused', value: stats.paused, total: stats.total, color: 'yellow' },
                { label: 'Draft', value: stats.draft, total: stats.total, color: 'gray' }
              ]}
            />

            {/* Top Performing Surveys */}
            <RankingList
              title="Best Performers"
              items={surveys
                .filter(s => s.completion_rate > 0)
                .sort((a, b) => Number(b.completion_rate) - Number(a.completion_rate))
                .slice(0, 5)
                .map((s, i) => ({
                  label: s.title.substring(0, 30) + (s.title.length > 30 ? '...' : ''),
                  value: `${Number(s.completion_rate).toFixed(1)}% completion`,
                  rank: i + 1,
                  trend: 'up'
                }))}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Response Time"
                value={surveys.length > 0 ? `${(surveys.reduce((s, survey) => s + Number(survey.average_time), 0) / surveys.length).toFixed(1)} min` : 'N/A'}
                trend="down"
                change="-12%"
              />
              <MiniKPI
                label="Active Surveys"
                value={stats.active.toString()}
                trend="up"
                change="+3"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Survey published',
                  subject: 'Product Feedback survey activated',
                  time: '1 hour ago',
                  type: 'success'
                },
                {
                  action: 'Target reached',
                  subject: 'Employee Engagement survey completed',
                  time: '2 days ago',
                  type: 'success'
                },
                {
                  action: 'High response rate',
                  subject: 'NPS survey achieved 91.7% completion',
                  time: '3 days ago',
                  type: 'info'
                },
                {
                  action: 'Survey closed',
                  subject: 'Website Usability survey ended',
                  time: '1 week ago',
                  type: 'warning'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
