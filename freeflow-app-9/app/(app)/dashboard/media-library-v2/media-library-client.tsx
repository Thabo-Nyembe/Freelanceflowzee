'use client'

import { useState } from 'react'
import { useMediaFiles, useMediaFolders, useMediaStats, type MediaFile, type MediaFolder, type FileType } from '@/lib/hooks/use-media-library'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI, ActivityFeed, RankingList, ProgressCard } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import {
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Upload,
  Grid3x3,
  List,
  Search,
  Filter,
  Download,
  Share2,
  Trash2,
  Star,
  Folder,
  HardDrive,
  TrendingUp,
  Eye,
  MoreVertical
} from 'lucide-react'

interface MediaLibraryClientProps {
  initialFiles: MediaFile[]
  initialFolders: MediaFolder[]
}

export default function MediaLibraryClient({ initialFiles, initialFolders }: MediaLibraryClientProps) {
  const [selectedType, setSelectedType] = useState<FileType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const { files, loading: filesLoading } = useMediaFiles({
    fileType: selectedType === 'all' ? undefined : selectedType,
    searchQuery
  })
  const { folders, loading: foldersLoading } = useMediaFolders()
  const { totalFiles, totalSize, totalViews, totalDownloads, filesByType, sizeByType } = useMediaStats()

  const displayFiles = files.length > 0 ? files : initialFiles
  const displayFolders = folders.length > 0 ? folders : initialFolders

  const stats = [
    { label: 'Total Files', value: displayFiles.length.toLocaleString(), change: 23.4, icon: <FileText className="w-5 h-5" /> },
    { label: 'Storage Used', value: formatSize(totalSize || displayFiles.reduce((sum, f) => sum + (f.file_size || 0), 0)), change: 15.2, icon: <HardDrive className="w-5 h-5" /> },
    { label: 'Total Views', value: formatNumber(totalViews || displayFiles.reduce((sum, f) => sum + (f.view_count || 0), 0)), change: 34.7, icon: <Eye className="w-5 h-5" /> },
    { label: 'Downloads', value: formatNumber(totalDownloads || displayFiles.reduce((sum, f) => sum + (f.download_count || 0), 0)), change: 18.3, icon: <Download className="w-5 h-5" /> }
  ]

  const topFiles = [...displayFiles]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5)
    .map((file, index) => ({
      rank: index + 1,
      name: file.file_name,
      avatar: getFileEmoji(file.file_type),
      value: formatNumber(file.view_count || 0),
      change: 15 + Math.random() * 30
    }))

  const recentActivity = [
    { icon: <Upload className="w-4 h-4" />, title: 'Uploaded file', description: 'New media added', time: '10m ago', status: 'success' as const },
    { icon: <Download className="w-4 h-4" />, title: 'File downloaded', description: 'By team member', time: '1h ago', status: 'info' as const },
    { icon: <Share2 className="w-4 h-4" />, title: 'File shared', description: 'External access', time: '3h ago', status: 'warning' as const },
    { icon: <Trash2 className="w-4 h-4" />, title: 'Deleted files', description: 'Cleanup complete', time: '5h ago', status: 'error' as const }
  ]

  function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  function getFileEmoji(type: FileType): string {
    switch (type) {
      case 'image': return '🖼️'
      case 'video': return '🎬'
      case 'audio': return '🎵'
      case 'document': return '📄'
      case 'archive': return '📦'
      default: return '📁'
    }
  }

  function getTypeColor(type: FileType): string {
    switch (type) {
      case 'image': return 'from-blue-500 to-cyan-500'
      case 'video': return 'from-purple-500 to-pink-500'
      case 'audio': return 'from-green-500 to-emerald-500'
      case 'document': return 'from-orange-500 to-red-500'
      case 'archive': return 'from-gray-500 to-slate-500'
      default: return 'from-indigo-500 to-purple-500'
    }
  }

  const imagesCount = filesByType?.images || displayFiles.filter(f => f.file_type === 'image').length
  const videosCount = filesByType?.videos || displayFiles.filter(f => f.file_type === 'video').length
  const audioCount = filesByType?.audio || displayFiles.filter(f => f.file_type === 'audio').length
  const docsCount = filesByType?.documents || displayFiles.filter(f => f.file_type === 'document').length

  const totalStorageGB = 1000 // 1TB limit
  const usedStorageGB = (totalSize || displayFiles.reduce((sum, f) => sum + (f.file_size || 0), 0)) / (1024 * 1024 * 1024)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <ImageIcon className="w-10 h-10 text-indigo-600" />
              Media Library
            </h1>
            <p className="text-muted-foreground">Manage images, videos, audio, and documents</p>
          </div>
          <GradientButton from="indigo" to="purple" onClick={() => console.log('Upload')}>
            <Upload className="w-5 h-5 mr-2" />
            Upload Files
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<ImageIcon />} title="Images" description={`${imagesCount} files`} onClick={() => setSelectedType('image')} />
          <BentoQuickAction icon={<Video />} title="Videos" description={`${videosCount} files`} onClick={() => setSelectedType('video')} />
          <BentoQuickAction icon={<Music />} title="Audio" description={`${audioCount} files`} onClick={() => setSelectedType('audio')} />
          <BentoQuickAction icon={<FileText />} title="Documents" description={`${docsCount} files`} onClick={() => setSelectedType('document')} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <PillButton variant={selectedType === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedType('all')}>
              All Files
            </PillButton>
            <PillButton variant={selectedType === 'image' ? 'primary' : 'ghost'} onClick={() => setSelectedType('image')}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Images
            </PillButton>
            <PillButton variant={selectedType === 'video' ? 'primary' : 'ghost'} onClick={() => setSelectedType('video')}>
              <Video className="w-4 h-4 mr-2" />
              Videos
            </PillButton>
            <PillButton variant={selectedType === 'audio' ? 'primary' : 'ghost'} onClick={() => setSelectedType('audio')}>
              <Music className="w-4 h-4 mr-2" />
              Audio
            </PillButton>
            <PillButton variant={selectedType === 'document' ? 'primary' : 'ghost'} onClick={() => setSelectedType('document')}>
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </PillButton>
          </div>
          <div className="flex items-center gap-2">
            <ModernButton variant={viewMode === 'grid' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
              <Grid3x3 className="w-4 h-4" />
            </ModernButton>
            <ModernButton variant={viewMode === 'list' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </ModernButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Media Files</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {displayFiles.slice(0, 9).map((file) => (
                    <div key={file.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors group">
                      <div className="space-y-3">
                        <div className={`aspect-video rounded-lg bg-gradient-to-r ${getTypeColor(file.file_type)} flex items-center justify-center text-6xl`}>
                          {getFileEmoji(file.file_type)}
                        </div>
                        <div>
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-sm truncate flex-1">{file.file_name}</h4>
                            <ModernButton variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                              <MoreVertical className="w-3 h-3" />
                            </ModernButton>
                          </div>
                          <p className="text-xs text-muted-foreground">{file.width && file.height ? `${file.width}x${file.height}` : file.mime_type}</p>
                          <p className="text-xs text-muted-foreground">{formatSize(file.file_size || 0)}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{formatNumber(file.view_count || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            <span>{file.download_count || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <ModernButton variant="outline" size="sm" className="flex-1">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </ModernButton>
                          <ModernButton variant="ghost" size="sm">
                            <Share2 className="w-3 h-3" />
                          </ModernButton>
                          <ModernButton variant="ghost" size="sm">
                            <Star className={`w-3 h-3 ${file.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}

                  {displayFiles.length === 0 && (
                    <div className="col-span-3 text-center py-12">
                      <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Files Found</h3>
                      <p className="text-muted-foreground">Upload files to get started</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {displayFiles.slice(0, 10).map((file) => (
                    <div key={file.id} className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${getTypeColor(file.file_type)} flex items-center justify-center text-3xl flex-shrink-0`}>
                          {getFileEmoji(file.file_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{file.file_name}</h4>
                          <p className="text-sm text-muted-foreground">{file.width && file.height ? `${file.width}x${file.height}` : file.mime_type} • {formatSize(file.file_size || 0)}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{formatNumber(file.view_count || 0)} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              <span>{file.download_count || 0} downloads</span>
                            </div>
                            <span>Uploaded {new Date(file.uploaded_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ModernButton variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </ModernButton>
                          <ModernButton variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                          </ModernButton>
                          <ModernButton variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Folders</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => console.log('Open folder', folder.id)}
                    className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${folder.color || 'from-indigo-500 to-purple-500'} flex items-center justify-center text-white mb-3`}>
                      <Folder className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold mb-1">{folder.folder_name}</h4>
                    <p className="text-xs text-muted-foreground">{folder.file_count || 0} files</p>
                    <p className="text-xs text-muted-foreground">{formatSize(folder.total_size || 0)}</p>
                  </button>
                ))}

                {displayFolders.length === 0 && (
                  <div className="col-span-3 text-center py-8">
                    <Folder className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-muted-foreground">No folders yet</p>
                  </div>
                )}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="👁️ Most Viewed" items={topFiles} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Library Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Files" value={displayFiles.length.toLocaleString()} change={23.4} />
                <MiniKPI label="Storage Used" value={formatSize(totalSize || displayFiles.reduce((sum, f) => sum + (f.file_size || 0), 0))} change={15.2} />
                <MiniKPI label="Total Views" value={formatNumber(totalViews || displayFiles.reduce((sum, f) => sum + (f.view_count || 0), 0))} change={34.7} />
                <MiniKPI label="Downloads" value={formatNumber(totalDownloads || displayFiles.reduce((sum, f) => sum + (f.download_count || 0), 0))} change={18.3} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Storage Limit"
              value={Math.round(usedStorageGB)}
              target={totalStorageGB}
              label={`${formatSize((totalSize || displayFiles.reduce((sum, f) => sum + (f.file_size || 0), 0)))} used of 1TB`}
              color="from-indigo-500 to-purple-500"
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">File Type Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Images</span>
                    </div>
                    <span className="text-xs font-semibold">{imagesCount} files</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${displayFiles.length > 0 ? (imagesCount / displayFiles.length) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Videos</span>
                    </div>
                    <span className="text-xs font-semibold">{videosCount} files</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${displayFiles.length > 0 ? (videosCount / displayFiles.length) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Documents</span>
                    </div>
                    <span className="text-xs font-semibold">{docsCount} files</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${displayFiles.length > 0 ? (docsCount / displayFiles.length) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Audio</span>
                    </div>
                    <span className="text-xs font-semibold">{audioCount} files</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${displayFiles.length > 0 ? (audioCount / displayFiles.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
