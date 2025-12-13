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
  AlertCircle
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type AuditStatus = 'passed' | 'failed' | 'warning' | 'in-progress' | 'scheduled'
type AuditType = 'access-control' | 'data-encryption' | 'compliance' | 'penetration-test' | 'code-review' | 'infrastructure'
type Severity = 'low' | 'medium' | 'high' | 'critical'
type ComplianceStandard = 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS'

interface SecurityAudit {
  id: string
  name: string
  description: string
  type: AuditType
  status: AuditStatus
  severity: Severity
  compliance: ComplianceStandard[]
  auditedBy: string
  startedAt: string
  completedAt: string
  duration: number
  findings: {
    critical: number
    high: number
    medium: number
    low: number
  }
  recommendations: number
  remediated: number
  score: number
}

export default function SecurityAuditPage() {
  const [viewMode, setViewMode] = useState<'all' | AuditStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | AuditType>('all')

  const audits: SecurityAudit[] = [
    {
      id: 'AUD-2847',
      name: 'Q1 2024 Access Control Audit',
      description: 'Comprehensive review of user access permissions and role-based controls',
      type: 'access-control',
      status: 'passed',
      severity: 'high',
      compliance: ['SOC2', 'ISO27001'],
      auditedBy: 'Security Team',
      startedAt: '2024-01-10 09:00',
      completedAt: '2024-01-12 17:00',
      duration: 172800,
      findings: {
        critical: 0,
        high: 2,
        medium: 5,
        low: 8
      },
      recommendations: 15,
      remediated: 12,
      score: 92
    },
    {
      id: 'AUD-2848',
      name: 'Data Encryption Compliance Check',
      description: 'Verify encryption standards for data at rest and in transit',
      type: 'data-encryption',
      status: 'in-progress',
      severity: 'critical',
      compliance: ['GDPR', 'HIPAA', 'PCI-DSS'],
      auditedBy: 'External Auditor',
      startedAt: '2024-01-15 08:00',
      completedAt: '',
      duration: 0,
      findings: {
        critical: 1,
        high: 3,
        medium: 4,
        low: 2
      },
      recommendations: 10,
      remediated: 5,
      score: 0
    },
    {
      id: 'AUD-2849',
      name: 'SOC2 Type II Compliance Audit',
      description: 'Annual SOC2 Type II compliance assessment',
      type: 'compliance',
      status: 'passed',
      severity: 'critical',
      compliance: ['SOC2'],
      auditedBy: 'KPMG',
      startedAt: '2024-01-05 00:00',
      completedAt: '2024-01-14 23:59',
      duration: 864000,
      findings: {
        critical: 0,
        high: 1,
        medium: 3,
        low: 12
      },
      recommendations: 16,
      remediated: 15,
      score: 96
    },
    {
      id: 'AUD-2850',
      name: 'Penetration Testing - Web Application',
      description: 'External penetration testing of web application and APIs',
      type: 'penetration-test',
      status: 'failed',
      severity: 'critical',
      compliance: ['ISO27001'],
      auditedBy: 'Red Team Security',
      startedAt: '2024-01-08 10:00',
      completedAt: '2024-01-10 18:00',
      duration: 201600,
      findings: {
        critical: 3,
        high: 7,
        medium: 12,
        low: 18
      },
      recommendations: 40,
      remediated: 8,
      score: 65
    },
    {
      id: 'AUD-2851',
      name: 'Infrastructure Security Review',
      description: 'Cloud infrastructure and network security assessment',
      type: 'infrastructure',
      status: 'warning',
      severity: 'high',
      compliance: ['ISO27001', 'SOC2'],
      auditedBy: 'DevSecOps Team',
      startedAt: '2024-01-12 08:00',
      completedAt: '2024-01-13 17:00',
      duration: 118800,
      findings: {
        critical: 1,
        high: 4,
        medium: 9,
        low: 15
      },
      recommendations: 29,
      remediated: 18,
      score: 78
    },
    {
      id: 'AUD-2852',
      name: 'Code Security Review',
      description: 'Static and dynamic code analysis for security vulnerabilities',
      type: 'code-review',
      status: 'scheduled',
      severity: 'medium',
      compliance: ['PCI-DSS'],
      auditedBy: 'Security Engineering',
      startedAt: '2024-01-20 09:00',
      completedAt: '',
      duration: 0,
      findings: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      recommendations: 0,
      remediated: 0,
      score: 0
    }
  ]

  const filteredAudits = audits.filter(audit => {
    if (viewMode !== 'all' && audit.status !== viewMode) return false
    if (typeFilter !== 'all' && audit.type !== typeFilter) return false
    return true
  })

  const totalAudits = audits.length
  const passedAudits = audits.filter(a => a.status === 'passed').length
  const totalFindings = audits.reduce((sum, a) => sum + a.findings.critical + a.findings.high + a.findings.medium + a.findings.low, 0)
  const avgScore = audits.filter(a => a.score > 0).reduce((sum, a) => sum + a.score, 0) / audits.filter(a => a.score > 0).length

  const getStatusColor = (status: AuditStatus) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'in-progress': return 'text-blue-600 bg-blue-50'
      case 'scheduled': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityColor = (severity: Severity) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-gray-800 to-zinc-900 bg-clip-text text-transparent mb-2">
            Security Audits
          </h1>
          <p className="text-slate-600">Compliance audits, security assessments, and penetration testing</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Audits',
              value: totalAudits.toString(),
              icon: Shield,
              trend: { value: 8, isPositive: true },
              color: 'slate'
            },
            {
              label: 'Passed',
              value: passedAudits.toString(),
              icon: CheckCircle2,
              trend: { value: 15, isPositive: true },
              color: 'green'
            },
            {
              label: 'Total Findings',
              value: totalFindings.toString(),
              icon: AlertTriangle,
              trend: { value: 12, isPositive: false },
              color: 'orange'
            },
            {
              label: 'Avg Score',
              value: `${avgScore.toFixed(0)}%`,
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
              onClick: () => console.log('New audit')
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
            {filteredAudits.map((audit) => (
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
                    <p className="text-xs text-slate-500">Audit ID: {audit.id}</p>
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
                    {audit.compliance.map((standard, idx) => (
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
                      <span className="text-sm font-medium text-red-700">{audit.findings.critical}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">High</p>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">{audit.findings.high}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Medium</p>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">{audit.findings.medium}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Low</p>
                    <div className="flex items-center gap-1">
                      <Info className="w-3 h-3 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{audit.findings.low}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Recommendations</p>
                    <p className="text-sm font-medium text-slate-900">{audit.recommendations}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Remediated</p>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{audit.remediated}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Audited By</p>
                    <span className="text-sm font-medium text-slate-900">{audit.auditedBy}</span>
                  </div>
                </div>

                {audit.score > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">Security Score</span>
                      <span className="text-xs font-medium text-slate-900">{audit.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-slate-500 to-gray-600"
                        style={{ width: `${audit.score}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-500 to-gray-600 text-white rounded-lg text-sm font-medium hover:from-slate-600 hover:to-gray-700 transition-all">
                    View Report
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Findings
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Remediate
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Security Score */}
            <MiniKPI
              label="Avg Security Score"
              value={`${avgScore.toFixed(0)}%`}
              icon={Shield}
              trend={{ value: 5.3, isPositive: true }}
              className="bg-gradient-to-br from-slate-500 to-gray-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Audits"
              activities={[
                {
                  id: '1',
                  title: 'Encryption audit in progress',
                  description: '10 findings identified',
                  timestamp: '2 hours ago',
                  type: 'info'
                },
                {
                  id: '2',
                  title: 'SOC2 audit passed',
                  description: 'Score: 96%',
                  timestamp: '1 day ago',
                  type: 'success'
                },
                {
                  id: '3',
                  title: 'Pen test failed',
                  description: '40 vulnerabilities found',
                  timestamp: '5 days ago',
                  type: 'error'
                },
                {
                  id: '4',
                  title: 'Access control passed',
                  description: 'Score: 92%',
                  timestamp: '3 days ago',
                  type: 'success'
                }
              ]}
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
              title="Overall Compliance"
              progress={89}
              subtitle="Across all standards"
              color="slate"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
