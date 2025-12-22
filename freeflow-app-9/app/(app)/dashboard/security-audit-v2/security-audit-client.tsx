'use client'

import { useState } from 'react'
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  TrendingUp,
  Settings,
  Lock,
  Unlock,
  Key,
  Eye,
  FileText,
  Users,
  Server,
  Database,
  Cloud,
  BarChart3,
  Calendar,
  Filter,
  Zap,
  Bell,
  AlertCircle,
  Info,
  Play,
  Pause,
  RefreshCw,
  Plus
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import { useSecurityAudits, SecurityAudit } from '@/lib/hooks/use-security-audits'

type AuditStatus = 'passed' | 'failed' | 'warning' | 'in-progress' | 'scheduled' | 'cancelled'
type AuditType = 'access-control' | 'data-encryption' | 'compliance' | 'penetration-test' | 'code-review' | 'infrastructure'

interface SecurityAuditClientProps {
  initialAudits: SecurityAudit[]
  initialStats: {
    total: number
    scheduled: number
    inProgress: number
    passed: number
    failed: number
    warning: number
    totalFindings: number
    avgScore: number
    remediationRate: number
  }
}

export default function SecurityAuditClient({ initialAudits, initialStats }: SecurityAuditClientProps) {
  const [viewMode, setViewMode] = useState<'all' | AuditStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | AuditType>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const {
    audits: realtimeAudits,
    loading,
    createAudit,
    updateAudit,
    deleteAudit,
    startAudit,
    completeAudit,
    cancelAudit,
    getStats
  } = useSecurityAudits()

  // Use realtime data if available, otherwise use initial data
  const audits = realtimeAudits.length > 0 ? realtimeAudits : initialAudits
  const stats = realtimeAudits.length > 0 ? getStats() : initialStats

  const filteredAudits = audits.filter(audit => {
    if (viewMode !== 'all' && audit.status !== viewMode) return false
    if (typeFilter !== 'all' && audit.audit_type !== typeFilter) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'in-progress': return 'text-blue-600 bg-blue-50'
      case 'scheduled': return 'text-purple-600 bg-purple-50'
      case 'cancelled': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'N/A'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    return days > 0 ? `${days}d ${hours}h` : `${hours}h`
  }

  const handleCreateAudit = async () => {
    try {
      await createAudit({
        name: 'New Security Audit',
        description: 'Security audit description',
        audit_type: 'compliance',
        severity: 'medium',
        compliance_standards: ['SOC2']
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create audit:', error)
    }
  }

  const handleStartAudit = async (id: string) => {
    try {
      await startAudit(id)
    } catch (error) {
      console.error('Failed to start audit:', error)
    }
  }

  const handleCompleteAudit = async (id: string, status: 'passed' | 'failed' | 'warning') => {
    try {
      await completeAudit(id, status)
    } catch (error) {
      console.error('Failed to complete audit:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-gray-800 to-zinc-900 bg-clip-text text-transparent mb-2">
              Security Audits
            </h1>
            <p className="text-slate-600">Compliance audits, security assessments, and penetration testing</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Audit
          </button>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Audits',
              value: stats.total.toString(),
              icon: Shield,
              trend: { value: 8, isPositive: true },
              color: 'slate'
            },
            {
              label: 'Passed',
              value: stats.passed.toString(),
              icon: CheckCircle2,
              trend: { value: 15, isPositive: true },
              color: 'green'
            },
            {
              label: 'Total Findings',
              value: stats.totalFindings.toString(),
              icon: AlertTriangle,
              trend: { value: 12, isPositive: false },
              color: 'orange'
            },
            {
              label: 'Avg Score',
              value: `${stats.avgScore.toFixed(0)}%`,
              icon: TrendingUp,
              trend: { value: 5.3, isPositive: true },
              color: 'blue'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'New Audit',
              description: 'Schedule audit',
              icon: Shield,
              gradient: 'from-slate-500 to-gray-600',
              onClick: () => setShowCreateModal(true)
            },
            {
              title: 'Compliance Dashboard',
              description: 'View standards',
              icon: FileText,
              gradient: 'from-blue-500 to-indigo-600',
              onClick: () => console.log('Compliance')
            },
            {
              title: 'Findings Report',
              description: 'Export results',
              icon: BarChart3,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Report')
            },
            {
              title: 'Remediation Plan',
              description: 'Fix vulnerabilities',
              icon: CheckCircle2,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Remediation')
            },
            {
              title: 'Access Logs',
              description: 'Audit trail',
              icon: Eye,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Logs')
            },
            {
              title: 'Penetration Test',
              description: 'Security testing',
              icon: AlertTriangle,
              gradient: 'from-red-500 to-rose-600',
              onClick: () => console.log('Pen test')
            },
            {
              title: 'Settings',
              description: 'Configure audits',
              icon: Settings,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('Settings')
            },
            {
              title: 'Alert Rules',
              description: 'Set notifications',
              icon: Bell,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('Alerts')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Audits"
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label="Passed"
              isActive={viewMode === 'passed'}
              onClick={() => setViewMode('passed')}
            />
            <PillButton
              label="Failed"
              isActive={viewMode === 'failed'}
              onClick={() => setViewMode('failed')}
            />
            <PillButton
              label="In Progress"
              isActive={viewMode === 'in-progress'}
              onClick={() => setViewMode('in-progress')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Types"
              isActive={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            />
            <PillButton
              label="Compliance"
              isActive={typeFilter === 'compliance'}
              onClick={() => setTypeFilter('compliance')}
            />
            <PillButton
              label="Pen Test"
              isActive={typeFilter === 'penetration-test'}
              onClick={() => setTypeFilter('penetration-test')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Audits List */}
          <div className="lg:col-span-2 space-y-4">
            {loading && audits.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
                <RefreshCw className="w-8 h-8 text-slate-400 mx-auto mb-4 animate-spin" />
                <p className="text-slate-600">Loading audits...</p>
              </div>
            ) : filteredAudits.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No audits found</h3>
                <p className="text-slate-600 mb-4">Get started by scheduling your first security audit</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-slate-500 to-gray-600 text-white rounded-lg text-sm font-medium"
                >
                  Schedule Audit
                </button>
              </div>
            ) : (
              filteredAudits.map((audit) => (
                <div
                  key={audit.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-slate-600" />
                        <h3 className="font-semibold text-slate-900">{audit.name}</h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{audit.description}</p>
                      <p className="text-xs text-slate-500">Audit ID: {audit.audit_code}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                        {audit.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(audit.severity)}`}>
                        {audit.severity}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Compliance Standards</p>
                    <div className="flex flex-wrap gap-2">
                      {audit.compliance_standards?.map((standard, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {standard}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Critical</p>
                      <div className="flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-600" />
                        <span className="text-sm font-medium text-red-700">{audit.findings_critical}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-1">High</p>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-orange-600" />
                        <span className="text-sm font-medium text-orange-700">{audit.findings_high}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-1">Medium</p>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-700">{audit.findings_medium}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-1">Low</p>
                      <div className="flex items-center gap-1">
                        <Info className="w-3 h-3 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{audit.findings_low}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Recommendations</p>
                      <p className="text-sm font-medium text-slate-900">{audit.total_recommendations}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-1">Remediated</p>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{audit.remediated_count}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-1">Audited By</p>
                      <span className="text-sm font-medium text-slate-900">{audit.audited_by || 'N/A'}</span>
                    </div>
                  </div>

                  {audit.security_score && audit.security_score > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">Security Score</span>
                        <span className="text-xs font-medium text-slate-900">{audit.security_score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-slate-500 to-gray-600"
                          style={{ width: `${audit.security_score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    {audit.status === 'scheduled' && (
                      <button
                        onClick={() => handleStartAudit(audit.id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start Audit
                      </button>
                    )}
                    {audit.status === 'in-progress' && (
                      <>
                        <button
                          onClick={() => handleCompleteAudit(audit.id, 'passed')}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium"
                        >
                          Mark Passed
                        </button>
                        <button
                          onClick={() => handleCompleteAudit(audit.id, 'failed')}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                        >
                          Mark Failed
                        </button>
                      </>
                    )}
                    {(audit.status === 'passed' || audit.status === 'failed' || audit.status === 'warning') && (
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-500 to-gray-600 text-white rounded-lg text-sm font-medium hover:from-slate-600 hover:to-gray-700 transition-all">
                        View Report
                      </button>
                    )}
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                      Findings
                    </button>
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                      Remediate
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Security Score */}
            <MiniKPI
              label="Avg Security Score"
              value={`${stats.avgScore.toFixed(0)}%`}
              icon={Shield}
              trend={{ value: 5.3, isPositive: true }}
              className="bg-gradient-to-br from-slate-500 to-gray-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Audits"
              activities={audits.slice(0, 4).map((audit, idx) => ({
                id: audit.id,
                title: audit.name,
                description: `${audit.findings_critical + audit.findings_high} critical/high findings`,
                timestamp: new Date(audit.created_at).toLocaleDateString(),
                type: audit.status === 'passed' ? 'success' :
                      audit.status === 'failed' ? 'error' :
                      audit.status === 'in-progress' ? 'info' : 'warning'
              }))}
            />

            {/* Compliance Stats */}
            <RankingList
              title="Compliance Coverage"
              items={[
                { label: 'SOC2', value: '96%', rank: 1 },
                { label: 'ISO27001', value: '92%', rank: 2 },
                { label: 'GDPR', value: '88%', rank: 3 },
                { label: 'HIPAA', value: '85%', rank: 4 },
                { label: 'PCI-DSS', value: '82%', rank: 5 }
              ]}
            />

            {/* Overall Compliance */}
            <ProgressCard
              title="Remediation Rate"
              progress={stats.remediationRate}
              subtitle="Issues remediated"
              color="slate"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
