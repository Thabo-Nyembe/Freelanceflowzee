'use client'
import { useState } from 'react'
import { useCertifications, type Certification, type CertificationType, type CertificationStatus } from '@/lib/hooks/use-certifications'

export default function CertificationsClient({ initialCertifications }: { initialCertifications: Certification[] }) {
  const [certificationTypeFilter, setCertificationTypeFilter] = useState<CertificationType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CertificationStatus | 'all'>('all')
  const { certifications, loading, error } = useCertifications({ certificationType: certificationTypeFilter, status: statusFilter })
  const displayCertifications = certifications.length > 0 ? certifications : initialCertifications

  const stats = {
    total: displayCertifications.length,
    active: displayCertifications.filter(c => c.status === 'active').length,
    verified: displayCertifications.filter(c => c.verification_status === 'verified').length,
    expiringSoon: displayCertifications.filter(c => c.days_until_expiry && c.days_until_expiry <= 30).length
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Certifications</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Certifications</div><div className="text-3xl font-bold text-blue-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Active</div><div className="text-3xl font-bold text-green-600">{stats.active}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Verified</div><div className="text-3xl font-bold text-cyan-600">{stats.verified}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Expiring Soon</div><div className="text-3xl font-bold text-orange-600">{stats.expiringSoon}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={certificationTypeFilter} onChange={(e) => setCertificationTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="professional">Professional</option><option value="technical">Technical</option><option value="compliance">Compliance</option><option value="safety">Safety</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="active">Active</option><option value="pending">Pending</option><option value="expired">Expired</option><option value="in_renewal">In Renewal</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayCertifications.filter(c => (certificationTypeFilter === 'all' || c.certification_type === certificationTypeFilter) && (statusFilter === 'all' || c.status === statusFilter)).map(cert => (
          <div key={cert.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${cert.status === 'active' ? 'bg-green-100 text-green-700' : cert.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{cert.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{cert.certification_type}</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${cert.verification_status === 'verified' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-700'}`}>{cert.verification_status}</span>
                  {cert.is_valid && <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">Valid</span>}
                </div>
                <h3 className="text-lg font-semibold">{cert.certification_name}</h3>
                {cert.issuing_organization && <p className="text-sm text-gray-600 mt-1">Issued by {cert.issuing_organization}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  {cert.issue_date && <span>📅 Issued {cert.issue_date}</span>}
                  {cert.expiry_date && <span>⏰ Expires {cert.expiry_date}</span>}
                  {cert.days_until_expiry && cert.days_until_expiry > 0 && <span className={cert.days_until_expiry <= 30 ? 'text-orange-600' : ''}>🔔 {cert.days_until_expiry} days left</span>}
                  {cert.certificate_number && <span>🔢 #{cert.certificate_number}</span>}
                </div>
              </div>
              <div className="text-right">
                {cert.level && (
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{cert.level}</div>
                    <div className="text-xs text-gray-500">level</div>
                  </div>
                )}
                {cert.continuing_education_hours && <div className="text-xs text-gray-600 mt-1">📚 {cert.continuing_education_hours} CE hours</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
