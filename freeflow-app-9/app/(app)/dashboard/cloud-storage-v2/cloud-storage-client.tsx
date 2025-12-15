'use client'

import { useState } from 'react'
import { useCloudStorage, type CloudStorage, type FileStatus } from '@/lib/hooks/use-cloud-storage'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ProgressCard,
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Cloud,
  Upload,
  Download,
  FolderOpen,
  FileText,
  Image,
  Video,
  Music,
  Share2,
  Lock,
  Search,
  Grid3x3,
  List,
  Clock,
  Eye,
  Trash2
} from 'lucide-react'

export default function CloudStorageClient({ initialFiles }: { initialFiles: CloudStorage[] }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [fileTypeFilter, setFileTypeFilter] = useState<string | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<FileStatus | 'all'>('all')
  const { files, loading, error } = useCloudStorage({ fileType: fileTypeFilter, status: statusFilter })

  const displayFiles = files.length > 0 ? files : initialFiles

  const stats = [
    {
      label: 'Total Storage',
      value: `${(displayFiles.reduce((sum, f) => sum + f.file_size, 0) / 1024 / 1024 / 1024).toFixed(1)}GB`,
      change: 25.3,
      icon: <Cloud className="w-5 h-5" />
    },
    {
      label: 'Files Stored',
      value: displayFiles.length.toString(),
      change: 18.7,
      icon: <FileText className="w-5 h-5" />
    },
    {
      label: 'Shared Files',
      value: displayFiles.filter(f => f.is_shared).length.toString(),
      change: 12.5,
      icon: <Share2 className="w-5 h-5" />
    },
    {
      label: 'Downloads',
      value: displayFiles.reduce((sum, f) => sum + f.download_count, 0).toString(),
      change: 32.1,
      icon: <Download className="w-5 h-5" />
    }
  ]

  const getFileIcon = (file: CloudStorage) => {
    if (file.is_image) return <Image className="w-8 h-8" />
    if (file.is_video) return <Video className="w-8 h-8" />
    if (file.is_audio) return <Music className="w-8 h-8" />
    if (file.is_document) return <FileText className="w-8 h-8" />
    return <FileText className="w-8 h-8" />
  }

  const getFileColor = (file: CloudStorage) => {
    if (file.is_image) return 'text-purple-600'
    if (file.is_video) return 'text-blue-600'
    if (file.is_audio) return 'text-green-600'
    if (file.is_document) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
  }

  const formatDate = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()
    const hours = Math.floor(diff / 1000 / 60 / 60)
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
    return then.toLocaleDateString()
  }

  const recentActivity = displayFiles.slice(0, 4).map(file => ({
    icon: <Upload className="w-5 h-5" />,
    title: 'File uploaded',
    description: file.file_name,
    time: formatDate(file.created_at),
    status: 'success' as const
  }))

  const storageBreakdown = [
    {
      type: 'Documents',
      size: displayFiles.filter(f => f.is_document).reduce((sum, f) => sum + f.file_size, 0) / 1024 / 1024,
      color: 'from-blue-500 to-cyan-500',
      icon: <FileText className="w-5 h-5" />
    },
    {
      type: 'Images',
      size: displayFiles.filter(f => f.is_image).reduce((sum, f) => sum + f.file_size, 0) / 1024 / 1024,
      color: 'from-purple-500 to-pink-500',
      icon: <Image className="w-5 h-5" />
    },
    {
      type: 'Videos',
      size: displayFiles.filter(f => f.is_video).reduce((sum, f) => sum + f.file_size, 0) / 1024 / 1024,
      color: 'from-orange-500 to-red-500',
      icon: <Video className="w-5 h-5" />
    },
    {
      type: 'Audio',
      size: displayFiles.filter(f => f.is_audio).reduce((sum, f) => sum + f.file_size, 0) / 1024 / 1024,
      color: 'from-green-500 to-emerald-500',
      icon: <Music className="w-5 h-5" />
    }
  ]

  const totalStorage = storageBreakdown.reduce((sum, item) => sum + item.size, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Cloud className="w-10 h-10 text-sky-600" />
              Cloud Storage
            </h1>
            <p className="text-muted-foreground">Secure file storage and sharing</p>
          </div>
          <GradientButton from="sky" to="blue" onClick={() => console.log('Upload')}>
            <Upload className="w-5 h-5 mr-2" />
            Upload Files
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Upload />} title="Upload" description="New files" onClick={() => console.log('Upload')} />
          <BentoQuickAction icon={<FolderOpen />} title="New Folder" description="Organize" onClick={() => console.log('Folder')} />
          <BentoQuickAction icon={<Share2 />} title="Share" description="Collaborate" onClick={() => console.log('Share')} />
          <BentoQuickAction icon={<Download />} title="Download" description="Bulk" onClick={() => console.log('Download')} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files and folders..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={viewMode === 'grid' ? 'primary' : 'ghost'} onClick={() => setViewMode('grid')}>
              <Grid3x3 className="w-4 h-4" />
            </PillButton>
            <PillButton variant={viewMode === 'list' ? 'primary' : 'ghost'} onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Files & Folders</h3>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-all cursor-pointer group"
                    >
                      <div className="space-y-3">
                        <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {file.thumbnail_url ? (
                            <img src={file.thumbnail_url} alt={file.file_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className={getFileColor(file)}>
                              {getFileIcon(file)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm truncate">{file.file_name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{file.file_type || 'File'}</span>
                            <span>•</span>
                            <span>{formatFileSize(file.file_size)}</span>
                          </div>
                          {file.is_shared && (
                            <div className="flex items-center gap-1 text-xs text-sky-600 mt-1">
                              <Share2 className="w-3 h-3" />
                              Shared
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('View', file.id)}>
                            <Eye className="w-3 h-3" />
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Share', file.id)}>
                            <Share2 className="w-3 h-3" />
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Download', file.id)}>
                            <Download className="w-3 h-3" />
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {displayFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`${getFileColor(file)}`}>
                          {getFileIcon(file)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{file.file_name}</h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>{file.file_type || 'File'}</span>
                            <span>{formatFileSize(file.file_size)}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(file.created_at)}
                            </span>
                            {file.is_shared && (
                              <span className="flex items-center gap-1 text-sky-600">
                                <Share2 className="w-3 h-3" />
                                Shared
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('View', file.id)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Download', file.id)}>
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {displayFiles.length === 0 && (
                <div className="py-12 text-center">
                  <Cloud className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Files Yet</h3>
                  <p className="text-slate-600 mb-4">Upload your first file to get started</p>
                  <button className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium hover:from-sky-600 hover:to-blue-700 transition-all">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Files
                  </button>
                </div>
              )}
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Storage Usage"
              current={totalStorage}
              goal={5000}
              unit="MB"
              icon={<Cloud className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Storage by Type</h3>
              <div className="space-y-3">
                {storageBreakdown.map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center text-white`}>
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.type}</span>
                      </div>
                      <span className="font-semibold">{item.size.toFixed(0)} MB</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color}`}
                        style={{ width: `${totalStorage > 0 ? (item.size / totalStorage) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Files Added" value={displayFiles.length.toString()} change={25.3} />
                <MiniKPI label="Shared Files" value={displayFiles.filter(f => f.is_shared).length.toString()} change={12.5} />
                <MiniKPI label="Downloads" value={displayFiles.reduce((sum, f) => sum + f.download_count, 0).toString()} change={18.7} />
                <MiniKPI label="Views" value={displayFiles.reduce((sum, f) => sum + f.view_count, 0).toString()} change={32.1} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
