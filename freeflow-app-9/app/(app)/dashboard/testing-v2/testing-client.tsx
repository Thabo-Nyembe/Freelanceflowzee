'use client'

import { useState } from 'react'
import { useTestRuns, useTestingMutations, TestRun, formatDuration, getPassRate } from '@/lib/hooks/use-testing'
import {
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  Calendar,
  Plus
} from 'lucide-react'

interface TestingClientProps {
  initialRuns: TestRun[]
}

type TestRunStatus = 'all' | 'running' | 'completed' | 'failed' | 'cancelled'
type TestSuite = 'all' | 'unit' | 'integration' | 'e2e' | 'smoke' | 'sanity'

export default function TestingClient({ initialRuns }: TestingClientProps) {
  const [status, setStatus] = useState<TestRunStatus>('all')
  const [suite, setSuite] = useState<TestSuite>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { runs, stats, isLoading } = useTestRuns(initialRuns, {
    status: status === 'all' ? undefined : status,
    suiteType: suite === 'all' ? undefined : suite
  })
  const { createRun, isCreating } = useTestingMutations()

  const filteredRuns = runs.filter(run =>
    run.run_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    run.triggered_by?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    run.run_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'running':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Play, label: 'Running' }
      case 'completed':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, label: 'Completed' }
      case 'failed':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Failed' }
      case 'cancelled':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Pause, label: 'Cancelled' }
      default:
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: s }
    }
  }

  const getSuiteBadge = (s: string) => {
    switch (s) {
      case 'unit': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'integration': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'e2e': return 'bg-green-100 text-green-800 border-green-200'
      case 'smoke': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'sanity': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-green-600">+18.2%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Test Runs</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-green-600">+8.4%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Success Rate</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-green-600">-15.2%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.avgDuration)}</p>
            <p className="text-sm text-gray-500">Avg Duration</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-green-600">+24.7%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPassed.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Tests Passed</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'running', 'completed', 'failed', 'cancelled'] as TestRunStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      status === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s === 'all' ? 'All Runs' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Test Suite</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'unit', 'integration', 'e2e', 'smoke', 'sanity'] as TestSuite[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSuite(s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      suite === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s === 'all' ? 'All Suites' : s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Test Run History</h2>
              <div className="text-sm text-gray-600">{filteredRuns.length} runs</div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading test runs...</div>
            ) : filteredRuns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No test runs found</div>
            ) : (
              <div className="space-y-3">
                {filteredRuns.map((run) => {
                  const statusBadge = getStatusBadge(run.status)
                  const StatusIcon = statusBadge.icon
                  const passRate = getPassRate(run.passed_count, run.total_count)

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
                          <div>
                            <h3 className="font-semibold text-gray-900">{run.run_name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-500">{run.run_code}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{run.triggered_by || 'Manual'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full border text-xs font-medium uppercase ${getSuiteBadge(run.suite_type)}`}>
                            {run.suite_type}
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
                          <div className="font-semibold text-green-600 text-lg">{run.passed_count}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Failed</div>
                          <div className="font-semibold text-red-600 text-lg">{run.failed_count}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Skipped</div>
                          <div className="font-semibold text-gray-600 text-lg">{run.skipped_count}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Duration</div>
                          <div className="font-medium text-gray-900">{formatDuration(run.duration_seconds)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Coverage</div>
                          <div className="font-medium text-blue-600">{Number(run.coverage_percent).toFixed(1)}%</div>
                        </div>
                      </div>

                      {run.status !== 'cancelled' && run.total_count > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-gray-600">Pass Rate: {run.passed_count} / {run.total_count}</span>
                            <span className="font-semibold text-gray-900">{passRate}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                run.failed_count === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
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
                            Branch: <span className="font-medium text-gray-900">{run.branch_name || 'N/A'}</span>
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">
                            Commit: <span className="font-mono text-gray-900">{run.commit_hash || 'N/A'}</span>
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{run.environment || 'N/A'}</span>
                        </div>
                        <div className="text-gray-500">
                          {new Date(run.start_time).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Success Rate</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</span>
                  <span className="text-sm text-gray-500">of 95% target</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    style={{ width: `${Math.min(stats.successRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Run Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Running</span>
                  <span className="font-semibold text-blue-600">{stats.running}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Failed</span>
                  <span className="font-semibold text-red-600">{stats.failed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cancelled</span>
                  <span className="font-semibold text-gray-600">{stats.cancelled}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Passed</span>
                  <span className="font-semibold">{stats.totalPassed.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Failed</span>
                  <span className="font-semibold text-red-600">{stats.totalFailed.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
