'use client'

import { useState } from 'react'
import { useQATestCases, useQAMutations, QATestCase } from '@/lib/hooks/use-qa'
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  PlayCircle,
  Plus,
  Download
} from 'lucide-react'

interface QAClientProps {
  initialTestCases: QATestCase[]
}

type TestStatus = 'all' | 'passed' | 'failed' | 'pending' | 'blocked'
type TestType = 'all' | 'functional' | 'regression' | 'integration' | 'performance' | 'security'

export default function QAClient({ initialTestCases }: QAClientProps) {
  const [status, setStatus] = useState<TestStatus>('all')
  const [testType, setTestType] = useState<TestType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { testCases, stats, isLoading } = useQATestCases(initialTestCases, {
    status: status === 'all' ? undefined : status,
    testType: testType === 'all' ? undefined : testType
  })
  const { createTestCase, isCreating } = useQAMutations()

  const filteredTestCases = testCases.filter(test =>
    test.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.assignee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.test_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'passed':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, label: 'Passed' }
      case 'failed':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Failed' }
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' }
      case 'blocked':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, label: 'Blocked' }
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Target, label: s }
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Quality Assurance
            </h1>
            <p className="text-gray-600 mt-2">Manage test cases and quality metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Run Tests
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Test Case
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-green-600">+18.2%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Test Cases</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-green-600">+8.4%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgPassRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Pass Rate</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
              <span className="text-sm font-medium text-red-600">-24.7%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            <p className="text-sm text-gray-500">Failed Tests</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-green-600">+12.5%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.automated}</p>
            <p className="text-sm text-gray-500">Automated</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'passed', 'failed', 'pending', 'blocked'] as TestStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      status === s
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s === 'all' ? 'All Tests' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Test Type</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'functional', 'regression', 'integration', 'performance', 'security'] as TestType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTestType(t)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      testType === t
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
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
              <h2 className="text-xl font-semibold">Test Cases</h2>
              <div className="text-sm text-gray-600">{filteredTestCases.length} tests</div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading test cases...</div>
            ) : filteredTestCases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No test cases found</div>
            ) : (
              <div className="space-y-3">
                {filteredTestCases.map((test) => {
                  const statusBadge = getStatusBadge(test.status)
                  const StatusIcon = statusBadge.icon

                  return (
                    <div
                      key={test.id}
                      className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-green-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white">
                            <Target className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{test.test_name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-500">{test.test_code}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500 capitalize">{test.test_type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getPriorityBadge(test.priority)}`}>
                            {test.priority}
                          </div>
                          <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{test.description || 'No description'}</p>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Assignee</div>
                          <div className="font-medium text-gray-900 text-sm">{test.assignee_name || 'Unassigned'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Duration</div>
                          <div className="font-medium text-gray-900 text-sm">{Number(test.duration_seconds).toFixed(1)}s</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Pass Rate</div>
                          <div className="font-medium text-green-600 text-sm">{Number(test.pass_rate).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Executions</div>
                          <div className="font-medium text-gray-900 text-sm">{test.execution_count}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">
                            Environment: <span className="font-medium text-gray-900">{test.environment || 'N/A'}</span>
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">
                            Build: <span className="font-medium text-gray-900">{test.build_version || 'N/A'}</span>
                          </span>
                          {test.is_automated && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-md">
                                Automated
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-gray-500">
                          {test.last_run_at ? new Date(test.last_run_at).toLocaleString() : 'Never run'}
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
              <h3 className="text-lg font-semibold mb-4">Overall Pass Rate</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">{stats.avgPassRate.toFixed(1)}%</span>
                  <span className="text-sm text-gray-500">of 95% target</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-teal-500"
                    style={{ width: `${Math.min(stats.avgPassRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Test Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Passed</span>
                  <span className="font-semibold text-green-600">{stats.passed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Failed</span>
                  <span className="font-semibold text-red-600">{stats.failed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{stats.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Blocked</span>
                  <span className="font-semibold text-orange-600">{stats.blocked}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Automated</span>
                  <span className="font-semibold text-blue-600">{stats.automated}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
