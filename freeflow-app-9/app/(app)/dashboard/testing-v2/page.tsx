"use client"

import { useState } from 'react'
import {
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  BarChart3,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  Zap,
  Code,
  FileText,
  Award
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type TestRunStatus = 'all' | 'running' | 'completed' | 'failed' | 'cancelled'
type TestSuite = 'all' | 'unit' | 'integration' | 'e2e' | 'smoke' | 'sanity'

export default function TestingV2Page() {
  const [status, setStatus] = useState<TestRunStatus>('all')
  const [suite, setSuite] = useState<TestSuite>('all')

  const stats = [
    {
      label: 'Total Test Runs',
      value: '1,247',
      change: '+18.2%',
      trend: 'up' as const,
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      label: 'Success Rate',
      value: '96.8%',
      change: '+8.4%',
      trend: 'up' as const,
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      label: 'Avg Duration',
      value: '12.4min',
      change: '-15.2%',
      trend: 'down' as const,
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      label: 'Tests Passed',
      value: '2,684',
      change: '+24.7%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  const quickActions = [
    {
      label: 'Run All Tests',
      description: 'Execute complete suite',
      icon: Play,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Smoke Test',
      description: 'Quick validation',
      icon: Zap,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Unit Tests',
      description: 'Run unit test suite',
      icon: Code,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'E2E Tests',
      description: 'End-to-end scenarios',
      icon: Activity,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Test Report',
      description: 'Generate test report',
      icon: FileText,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Export Results',
      description: 'Download test data',
      icon: Download,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Schedule Tests',
      description: 'Configure CI/CD',
      icon: Calendar,
      color: 'from-pink-500 to-rose-500'
    },
    {
      label: 'Analytics',
      description: 'View trends',
      icon: BarChart3,
      color: 'from-red-500 to-orange-500'
    }
  ]

  const testRuns = [
    {
      id: 'RUN-2847',
      name: 'Complete Regression Suite',
      suite: 'integration',
      status: 'running',
      triggeredBy: 'GitHub Actions',
      startTime: '2024-02-15 14:30',
      duration: 847,
      passed: 2456,
      failed: 0,
      skipped: 24,
      total: 2480,
      coverage: 89.4,
      branch: 'main',
      commit: 'a3f7c91',
      environment: 'Staging'
    },
    {
      id: 'RUN-2846',
      name: 'Unit Test Suite',
      suite: 'unit',
      status: 'completed',
      triggeredBy: 'Sarah Johnson',
      startTime: '2024-02-15 13:45',
      duration: 284,
      passed: 1847,
      failed: 12,
      skipped: 8,
      total: 1867,
      coverage: 92.7,
      branch: 'feature/payment',
      commit: 'b5e8d24',
      environment: 'Development'
    },
    {
      id: 'RUN-2845',
      name: 'E2E Critical Flows',
      suite: 'e2e',
      status: 'completed',
      triggeredBy: 'Jenkins CI',
      startTime: '2024-02-15 12:20',
      duration: 1847,
      passed: 284,
      failed: 0,
      skipped: 2,
      total: 286,
      coverage: 87.2,
      branch: 'main',
      commit: 'c2d9f83',
      environment: 'Production'
    },
    {
      id: 'RUN-2844',
      name: 'Smoke Test - Quick Validation',
      suite: 'smoke',
      status: 'completed',
      triggeredBy: 'Michael Chen',
      startTime: '2024-02-15 11:10',
      duration: 124,
      passed: 147,
      failed: 0,
      skipped: 0,
      total: 147,
      coverage: 65.4,
      branch: 'develop',
      commit: 'd4f1a62',
      environment: 'Staging'
    },
    {
      id: 'RUN-2843',
      name: 'Integration Tests - API',
      suite: 'integration',
      status: 'failed',
      triggeredBy: 'GitLab CI',
      startTime: '2024-02-15 10:30',
      duration: 624,
      passed: 456,
      failed: 28,
      skipped: 12,
      total: 496,
      coverage: 84.8,
      branch: 'feature/api-v2',
      commit: 'e6a2b91',
      environment: 'Staging'
    },
    {
      id: 'RUN-2842',
      name: 'Sanity Check - Pre-Deploy',
      suite: 'sanity',
      status: 'completed',
      triggeredBy: 'CircleCI',
      startTime: '2024-02-15 09:15',
      duration: 187,
      passed: 247,
      failed: 0,
      skipped: 1,
      total: 248,
      coverage: 72.3,
      branch: 'main',
      commit: 'f7b3c82',
      environment: 'Production'
    },
    {
      id: 'RUN-2841',
      name: 'Unit Tests - Backend',
      suite: 'unit',
      status: 'completed',
      triggeredBy: 'David Park',
      startTime: '2024-02-14 16:45',
      duration: 324,
      passed: 1284,
      failed: 8,
      skipped: 4,
      total: 1296,
      coverage: 94.2,
      branch: 'feature/backend',
      commit: 'g8c4d93',
      environment: 'Development'
    },
    {
      id: 'RUN-2840',
      name: 'E2E Payment Flow',
      suite: 'e2e',
      status: 'completed',
      triggeredBy: 'Emma Wilson',
      startTime: '2024-02-14 15:20',
      duration: 847,
      passed: 84,
      failed: 0,
      skipped: 1,
      total: 85,
      coverage: 91.8,
      branch: 'feature/payment',
      commit: 'h9d5e04',
      environment: 'Staging'
    },
    {
      id: 'RUN-2839',
      name: 'Integration - Database',
      suite: 'integration',
      status: 'cancelled',
      triggeredBy: 'Travis CI',
      startTime: '2024-02-14 14:10',
      duration: 156,
      passed: 124,
      failed: 0,
      skipped: 524,
      total: 648,
      coverage: 0,
      branch: 'feature/db-migration',
      commit: 'i0e6f15',
      environment: 'Staging'
    },
    {
      id: 'RUN-2838',
      name: 'Unit Tests - Frontend',
      suite: 'unit',
      status: 'completed',
      triggeredBy: 'Lisa Anderson',
      startTime: '2024-02-14 13:00',
      duration: 247,
      passed: 847,
      failed: 4,
      skipped: 2,
      total: 853,
      coverage: 88.5,
      branch: 'feature/ui-updates',
      commit: 'j1f7g26',
      environment: 'Development'
    }
  ]

  const filteredRuns = testRuns.filter(run => {
    const statusMatch = status === 'all' || run.status === status
    const suiteMatch = suite === 'all' || run.suite === suiteMatch
    return statusMatch && suiteMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Play,
          label: 'Running'
        }
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
          label: 'Completed'
        }
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Failed'
        }
      case 'cancelled':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Pause,
          label: 'Cancelled'
        }
      default:
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: status
        }
    }
  }

  const getSuiteBadge = (suite: string) => {
    switch (suite) {
      case 'unit':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'integration':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'e2e':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'smoke':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'sanity':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPassRate = (passed: number, total: number) => {
    if (total === 0) return 0
    return ((passed / total) * 100).toFixed(1)
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  const recentActivity = [
    { label: 'Test run completed', time: '10 minutes ago', color: 'text-green-600' },
    { label: 'Test suite started', time: '30 minutes ago', color: 'text-blue-600' },
    { label: 'Test failure detected', time: '1 hour ago', color: 'text-red-600' },
    { label: 'Coverage improved', time: '2 hours ago', color: 'text-purple-600' },
    { label: 'New tests added', time: '3 hours ago', color: 'text-orange-600' }
  ]

  const testsBySuite = [
    { label: 'Unit Tests', value: '1,847 tests', color: 'bg-purple-500' },
    { label: 'Integration', value: '847 tests', color: 'bg-blue-500' },
    { label: 'E2E Tests', value: '284 tests', color: 'bg-green-500' },
    { label: 'Smoke Tests', value: '147 tests', color: 'bg-orange-500' },
    { label: 'Sanity', value: '92 tests', color: 'bg-cyan-500' }
  ]

  const successRateData = {
    label: 'Success Rate',
    current: 96.8,
    target: 95,
    subtitle: 'Last 100 runs'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Test Execution
            </h1>
            <p className="text-gray-600 mt-2">Monitor and manage automated test runs</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Play className="w-4 h-4" />
              Run Tests
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setStatus('all')}
                  isActive={status === 'all'}
                  variant="default"
                >
                  All Runs
                </PillButton>
                <PillButton
                  onClick={() => setStatus('running')}
                  isActive={status === 'running'}
                  variant="default"
                >
                  Running
                </PillButton>
                <PillButton
                  onClick={() => setStatus('completed')}
                  isActive={status === 'completed'}
                  variant="default"
                >
                  Completed
                </PillButton>
                <PillButton
                  onClick={() => setStatus('failed')}
                  isActive={status === 'failed'}
                  variant="default"
                >
                  Failed
                </PillButton>
                <PillButton
                  onClick={() => setStatus('cancelled')}
                  isActive={status === 'cancelled'}
                  variant="default"
                >
                  Cancelled
                </PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Test Suite</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setSuite('all')}
                  isActive={suite === 'all'}
                  variant="default"
                >
                  All Suites
                </PillButton>
                <PillButton
                  onClick={() => setSuite('unit')}
                  isActive={suite === 'unit'}
                  variant="default"
                >
                  Unit
                </PillButton>
                <PillButton
                  onClick={() => setSuite('integration')}
                  isActive={suite === 'integration'}
                  variant="default"
                >
                  Integration
                </PillButton>
                <PillButton
                  onClick={() => setSuite('e2e')}
                  isActive={suite === 'e2e'}
                  variant="default"
                >
                  E2E
                </PillButton>
                <PillButton
                  onClick={() => setSuite('smoke')}
                  isActive={suite === 'smoke'}
                  variant="default"
                >
                  Smoke
                </PillButton>
                <PillButton
                  onClick={() => setSuite('sanity')}
                  isActive={suite === 'sanity'}
                  variant="default"
                >
                  Sanity
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Runs List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Test Run History</h2>
              <div className="text-sm text-gray-600">
                {filteredRuns.length} runs
              </div>
            </div>

            <div className="space-y-3">
              {filteredRuns.map((run) => {
                const statusBadge = getStatusBadge(run.status)
                const StatusIcon = statusBadge.icon
                const passRate = getPassRate(run.passed, run.total)

                return (
                  <div
                    key={run.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{run.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{run.id}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{run.triggeredBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium uppercase ${getSuiteBadge(run.suite)}`}>
                          {run.suite}
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Passed</div>
                        <div className="font-semibold text-green-600 text-lg">{run.passed}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Failed</div>
                        <div className="font-semibold text-red-600 text-lg">{run.failed}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Skipped</div>
                        <div className="font-semibold text-gray-600 text-lg">{run.skipped}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Duration</div>
                        <div className="font-medium text-gray-900">{formatDuration(run.duration)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Coverage</div>
                        <div className="font-medium text-blue-600">{run.coverage.toFixed(1)}%</div>
                      </div>
                    </div>

                    {run.status !== 'cancelled' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-600">Pass Rate: {run.passed} / {run.total}</span>
                          <span className="font-semibold text-gray-900">{passRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              run.failed === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              parseFloat(passRate) >= 90 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              'bg-gradient-to-r from-yellow-500 to-orange-500'
                            }`}
                            style={{ width: `${passRate}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          Branch: <span className="font-medium text-gray-900">{run.branch}</span>
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          Commit: <span className="font-mono text-gray-900">{run.commit}</span>
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{run.environment}</span>
                      </div>
                      <div className="text-gray-500">{run.startTime}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={successRateData.label}
              current={successRateData.current}
              target={successRateData.target}
              subtitle={successRateData.subtitle}
            />

            <MiniKPI
              title="Avg Duration"
              value="12.4min"
              change="-15.2%"
              trend="down"
              subtitle="Per test run"
            />

            <RankingList
              title="Tests by Suite"
              items={testsBySuite}
            />

            <ActivityFeed
              title="Recent Activity"
              items={recentActivity}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
