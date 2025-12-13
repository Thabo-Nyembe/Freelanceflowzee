"use client"

import { useState } from 'react'
import {
  Award,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Download,
  Plus,
  Search,
  Filter,
  FileText,
  Shield,
  Star,
  Zap,
  BarChart3
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type CertStatus = 'all' | 'active' | 'expiring' | 'expired' | 'pending'
type CertType = 'all' | 'professional' | 'technical' | 'compliance' | 'safety' | 'industry'

export default function CertificationsV2Page() {
  const [status, setStatus] = useState<CertStatus>('all')
  const [certType, setCertType] = useState<CertType>('all')

  const stats = [
    {
      label: 'Total Certificates',
      value: '847',
      change: '+18.2%',
      trend: 'up' as const,
      icon: Award,
      color: 'text-purple-600'
    },
    {
      label: 'Active',
      value: '724',
      change: '+24.7%',
      trend: 'up' as const,
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      label: 'Expiring Soon',
      value: '47',
      change: '-12.4%',
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'text-yellow-600'
    },
    {
      label: 'Compliance Rate',
      value: '94.8%',
      change: '+8.7%',
      trend: 'up' as const,
      icon: Shield,
      color: 'text-blue-600'
    }
  ]

  const quickActions = [
    {
      label: 'Issue Certificate',
      description: 'Award new credential',
      icon: Plus,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Verify Certificate',
      description: 'Check authenticity',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Renewal Reminders',
      description: 'Send expiry alerts',
      icon: Calendar,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Download Certificate',
      description: 'Export credentials',
      icon: Download,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Compliance Report',
      description: 'View compliance status',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Bulk Upload',
      description: 'Import certificates',
      icon: FileText,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Quick Renew',
      description: 'Renew expiring certs',
      icon: Zap,
      color: 'from-pink-500 to-rose-500'
    },
    {
      label: 'Templates',
      description: 'Manage cert designs',
      icon: Star,
      color: 'from-red-500 to-orange-500'
    }
  ]

  const certifications = [
    {
      id: 'CERT-2847',
      name: 'Project Management Professional (PMP)',
      holder: 'Sarah Johnson',
      type: 'professional',
      status: 'active',
      issuer: 'Project Management Institute',
      issueDate: '2023-06-15',
      expiryDate: '2026-06-15',
      credentialId: 'PMP-847-2023',
      verificationUrl: 'https://verify.pmi.org/847',
      renewalRequired: true,
      cpdHours: 60,
      completedCpd: 42,
      score: 98.5
    },
    {
      id: 'CERT-2846',
      name: 'AWS Certified Solutions Architect',
      holder: 'Michael Chen',
      type: 'technical',
      status: 'active',
      issuer: 'Amazon Web Services',
      issueDate: '2024-01-10',
      expiryDate: '2027-01-10',
      credentialId: 'AWS-SA-2847',
      verificationUrl: 'https://aws.amazon.com/verification/2847',
      renewalRequired: false,
      cpdHours: 0,
      completedCpd: 0,
      score: 92.4
    },
    {
      id: 'CERT-2845',
      name: 'OSHA Safety Certification',
      holder: 'David Park',
      type: 'safety',
      status: 'expiring',
      issuer: 'Occupational Safety and Health Admin',
      issueDate: '2023-03-01',
      expiryDate: '2024-03-01',
      credentialId: 'OSHA-284-2023',
      verificationUrl: 'https://osha.gov/verify/284',
      renewalRequired: true,
      cpdHours: 24,
      completedCpd: 18,
      score: 87.6
    },
    {
      id: 'CERT-2844',
      name: 'Certified Information Security Manager',
      holder: 'Emma Wilson',
      type: 'technical',
      status: 'active',
      issuer: 'ISACA',
      issueDate: '2023-09-20',
      expiryDate: '2026-09-20',
      credentialId: 'CISM-847-2023',
      verificationUrl: 'https://isaca.org/verify/847',
      renewalRequired: true,
      cpdHours: 120,
      completedCpd: 95,
      score: 94.2
    },
    {
      id: 'CERT-2843',
      name: 'ISO 9001 Lead Auditor',
      holder: 'Lisa Anderson',
      type: 'compliance',
      status: 'active',
      issuer: 'International Register of Certificated Auditors',
      issueDate: '2023-11-05',
      expiryDate: '2025-11-05',
      credentialId: 'ISO-9001-LA-847',
      verificationUrl: 'https://irca.org/verify/847',
      renewalRequired: true,
      cpdHours: 40,
      completedCpd: 28,
      score: 91.8
    },
    {
      id: 'CERT-2842',
      name: 'Google Cloud Professional Architect',
      holder: 'Robert Taylor',
      type: 'technical',
      status: 'expiring',
      issuer: 'Google Cloud',
      issueDate: '2022-04-15',
      expiryDate: '2024-04-15',
      credentialId: 'GCP-PA-2847',
      verificationUrl: 'https://cloud.google.com/verify/2847',
      renewalRequired: true,
      cpdHours: 0,
      completedCpd: 0,
      score: 89.3
    },
    {
      id: 'CERT-2841',
      name: 'Certified Public Accountant (CPA)',
      holder: 'James Martinez',
      type: 'professional',
      status: 'active',
      issuer: 'American Institute of CPAs',
      issueDate: '2022-08-10',
      expiryDate: '2025-08-10',
      credentialId: 'CPA-847-2022',
      verificationUrl: 'https://aicpa.org/verify/847',
      renewalRequired: true,
      cpdHours: 80,
      completedCpd: 65,
      score: 96.7
    },
    {
      id: 'CERT-2840',
      name: 'Six Sigma Black Belt',
      holder: 'Sarah Johnson',
      type: 'industry',
      status: 'active',
      issuer: 'International Association for Six Sigma',
      issueDate: '2023-05-20',
      expiryDate: '2026-05-20',
      credentialId: 'SSBB-847-2023',
      verificationUrl: 'https://iassc.org/verify/847',
      renewalRequired: false,
      cpdHours: 0,
      completedCpd: 0,
      score: 93.5
    },
    {
      id: 'CERT-2839',
      name: 'GDPR Data Protection Officer',
      holder: 'Michael Chen',
      type: 'compliance',
      status: 'expired',
      issuer: 'International Association of Privacy Professionals',
      issueDate: '2021-02-01',
      expiryDate: '2024-02-01',
      credentialId: 'GDPR-DPO-847',
      verificationUrl: 'https://iapp.org/verify/847',
      renewalRequired: true,
      cpdHours: 45,
      completedCpd: 0,
      score: 88.9
    },
    {
      id: 'CERT-2838',
      name: 'Microsoft Certified Azure Administrator',
      holder: 'Emma Wilson',
      type: 'technical',
      status: 'pending',
      issuer: 'Microsoft',
      issueDate: '2024-02-15',
      expiryDate: '2026-02-15',
      credentialId: 'AZ-104-2847',
      verificationUrl: 'https://microsoft.com/verify/2847',
      renewalRequired: false,
      cpdHours: 0,
      completedCpd: 0,
      score: 90.1
    }
  ]

  const filteredCertifications = certifications.filter(cert => {
    const statusMatch = status === 'all' || cert.status === status
    const typeMatch = certType === 'all' || cert.type === certType
    return statusMatch && typeMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
          label: 'Active'
        }
      case 'expiring':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertTriangle,
          label: 'Expiring Soon'
        }
      case 'expired':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Expired'
        }
      case 'pending':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
          label: 'Pending'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Award,
          label: status
        }
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'professional':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'technical':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'compliance':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'safety':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'industry':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const recentActivity = [
    { label: 'Certificate issued', time: '2 hours ago', color: 'text-green-600' },
    { label: 'Expiry reminder sent', time: '5 hours ago', color: 'text-yellow-600' },
    { label: 'Certificate renewed', time: '1 day ago', color: 'text-blue-600' },
    { label: 'Compliance check passed', time: '2 days ago', color: 'text-purple-600' },
    { label: 'CPD hours updated', time: '3 days ago', color: 'text-orange-600' }
  ]

  const certificationsByType = [
    { label: 'Technical', value: '284 certs', color: 'bg-blue-500' },
    { label: 'Professional', value: '247 certs', color: 'bg-purple-500' },
    { label: 'Compliance', value: '184 certs', color: 'bg-green-500' },
    { label: 'Industry', value: '92 certs', color: 'bg-cyan-500' },
    { label: 'Safety', value: '40 certs', color: 'bg-orange-500' }
  ]

  const complianceRateData = {
    label: 'Compliance Rate',
    current: 94.8,
    target: 95,
    subtitle: 'Active vs total certificates'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Certifications
            </h1>
            <p className="text-gray-600 mt-2">Manage professional credentials and certifications</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Issue Certificate
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
                  All Certificates
                </PillButton>
                <PillButton
                  onClick={() => setStatus('active')}
                  isActive={status === 'active'}
                  variant="default"
                >
                  Active
                </PillButton>
                <PillButton
                  onClick={() => setStatus('expiring')}
                  isActive={status === 'expiring'}
                  variant="default"
                >
                  Expiring Soon
                </PillButton>
                <PillButton
                  onClick={() => setStatus('expired')}
                  isActive={status === 'expired'}
                  variant="default"
                >
                  Expired
                </PillButton>
                <PillButton
                  onClick={() => setStatus('pending')}
                  isActive={status === 'pending'}
                  variant="default"
                >
                  Pending
                </PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setCertType('all')}
                  isActive={certType === 'all'}
                  variant="default"
                >
                  All Types
                </PillButton>
                <PillButton
                  onClick={() => setCertType('professional')}
                  isActive={certType === 'professional'}
                  variant="default"
                >
                  Professional
                </PillButton>
                <PillButton
                  onClick={() => setCertType('technical')}
                  isActive={certType === 'technical'}
                  variant="default"
                >
                  Technical
                </PillButton>
                <PillButton
                  onClick={() => setCertType('compliance')}
                  isActive={certType === 'compliance'}
                  variant="default"
                >
                  Compliance
                </PillButton>
                <PillButton
                  onClick={() => setCertType('safety')}
                  isActive={certType === 'safety'}
                  variant="default"
                >
                  Safety
                </PillButton>
                <PillButton
                  onClick={() => setCertType('industry')}
                  isActive={certType === 'industry'}
                  variant="default"
                >
                  Industry
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certifications List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Certificate Registry</h2>
              <div className="text-sm text-gray-600">
                {filteredCertifications.length} certificates
              </div>
            </div>

            <div className="space-y-3">
              {filteredCertifications.map((cert) => {
                const statusBadge = getStatusBadge(cert.status)
                const StatusIcon = statusBadge.icon
                const daysUntilExpiry = getDaysUntilExpiry(cert.expiryDate)
                const cpdProgress = cert.cpdHours > 0 ? (cert.completedCpd / cert.cpdHours) * 100 : 0

                return (
                  <div
                    key={cert.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-purple-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white">
                          <Award className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{cert.credentialId}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{cert.holder}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getTypeBadge(cert.type)}`}>
                          {cert.type}
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Issuer</div>
                        <div className="font-medium text-gray-900 text-sm">{cert.issuer}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Issue Date</div>
                        <div className="font-medium text-gray-900 text-sm">{cert.issueDate}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Expiry Date</div>
                        <div className={`font-medium text-sm ${
                          daysUntilExpiry < 0 ? 'text-red-600' :
                          daysUntilExpiry < 90 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {cert.expiryDate}
                          {daysUntilExpiry >= 0 && daysUntilExpiry < 90 && (
                            <span className="ml-1 text-xs">({daysUntilExpiry}d)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {cert.renewalRequired && cert.cpdHours > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-600">CPD Hours: {cert.completedCpd} / {cert.cpdHours}</span>
                          <span className="font-semibold text-gray-900">{cpdProgress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              cpdProgress >= 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              cpdProgress >= 75 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              'bg-gradient-to-r from-yellow-500 to-orange-500'
                            }`}
                            style={{ width: `${Math.min(cpdProgress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          Score: <span className="font-medium text-purple-600">{cert.score.toFixed(1)}%</span>
                        </span>
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Shield className="w-3 h-3" />
                          Verify
                        </a>
                      </div>
                      <div className="text-gray-500">{cert.id}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={complianceRateData.label}
              current={complianceRateData.current}
              target={complianceRateData.target}
              subtitle={complianceRateData.subtitle}
            />

            <MiniKPI
              title="Expiring This Month"
              value="47"
              change="-12.4%"
              trend="down"
              subtitle="Requires renewal"
            />

            <RankingList
              title="Certificates by Type"
              items={certificationsByType}
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
