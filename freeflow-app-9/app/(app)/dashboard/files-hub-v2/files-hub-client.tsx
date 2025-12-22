'use client'

import { useState, useEffect } from 'react'
import {
  BentoCard,
  BentoGallery,
  BentoList,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ProgressCard,
  ActivityFeed,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  FolderOpen,
  Plus,
  Upload,
  Search,
  Filter,
  Download,
  Share2,
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Settings,
  Grid,
  List,
  Clock,
  HardDrive,
  TrendingUp,
  Eye,
  Star,
  Trash2,
  FolderPlus
} from 'lucide-react'
import { useFilesHub, FileItem, Folder } from '@/lib/hooks/use-files-hub'
import { createFile, createFolder, deleteFile, deleteFolder, toggleFileStar } from '@/app/actions/files-hub'

interface FilesHubClientProps {
  initialFiles: FileItem[]
  initialFolders: Folder[]
  initialStats: {
    totalFiles: number
    totalFolders: number
    totalSizeBytes: number
    starredFiles: number
    recentFiles: number
  }
}

export default function FilesHubClient({ initialFiles, initialFolders, initialStats }: FilesHubClientProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'starred'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [showAddFolder, setShowAddFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const { files, folders, stats, fetchFiles, fetchFolders } = useFilesHub(initialFiles, initialFolders)

  useEffect(() => {
    fetchFiles(currentFolderId || undefined)
    fetchFolders()
  }, [fetchFiles, fetchFolders, currentFolderId])

  const displayStats = stats.totalFiles > 0 ? stats : initialStats

  const filteredFiles = files.filter(file => {
    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'starred' && file.is_starred) ||
      (selectedFilter === 'recent')
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const statsDisplay = [
    { label: 'Total Files', value: String(displayStats.totalFiles), change: 12.5, icon: <File className="w-5 h-5" /> },
    { label: 'Storage Used', value: formatFileSize(displayStats.totalSizeBytes), change: 8.3, icon: <HardDrive className="w-5 h-5" /> },
    { label: 'Folders', value: String(displayStats.totalFolders), change: 15.2, icon: <FolderOpen className="w-5 h-5" /> },
    { label: 'Starred', value: String(displayStats.starredFiles), change: 25.7, icon: <Star className="w-5 h-5" /> }
  ]

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5" />
      case 'image': return <Image className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'audio': return <Music className="w-5 h-5" />
      case 'archive': return <Archive className="w-5 h-5" />
      default: return <File className="w-5 h-5" />
    }
  }

  const recentActivity = files.slice(0, 4).map(f => ({
    icon: <Upload className="w-5 h-5" />,
    title: f.name,
    description: formatFileSize(f.size_bytes || 0),
    time: new Date(f.updated_at).toLocaleDateString(),
    status: f.is_starred ? 'success' as const : 'info' as const
  }))

  const fileCategories = [
    { icon: <FileText className="w-4 h-4" />, title: 'Documents', subtitle: `${files.filter(f => f.file_type === 'document').length} files`, value: formatFileSize(files.filter(f => f.file_type === 'document').reduce((s, f) => s + (f.size_bytes || 0), 0)) },
    { icon: <Image className="w-4 h-4" />, title: 'Images', subtitle: `${files.filter(f => f.file_type === 'image').length} files`, value: formatFileSize(files.filter(f => f.file_type === 'image').reduce((s, f) => s + (f.size_bytes || 0), 0)) },
    { icon: <Video className="w-4 h-4" />, title: 'Videos', subtitle: `${files.filter(f => f.file_type === 'video').length} files`, value: formatFileSize(files.filter(f => f.file_type === 'video').reduce((s, f) => s + (f.size_bytes || 0), 0)) },
    { icon: <Music className="w-4 h-4" />, title: 'Audio', subtitle: `${files.filter(f => f.file_type === 'audio').length} files`, value: formatFileSize(files.filter(f => f.file_type === 'audio').reduce((s, f) => s + (f.size_bytes || 0), 0)) }
  ]

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      await createFolder({ name: newFolderName, parent_id: currentFolderId || undefined })
      setNewFolderName('')
      setShowAddFolder(false)
      fetchFolders()
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  const handleDeleteFile = async (id: string) => {
    try {
      await deleteFile(id)
      fetchFiles(currentFolderId || undefined)
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const handleToggleStar = async (id: string) => {
    try {
      await toggleFileStar(id)
      fetchFiles(currentFolderId || undefined)
    } catch (error) {
      console.error('Error toggling star:', error)
    }
  }

  const handleDeleteFolder = async (id: string) => {
    try {
      await deleteFolder(id)
      fetchFolders()
    } catch (error) {
      console.error('Error deleting folder:', error)
    }
  }

  const galleryItems = filteredFiles.map(file => ({
    id: file.id,
    src: file.thumbnail_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${file.name}`,
    alt: file.name,
    title: file.name,
    description: formatFileSize(file.size_bytes || 0)
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FolderOpen className="w-10 h-10 text-cyan-600" />
              Files Hub
            </h1>
            <p className="text-muted-foreground">Organize and manage all your files securely</p>
          </div>
          <div className="flex items-center gap-3">
            <IconButton icon={<Filter />} ariaLabel="Filter" variant="ghost" size="md" />
            <IconButton icon={<Settings />} ariaLabel="Settings" variant="ghost" size="md" />
            <GradientButton from="cyan" to="blue" onClick={() => setShowAddFolder(true)}>
              <FolderPlus className="w-5 h-5 mr-2" />
              New Folder
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={statsDisplay} />

        {/* Add Folder Form */}
        {showAddFolder && (
          <BentoCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Create New Folder</h3>
            <div className="flex gap-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                autoFocus
              />
              <ModernButton variant="primary" onClick={handleAddFolder}>Create</ModernButton>
              <ModernButton variant="ghost" onClick={() => setShowAddFolder(false)}>Cancel</ModernButton>
            </div>
          </BentoCard>
        )}

        {/* Folders */}
        {folders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentFolderId && (
              <BentoQuickAction
                icon={<FolderOpen className="w-6 h-6" />}
                title="← Back"
                description="Parent folder"
                onClick={() => setCurrentFolderId(null)}
              />
            )}
            {folders.map(folder => (
              <div key={folder.id} className="relative group">
                <BentoQuickAction
                  icon={<FolderOpen className="w-6 h-6" />}
                  title={folder.name}
                  description={`${folder.file_count || 0} files`}
                  onClick={() => setCurrentFolderId(folder.id)}
                />
                <button
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>All</PillButton>
            <PillButton variant={selectedFilter === 'recent' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('recent')}>Recent</PillButton>
            <PillButton variant={selectedFilter === 'starred' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('starred')}>Starred</PillButton>
          </div>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <IconButton icon={<Grid />} ariaLabel="Grid view" variant={viewMode === 'grid' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} />
            <IconButton icon={<List />} ariaLabel="List view" variant={viewMode === 'list' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('list')} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {filteredFiles.length === 0 ? (
              <BentoCard className="p-12 text-center">
                <File className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No files yet</h3>
                <p className="text-muted-foreground mb-4">Upload files to get started</p>
              </BentoCard>
            ) : viewMode === 'grid' ? (
              <BentoGallery title="My Files" items={galleryItems} columns={2} />
            ) : (
              <BentoCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">My Files</h3>
                <div className="space-y-3">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          {getFileIcon(file.file_type || 'other')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate">{file.name}</h4>
                            {file.is_starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{formatFileSize(file.size_bytes || 0)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(file.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <IconButton
                            icon={<Star className={`w-4 h-4 ${file.is_starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />}
                            ariaLabel="Star"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStar(file.id)}
                          />
                          <ModernButton variant="outline" size="sm">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </ModernButton>
                          <IconButton
                            icon={<Trash2 className="w-4 h-4" />}
                            ariaLabel="Delete"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoCard>
            )}

            <BentoList title="File Categories" items={fileCategories} />
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Storage Usage"
              current={Math.round(displayStats.totalSizeBytes / (1024 * 1024 * 1024) * 100) / 100}
              goal={100}
              unit=" GB"
              icon={<HardDrive className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="primary" className="w-full justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => setShowAddFolder(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Folder
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Files
                </ModernButton>
              </div>
            </BentoCard>

            {recentActivity.length > 0 && (
              <ActivityFeed title="Recent Activity" activities={recentActivity} />
            )}

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Files This Week" value={String(displayStats.recentFiles)} change={12.5} />
                <MiniKPI label="Starred Files" value={String(displayStats.starredFiles)} change={8.3} />
                <MiniKPI label="Total Folders" value={String(displayStats.totalFolders)} change={15.2} />
                <MiniKPI label="Storage Growth" value={`+${formatFileSize(displayStats.totalSizeBytes * 0.1)}`} change={5.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
