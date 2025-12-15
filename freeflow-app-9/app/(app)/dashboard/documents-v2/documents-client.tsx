'use client'

import { useState } from 'react'
import { useDocuments, type Document, type DocumentType, type DocumentStatus } from '@/lib/hooks/use-documents'
import { BentoCard } from '@/components/ui/bento-grid-advanced'
import { StatGrid, ActivityFeed, MiniKPI, RankingList, ProgressCard } from '@/components/ui/results-display'
import { GradientButton, PillButton, ModernButton } from '@/components/ui/modern-buttons'
import { FileText, Upload, Download, Eye, Share2, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function DocumentsClient({ initialDocuments }: { initialDocuments: Document[] }) {
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all')
  const { documents, loading, error } = useDocuments({ status: statusFilter, type: typeFilter })

  const displayDocuments = documents.length > 0 ? documents : initialDocuments

  const stats = [
    {
      label: 'Total Documents',
      value: displayDocuments.length.toLocaleString(),
      change: 15.2,
      icon: <FileText className="w-5 h-5" />
    },
    {
      label: 'Pending Review',
      value: displayDocuments.filter(d => d.status === 'review').length.toString(),
      change: -8.3,
      icon: <Clock className="w-5 h-5" />
    },
    {
      label: 'Total Views',
      value: displayDocuments.reduce((sum, d) => sum + d.view_count, 0).toLocaleString(),
      change: 22.7,
      icon: <Eye className="w-5 h-5" />
    },
    {
      label: 'Storage Used',
      value: `${(displayDocuments.reduce((sum, d) => sum + d.file_size_mb, 0) / 1024).toFixed(1)} GB`,
      change: 12.4,
      icon: <Upload className="w-5 h-5" />
    }
  ]

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'review': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'archived': return 'bg-blue-100 text-blue-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'published': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: DocumentType) => {
    switch (type) {
      case 'contract': return 'bg-purple-100 text-purple-700'
      case 'proposal': return 'bg-blue-100 text-blue-700'
      case 'report': return 'bg-green-100 text-green-700'
      case 'policy': return 'bg-orange-100 text-orange-700'
      case 'invoice': return 'bg-cyan-100 text-cyan-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getAccessColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-700'
      case 'internal': return 'bg-blue-100 text-blue-700'
      case 'confidential': return 'bg-orange-100 text-orange-700'
      case 'restricted': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const recentActivity = displayDocuments.slice(0, 4).map((d) => ({
    icon: d.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />,
    title: d.status === 'approved' ? 'Document approved' : 'Document updated',
    description: d.document_title,
    time: new Date(d.updated_at).toLocaleDateString(),
    status: (d.status === 'approved' ? 'success' : d.status === 'rejected' ? 'error' : 'info') as const
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-10 h-10 text-cyan-600" />
              Document Management
            </h1>
            <p className="text-muted-foreground">Organize and manage all company documents</p>
          </div>
          <GradientButton from="cyan" to="blue" onClick={() => console.log('Upload')}>
            <Upload className="w-5 h-5 mr-2" />
            Upload Document
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="flex items-center gap-3">
          <PillButton variant={statusFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('all')}>All</PillButton>
          <PillButton variant={statusFilter === 'draft' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('draft')}>Draft</PillButton>
          <PillButton variant={statusFilter === 'review' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('review')}>In Review</PillButton>
          <PillButton variant={statusFilter === 'approved' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('approved')}>Approved</PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {displayDocuments.map((document) => (
              <BentoCard key={document.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{document.document_title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(document.status)}`}>
                        {document.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-md ${getTypeColor(document.document_type)}`}>
                        {document.document_type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-md ${getAccessColor(document.access_level)}`}>
                        {document.access_level}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                      {document.owner && <span>Owner: {document.owner}</span>}
                      {document.department && <span>Dept: {document.department}</span>}
                      <span>v{document.version}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground">Views</p>
                    <p className="font-semibold">{document.view_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Downloads</p>
                    <p className="font-semibold">{document.download_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Comments</p>
                    <p className="font-semibold">{document.comment_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-semibold">{document.file_size_mb.toFixed(1)} MB</p>
                  </div>
                </div>

                {document.tags && document.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {document.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {document.approved_by && (
                  <div className="text-xs text-muted-foreground mb-3">
                    Approved by: <span className="font-medium text-green-600">{document.approved_by}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t">
                  <ModernButton variant="primary" size="sm">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </ModernButton>
                  {document.file_url && (
                    <ModernButton variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </ModernButton>
                  )}
                  <ModernButton variant="outline" size="sm">
                    <Share2 className="w-3 h-3 mr-1" />
                    Share
                  </ModernButton>
                </div>
              </BentoCard>
            ))}

            {displayDocuments.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Documents</h3>
                <p className="text-muted-foreground">Upload your first document</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Documents by Type"
              items={[
                {
                  label: 'Reports',
                  value: displayDocuments.filter(d => d.document_type === 'report').length,
                  total: displayDocuments.length,
                  color: 'green'
                },
                {
                  label: 'Contracts',
                  value: displayDocuments.filter(d => d.document_type === 'contract').length,
                  total: displayDocuments.length,
                  color: 'purple'
                }
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Approval Rate"
                value={displayDocuments.length > 0
                  ? `${((displayDocuments.filter(d => d.status === 'approved').length / displayDocuments.length) * 100).toFixed(0)}%`
                  : '0%'}
                change={12.5}
              />
              <MiniKPI
                label="Avg File Size"
                value={displayDocuments.length > 0
                  ? `${(displayDocuments.reduce((sum, d) => sum + d.file_size_mb, 0) / displayDocuments.length).toFixed(1)} MB`
                  : '0 MB'}
                change={-8.3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
