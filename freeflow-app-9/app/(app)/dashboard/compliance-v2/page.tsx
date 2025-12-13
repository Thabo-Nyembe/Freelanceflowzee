"use client"

import { useState } from 'react'
import {
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Download,
  Upload,
  Plus,
  Calendar,
  Filter,
  Building2,
  Scale,
  Lock,
  Eye,
  Users,
  BookOpen
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type ComplianceStatus = 'all' | 'compliant' | 'non-compliant' | 'pending' | 'review'
type ComplianceStandard = 'all' | 'gdpr' | 'hipaa' | 'sox' | 'iso' | 'pci'

export default function ComplianceV2Page() {
  const [status, setStatus] = useState<ComplianceStatus>('all')
  const [standard, setStandard] = useState<ComplianceStandard>('all')

  const stats = [
    {
      label: 'Compliance Score',
      value: '96.8%',
      change: '+4.2%',
      trend: 'up' as const,
      icon: ShieldCheck,
      color: 'text-green-600'
    },
    {
      label: 'Active Policies',
      value: '847',
      change: '+12.4%',
      trend: 'up' as const,
      icon: FileCheck,
      color: 'text-blue-600'
    },
    {
      label: 'Non-Compliant',
      value: '12',
      change: '-28.4%',
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      label: 'Pending Review',
      value: '47',
      change: '+8.2%',
      trend: 'up' as const,
      icon: Clock,
      color: 'text-yellow-600'
    }
  ]

  const quickActions = [
    {
      label: 'New Policy',
      description: 'Create compliance policy',
      icon: Plus,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Compliance Audit',
      description: 'Run full audit report',
      icon: FileCheck,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Upload Document',
      description: 'Add compliance docs',
      icon: Upload,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Export Report',
      description: 'Download compliance data',
      icon: Download,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Risk Assessment',
      description: 'Evaluate compliance risks',
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500'
    },
    {
      label: 'Training Center',
      description: 'Compliance training modules',
      icon: BookOpen,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Policy Review',
      description: 'Review pending policies',
      icon: Eye,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Team Access',
      description: 'Manage compliance team',
      icon: Users,
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const complianceItems = [
    {
      id: 'COMP-2847',
      policy: 'GDPR Data Protection',
      standard: 'gdpr',
      status: 'compliant',
      coverage: 98.5,
      lastAudit: '2024-02-10',
      nextReview: '2024-05-10',
      owner: 'Sarah Johnson',
      department: 'Legal',
      riskLevel: 'low',
      controls: 47,
      findings: 2
    },
    {
      id: 'COMP-2846',
      policy: 'HIPAA Patient Privacy',
      standard: 'hipaa',
      status: 'compliant',
      coverage: 96.2,
      lastAudit: '2024-02-08',
      nextReview: '2024-05-08',
      owner: 'Michael Chen',
      department: 'Healthcare',
      riskLevel: 'low',
      controls: 38,
      findings: 3
    },
    {
      id: 'COMP-2845',
      policy: 'SOX Financial Controls',
      standard: 'sox',
      status: 'non-compliant',
      coverage: 72.4,
      lastAudit: '2024-02-05',
      nextReview: '2024-03-05',
      owner: 'David Park',
      department: 'Finance',
      riskLevel: 'high',
      controls: 52,
      findings: 12
    },
    {
      id: 'COMP-2844',
      policy: 'ISO 27001 Information Security',
      standard: 'iso',
      status: 'pending',
      coverage: 88.7,
      lastAudit: '2024-01-28',
      nextReview: '2024-04-28',
      owner: 'Emma Wilson',
      department: 'IT Security',
      riskLevel: 'medium',
      controls: 114,
      findings: 8
    },
    {
      id: 'COMP-2843',
      policy: 'PCI-DSS Payment Security',
      standard: 'pci',
      status: 'compliant',
      coverage: 94.8,
      lastAudit: '2024-02-12',
      nextReview: '2024-05-12',
      owner: 'Lisa Anderson',
      department: 'Payments',
      riskLevel: 'low',
      controls: 29,
      findings: 1
    },
    {
      id: 'COMP-2842',
      policy: 'GDPR Cookie Consent',
      standard: 'gdpr',
      status: 'review',
      coverage: 91.2,
      lastAudit: '2024-02-01',
      nextReview: '2024-03-01',
      owner: 'Robert Taylor',
      department: 'Legal',
      riskLevel: 'medium',
      controls: 12,
      findings: 5
    },
    {
      id: 'COMP-2841',
      policy: 'ISO 9001 Quality Management',
      standard: 'iso',
      status: 'compliant',
      coverage: 97.3,
      lastAudit: '2024-02-14',
      nextReview: '2024-05-14',
      owner: 'James Martinez',
      department: 'Quality',
      riskLevel: 'low',
      controls: 86,
      findings: 2
    },
    {
      id: 'COMP-2840',
      policy: 'SOX Audit Trail Requirements',
      standard: 'sox',
      status: 'non-compliant',
      coverage: 68.9,
      lastAudit: '2024-02-03',
      nextReview: '2024-02-20',
      owner: 'Sarah Johnson',
      department: 'Finance',
      riskLevel: 'high',
      controls: 24,
      findings: 15
    },
    {
      id: 'COMP-2839',
      policy: 'HIPAA Breach Notification',
      standard: 'hipaa',
      status: 'compliant',
      coverage: 99.1,
      lastAudit: '2024-02-15',
      nextReview: '2024-05-15',
      owner: 'Michael Chen',
      department: 'Healthcare',
      riskLevel: 'low',
      controls: 16,
      findings: 0
    },
    {
      id: 'COMP-2838',
      policy: 'PCI Physical Security',
      standard: 'pci',
      status: 'pending',
      coverage: 84.5,
      lastAudit: '2024-01-30',
      nextReview: '2024-02-28',
      owner: 'David Park',
      department: 'Security',
      riskLevel: 'medium',
      controls: 18,
      findings: 4
    }
  ]

  const filteredItems = complianceItems.filter(item => {
    const statusMatch = status === 'all' || item.status === status
    const standardMatch = standard === 'all' || item.standard === standard
    return statusMatch && standardMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
          label: 'Compliant'
        }
      case 'non-compliant':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Non-Compliant'
        }
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Pending'
        }
      case 'review':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Eye,
          label: 'Under Review'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: FileText,
          label: status
        }
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStandardIcon = (standard: string) => {
    switch (standard) {
      case 'gdpr':
        return Lock
      case 'hipaa':
        return ShieldCheck
      case 'sox':
        return Scale
      case 'iso':
        return FileCheck
      case 'pci':
        return Building2
      default:
        return FileText
    }
  }

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 95) return 'from-green-500 to-emerald-500'
    if (coverage >= 85) return 'from-blue-500 to-cyan-500'
    if (coverage >= 75) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const recentActivity = [
    { label: 'GDPR audit completed', time: '2 hours ago', color: 'text-green-600' },
    { label: 'SOX non-compliance detected', time: '5 hours ago', color: 'text-red-600' },
    { label: 'New policy uploaded', time: '1 day ago', color: 'text-blue-600' },
    { label: 'Training module completed', time: '2 days ago', color: 'text-purple-600' },
    { label: 'Risk assessment updated', time: '3 days ago', color: 'text-orange-600' }
  ]

  const complianceStandards = [
    { label: 'GDPR', value: '96.8%', color: 'bg-green-500' },
    { label: 'HIPAA', value: '97.7%', color: 'bg-blue-500' },
    { label: 'ISO', value: '93.0%', color: 'bg-cyan-500' },
    { label: 'PCI-DSS', value: '89.7%', color: 'bg-purple-500' },
    { label: 'SOX', value: '70.7%', color: 'bg-red-500' }
  ]

  const overallComplianceData = {
    label: 'Overall Compliance',
    current: 96.8,
    target: 100,
    subtitle: '+4.2% from last quarter'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Compliance Management
            </h1>
            <p className="text-gray-600 mt-2">Monitor regulatory compliance and policy adherence</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Audit
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Policy
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Compliance Status</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setStatus('all')}
                  isActive={status === 'all'}
                  variant="default"
                >
                  All Policies
                </PillButton>
                <PillButton
                  onClick={() => setStatus('compliant')}
                  isActive={status === 'compliant'}
                  variant="default"
                >
                  Compliant
                </PillButton>
                <PillButton
                  onClick={() => setStatus('non-compliant')}
                  isActive={status === 'non-compliant'}
                  variant="default"
                >
                  Non-Compliant
                </PillButton>
                <PillButton
                  onClick={() => setStatus('pending')}
                  isActive={status === 'pending'}
                  variant="default"
                >
                  Pending
                </PillButton>
                <PillButton
                  onClick={() => setStatus('review')}
                  isActive={status === 'review'}
                  variant="default"
                >
                  Under Review
                </PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Standard</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setStandard('all')}
                  isActive={standard === 'all'}
                  variant="default"
                >
                  All Standards
                </PillButton>
                <PillButton
                  onClick={() => setStandard('gdpr')}
                  isActive={standard === 'gdpr'}
                  variant="default"
                >
                  GDPR
                </PillButton>
                <PillButton
                  onClick={() => setStandard('hipaa')}
                  isActive={standard === 'hipaa'}
                  variant="default"
                >
                  HIPAA
                </PillButton>
                <PillButton
                  onClick={() => setStandard('sox')}
                  isActive={standard === 'sox'}
                  variant="default"
                >
                  SOX
                </PillButton>
                <PillButton
                  onClick={() => setStandard('iso')}
                  isActive={standard === 'iso'}
                  variant="default"
                >
                  ISO
                </PillButton>
                <PillButton
                  onClick={() => setStandard('pci')}
                  isActive={standard === 'pci'}
                  variant="default"
                >
                  PCI-DSS
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Compliance Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Compliance Policies</h2>
              <div className="text-sm text-gray-600">
                {filteredItems.length} policies
              </div>
            </div>

            <div className="space-y-3">
              {filteredItems.map((item) => {
                const statusBadge = getStatusBadge(item.status)
                const StatusIcon = statusBadge.icon
                const StandardIcon = getStandardIcon(item.standard)
                const coverageColor = getCoverageColor(item.coverage)

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-green-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white">
                          <StandardIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.policy}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{item.id}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500 uppercase">{item.standard}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getRiskBadge(item.riskLevel)}`}>
                          {item.riskLevel} Risk
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Coverage</span>
                        <span className="font-semibold text-gray-900">{item.coverage.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${coverageColor} transition-all duration-500 rounded-full`}
                          style={{ width: `${item.coverage}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Owner</div>
                        <div className="font-medium text-gray-900 text-sm">{item.owner}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Department</div>
                        <div className="font-medium text-gray-900 text-sm">{item.department}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Controls</div>
                        <div className="font-medium text-gray-900 text-sm">{item.controls}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Findings</div>
                        <div className={`font-medium text-sm ${
                          item.findings > 10 ? 'text-red-600' : item.findings > 5 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {item.findings}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                      <div className="text-gray-600">
                        Last Audit: <span className="font-medium text-gray-900">{item.lastAudit}</span>
                      </div>
                      <div className="text-gray-600">
                        Next Review: <span className="font-medium text-gray-900">{item.nextReview}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={overallComplianceData.label}
              current={overallComplianceData.current}
              target={overallComplianceData.target}
              subtitle={overallComplianceData.subtitle}
            />

            <MiniKPI
              title="Policies Reviewed"
              value="847"
              change="+12.4%"
              trend="up"
              subtitle="This quarter"
            />

            <RankingList
              title="Compliance by Standard"
              items={complianceStandards}
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
