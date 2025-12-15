'use client'

import { useState } from 'react'
import { useDataExports, type DataExport, type ExportStatus, type ExportFormat } from '@/lib/hooks/use-data-exports'
import { BentoCard } from '@/components/ui/bento-grid-advanced'
import { StatGrid, ActivityFeed, MiniKPI } from '@/components/ui/results-display'
import { GradientButton, PillButton, ModernButton } from '@/components/ui/modern-buttons'
import { Download, CheckCircle2, XCircle, Clock, Database, HardDrive, FileSpreadsheet, FileCode, FileText, Shield, Archive } from 'lucide-react'

export default function DataExportClient({ initialExports }: { initialExports: DataExport[] }) {
  const [statusFilter, setStatusFilter] = useState<ExportStatus | 'all'>('all')
  const [formatFilter, setFormatFilter] = useState<ExportFormat | 'all'>('all')
  const { exports, loading, error } = useDataExports({ status: statusFilter, format: formatFilter })

  const displayExports = exports.length > 0 ? exports : initialExports

  const stats = [
    {
      label: 'Total Exports',
      value: displayExports.length.toString(),
      change: 18,
      icon: <Download className="w-5 h-5" />
    },
    {
      label: 'Completed',
      value: displayExports.filter(e => e.status === 'completed').length.toString(),
      change: 12,
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      label: 'Total Records',
      value: displayExports.reduce((sum, e) => sum + e.total_records, 0).toLocaleString(),
      change: 25,
      icon: <Database className="w-5 h-5" />
    },
    {
      label: 'Total Size',
      value: `${displayExports.reduce((sum, e) => sum + e.file_size_mb, 0).toFixed(1)} GB`,
      change: 15,
      icon: <HardDrive className="w-5 h-5" />
    }
  ]

  const getStatusColor = (status: ExportStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'scheduled': return 'bg-purple-100 text-purple-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
      case 'xlsx': return <FileSpreadsheet className="w-4 h-4" />
      case 'json':
      case 'xml': return <FileCode className="w-4 h-4" />
      case 'pdf': return <FileText className="w-4 h-4" />
      case 'sql': return <Database className="w-4 h-4" />
      default: return <Download className="w-4 h-4" />
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Download className="w-10 h-10 text-green-600" />
              Data Export
            </h1>
            <p className="text-muted-foreground">Export and download data in various formats</p>
          </div>
          <GradientButton from="green" to="emerald" onClick={() => console.log('New export')}>
            <Download className="w-5 h-5 mr-2" />
            New Export
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="flex items-center gap-3">
          <PillButton variant={statusFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('all')}>All</PillButton>
          <PillButton variant={statusFilter === 'completed' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('completed')}>Completed</PillButton>
          <PillButton variant={statusFilter === 'in_progress' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('in_progress')}>In Progress</PillButton>
          <PillButton variant={statusFilter === 'scheduled' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('scheduled')}>Scheduled</PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {displayExports.map((exp) => (
              <BentoCard key={exp.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{exp.export_name}</h3>
                    {exp.description && <p className="text-sm text-muted-foreground">{exp.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(exp.status)}`}>
                        {exp.status}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 uppercase flex items-center gap-1">
                        {getFormatIcon(exp.export_format)}
                        {exp.export_format}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Records</p>
                    <p className="font-semibold">{exp.total_records.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-semibold">{exp.file_size_mb > 0 ? `${exp.file_size_mb.toFixed(1)} GB` : 'Pending'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold">{formatDuration(exp.duration_seconds)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Progress</p>
                    <p className="font-semibold">{exp.progress_percentage.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  {exp.is_encrypted && <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-green-600" />Encrypted</div>}
                  {exp.is_compressed && <div className="flex items-center gap-1"><Archive className="w-3 h-3 text-blue-600" />Compressed</div>}
                  <span>Source: {exp.data_source}</span>
                </div>

                {exp.progress_percentage > 0 && exp.progress_percentage < 100 && (
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${exp.progress_percentage}%` }} />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t">
                  <ModernButton variant="primary" size="sm" disabled={exp.status !== 'completed'}>
                    {exp.status === 'completed' ? 'Download' : exp.status}
                  </ModernButton>
                  <ModernButton variant="outline" size="sm">Details</ModernButton>
                </div>
              </BentoCard>
            ))}

            {displayExports.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Download className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Exports</h3>
                <p className="text-muted-foreground">Create your first export</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <MiniKPI label="Success Rate" value="92%" change={12} />
          </div>
        </div>
      </div>
    </div>
  )
}
