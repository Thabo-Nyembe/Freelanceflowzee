'use client'

import { useState } from 'react'
import { useCompliance, type Compliance, type ComplianceType, type ComplianceStatus } from '@/lib/hooks/use-compliance'
import { ShieldCheck, FileCheck, AlertTriangle, CheckCircle2, XCircle, Clock, Plus } from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

export default function ComplianceClient({ initialCompliance }: { initialCompliance: Compliance[] }) {
  const [complianceTypeFilter, setComplianceTypeFilter] = useState<ComplianceType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'all'>('all')
  const { compliance, loading, error } = useCompliance({ complianceType: complianceTypeFilter, status: statusFilter })

  const displayCompliance = compliance.length > 0 ? compliance : initialCompliance

  const stats = [
    {
      label: 'Compliance Score',
      value: displayCompliance.length > 0
        ? `${(displayCompliance.reduce((sum, c) => sum + (c.compliance_percentage || 0), 0) / displayCompliance.length).toFixed(1)}%`
        : '0%',
      change: '+4.2%',
      trend: 'up' as const,
      icon: ShieldCheck,
      color: 'text-green-600'
    },
    {
      label: 'Active Policies',
      value: displayCompliance.filter(c => c.status === 'compliant').length.toString(),
      change: '+12.4%',
      trend: 'up' as const,
      icon: FileCheck,
      color: 'text-blue-600'
    },
    {
      label: 'Non-Compliant',
      value: displayCompliance.filter(c => c.status === 'non_compliant').length.toString(),
      change: '-28.4%',
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      label: 'Pending Review',
      value: displayCompliance.filter(c => c.status === 'pending' || c.status === 'under_review').length.toString(),
      change: '+8.2%',
      trend: 'up' as const,
      icon: Clock,
      color: 'text-yellow-600'
    }
  ]

  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-200'
      case 'non_compliant': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      case 'critical': return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Compliance Management
            </h1>
            <p className="text-gray-600 mt-2">Monitor regulatory compliance and policy adherence</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Policy
          </button>
        </div>

        <StatGrid stats={stats} />

        <div className="flex flex-wrap gap-2">
          <PillButton onClick={() => setStatusFilter('all')} isActive={statusFilter === 'all'} variant="default">
            All Status
          </PillButton>
          <PillButton onClick={() => setStatusFilter('compliant')} isActive={statusFilter === 'compliant'} variant="default">
            Compliant
          </PillButton>
          <PillButton onClick={() => setStatusFilter('non_compliant')} isActive={statusFilter === 'non_compliant'} variant="default">
            Non-Compliant
          </PillButton>
          <PillButton onClick={() => setStatusFilter('pending')} isActive={statusFilter === 'pending')} variant="default">
            Pending
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {displayCompliance.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.compliance_name}</h3>
                    {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getRiskColor(item.risk_level)}`}>
                      {item.risk_level} risk
                    </span>
                    <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Requirements</p>
                    <p className="font-semibold">{item.met_requirements}/{item.total_requirements}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Compliance</p>
                    <p className="font-semibold">{item.compliance_percentage?.toFixed(1) || 0}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Violations</p>
                    <p className="font-semibold text-red-600">{item.violation_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Audits</p>
                    <p className="font-semibold">{item.audit_count}</p>
                  </div>
                </div>

                {item.compliance_percentage !== undefined && (
                  <div className="mt-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.compliance_percentage >= 90 ? 'bg-green-500' : item.compliance_percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${item.compliance_percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {displayCompliance.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Compliance Items</h3>
                <p className="text-gray-600">Create your first compliance policy</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <ProgressCard
              label="Overall Compliance"
              current={displayCompliance.length > 0
                ? displayCompliance.reduce((sum, c) => sum + (c.compliance_percentage || 0), 0) / displayCompliance.length
                : 0}
              target={100}
              subtitle="Target: 100%"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
