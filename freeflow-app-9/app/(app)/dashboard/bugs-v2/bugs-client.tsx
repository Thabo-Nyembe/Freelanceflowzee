'use client'

import { useState } from 'react'
import { useBugs, useBugMutations, Bug, getSeverityColor, getPriorityColor, getStatusColor } from '@/lib/hooks/use-bugs'
import {
  Bug as BugIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Download,
  Plus,
  Search,
  Code,
  FileText,
  Activity,
  Zap,
  Target
} from 'lucide-react'

interface BugsClientProps {
  initialBugs: Bug[]
}

type BugStatus = 'all' | 'open' | 'in-progress' | 'resolved' | 'closed' | 'wont-fix'
type BugSeverity = 'all' | 'critical' | 'high' | 'medium' | 'low'

export default function BugsClient({ initialBugs }: BugsClientProps) {
  const [status, setStatus] = useState<BugStatus>('all')
  const [severity, setSeverity] = useState<BugSeverity>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { bugs, stats, isLoading } = useBugs(initialBugs, {
    status: status === 'all' ? undefined : status,
    severity: severity === 'all' ? undefined : severity
  })
  const { createBug, isCreating } = useBugMutations()

  const filteredBugs = bugs.filter(bug =>
    bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bug.bug_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bug.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'open':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, label: 'Open' }
      case 'in-progress':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Activity, label: 'In Progress' }
      case 'resolved':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, label: 'Resolved' }
      case 'closed':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle, label: 'Closed' }
      case 'wont-fix':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: XCircle, label: "Won't Fix" }
      default:
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: s }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Bug Tracking
            </h1>
            <p className="text-gray-600 mt-2">Track and resolve software defects</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Report Bug
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <BugIcon className="w-8 h-8 text-red-600" />
              <span className="text-sm font-medium text-red-600">-18.2%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Bugs</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-red-600">-24.7%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
            <p className="text-sm text-gray-500">Open Bugs</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-green-600">+32.4%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            <p className="text-sm text-gray-500">Resolved</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-green-600">-15.8%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgResolutionDays.toFixed(1)}d</p>
            <p className="text-sm text-gray-500">Avg Fix Time</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Report Bug', icon: Plus, color: 'from-red-500 to-pink-500' },
              { label: 'Triage Bugs', icon: Target, color: 'from-orange-500 to-amber-500' },
              { label: 'Bug Analytics', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
              { label: 'Export Report', icon: Download, color: 'from-green-500 to-emerald-500' },
              { label: 'Code Analysis', icon: Code, color: 'from-purple-500 to-violet-500' },
              { label: 'Auto-Assign', icon: Zap, color: 'from-indigo-500 to-purple-500' },
              { label: 'Release Notes', icon: FileText, color: 'from-teal-500 to-cyan-500' },
              { label: 'Hot Fixes', icon: Activity, color: 'from-pink-500 to-rose-500' }
            ].map((action) => (
              <button
                key={action.label}
                className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 mx-auto`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-gray-900 text-center">{action.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'open', 'in-progress', 'resolved', 'closed', 'wont-fix'] as BugStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      status === s
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s === 'all' ? 'All Bugs' : s === 'wont-fix' ? "Won't Fix" : s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Severity</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'critical', 'high', 'medium', 'low'] as BugSeverity[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      severity === s
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s === 'all' ? 'All Severities' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bugs List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Bug Reports</h2>
              <div className="text-sm text-gray-600">{filteredBugs.length} bugs</div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading bugs...</div>
            ) : filteredBugs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No bugs found</div>
            ) : (
              <div className="space-y-3">
                {filteredBugs.map((bug) => {
                  const statusBadge = getStatusBadge(bug.status)
                  const StatusIcon = statusBadge.icon

                  return (
                    <div
                      key={bug.id}
                      className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-red-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white">
                            <BugIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{bug.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-500">{bug.bug_code}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{bug.priority}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{bug.category || 'Uncategorized'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getSeverityColor(bug.severity)}`}>
                            {bug.severity}
                          </div>
                          <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </div>
                        </div>
                      </div>

                      {bug.description && (
                        <p className="text-sm text-gray-600 mb-4">{bug.description}</p>
                      )}

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Assignee</div>
                          <div className="font-medium text-gray-900 text-sm">{bug.assignee_name || 'Unassigned'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Reporter</div>
                          <div className="font-medium text-gray-900 text-sm">{bug.reporter_name || 'Unknown'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Created</div>
                          <div className="font-medium text-gray-900 text-sm">
                            {new Date(bug.created_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Due Date</div>
                          <div className="font-medium text-gray-900 text-sm">
                            {bug.due_date ? new Date(bug.due_date).toLocaleDateString() : 'Not set'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">
                            Version: <span className="font-medium text-gray-900">{bug.affected_version || 'N/A'}</span>
                          </span>
                          {bug.target_version && (
                            <>
                              <span className="text-gray-400">→</span>
                              <span className="text-gray-600">
                                Fix: <span className="font-medium text-gray-900">{bug.target_version}</span>
                              </span>
                            </>
                          )}
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{bug.votes} votes</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{bug.watchers} watchers</span>
                        </div>
                        <div className="text-gray-500">
                          {new Date(bug.last_updated).toLocaleString()}
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
              <h3 className="text-lg font-semibold mb-4">Resolution Rate</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">
                    {stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                  <span className="text-sm text-gray-500">of 85% target</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                    style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Bugs by Severity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Critical</span>
                  <span className="font-semibold text-red-600">{stats.critical}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">High</span>
                  <span className="font-semibold text-orange-600">{stats.high}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Medium</span>
                  <span className="font-semibold text-yellow-600">{stats.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Low</span>
                  <span className="font-semibold text-blue-600">{stats.low}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Status Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Open</span>
                  <span className="font-semibold text-red-600">{stats.open}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-semibold text-blue-600">{stats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resolved</span>
                  <span className="font-semibold text-green-600">{stats.resolved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Closed</span>
                  <span className="font-semibold text-gray-600">{stats.closed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
