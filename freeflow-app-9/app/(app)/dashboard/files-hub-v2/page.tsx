"use client"

import { useState } from 'react'
import {
  BentoGrid,
  BentoCard,
  BentoStat,
  BentoList,
  BentoGallery
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
  Star
} from 'lucide-react'

/**
 * Files Hub V2 - Groundbreaking File Management
 * Showcases file organization with modern components
 */
export default function FilesHubV2() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'starred'>('all')

  // Sample files data
  const files = [
    {
      id: '1',
      name: 'Brand Guidelines.pdf',
      type: 'document',
      size: 2400000,
      modified: '2025-01-10',
      thumbnail: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400',
      starred: true
    },
    {
      id: '2',
      name: 'Product Photos.zip',
      type: 'archive',
      size: 15600000,
      modified: '2025-01-09',
      thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      starred: false
    },
    {
      id: '3',
      name: 'Demo Video.mp4',
      type: 'video',
      size: 45000000,
      modified: '2025-01-08',
      thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400',
      starred: true
    },
    {
      id: '4',
      name: 'Client Presentation.pptx',
      type: 'document',
      size: 5200000,
      modified: '2025-01-07',
      thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
      starred: false
    }
  ]

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const totalStorage = 100 * 1024 * 1024 * 1024 // 100 GB
  const usedPercentage = Math.round((totalSize / totalStorage) * 100)

  // Stats
  const stats = [
    {
      label: 'Total Files',
      value: '1,234',
      change: 12.5,
      icon: <File className="w-5 h-5" />
    },
    {
      label: 'Storage Used',
      value: '68 GB',
      change: 8.3,
      icon: <HardDrive className="w-5 h-5" />
    },
    {
      label: 'Shared Files',
      value: '234',
      change: 15.2,
      icon: <Share2 className="w-5 h-5" />
    },
    {
      label: 'Recent Views',
      value: '456',
      change: 25.7,
      icon: <Eye className="w-5 h-5" />
    }
  ]

  // Recent activity
  const recentActivity = [
    {
      icon: <Upload className="w-5 h-5" />,
      title: 'File uploaded',
      description: 'Brand Guidelines.pdf added',
      time: '2 hours ago',
      status: 'success' as const
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: 'File shared',
      description: 'Demo Video.mp4 shared with team',
      time: '5 hours ago',
      status: 'info' as const
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: 'File downloaded',
      description: 'Product Photos.zip downloaded',
      time: '1 day ago',
      status: 'info' as const
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: 'File starred',
      description: 'Brand Guidelines.pdf marked as favorite',
      time: '2 days ago',
      status: 'success' as const
    }
  ]

  // File categories
  const fileListItems = [
    {
      icon: <FileText className="w-4 h-4" />,
      title: 'Documents',
      subtitle: '234 files',
      value: '12.4 GB'
    },
    {
      icon: <Image className="w-4 h-4" />,
      title: 'Images',
      subtitle: '456 files',
      value: '8.2 GB'
    },
    {
      icon: <Video className="w-4 h-4" />,
      title: 'Videos',
      subtitle: '89 files',
      value: '35.6 GB'
    },
    {
      icon: <Music className="w-4 h-4" />,
      title: 'Audio',
      subtitle: '123 files',
      value: '4.8 GB'
    }
  ]

  const formatFileSize = (bytes: number) => {
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

  const galleryItems = files.map(file => ({
    id: file.id,
    src: file.thumbnail,
    alt: file.name,
    title: file.name,
    description: formatFileSize(file.size)
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50/30 to-indigo-50/40 dark:from-cyan-950 dark:via-blue-950/30 dark:to-indigo-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FolderOpen className="w-10 h-10 text-cyan-600" />
              Files Hub
            </h1>
            <p className="text-muted-foreground">
              Organize and manage all your files securely
            </p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={<Filter />}
              ariaLabel="Filter"
              variant="ghost"
              size="md"
            />
            <IconButton
              icon={<Settings />}
              ariaLabel="Settings"
              variant="ghost"
              size="md"
            />
            <GradientButton
              from="cyan"
              to="blue"
              onClick={() => console.log('Upload')}
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Files
            </GradientButton>
          </div>
        </div>

        {/* Stats */}
        <StatGrid columns={4} stats={stats} />

        {/* Search and View Options */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton
              variant={selectedFilter === 'all' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('all')}
            >
              All Files
            </PillButton>
            <PillButton
              variant={selectedFilter === 'recent' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('recent')}
            >
              Recent
            </PillButton>
            <PillButton
              variant={selectedFilter === 'starred' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('starred')}
            >
              Starred
            </PillButton>
          </div>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <IconButton
              icon={<Grid />}
              ariaLabel="Grid view"
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            />
            <IconButton
              icon={<List />}
              ariaLabel="List view"
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Files Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery View */}
            {viewMode === 'grid' && (
              <BentoGallery
                title="📁 My Files"
                items={galleryItems}
                columns={2}
              />
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <BentoCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">My Files</h3>
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate">{file.name}</h4>
                            {file.starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Modified {file.modified}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ModernButton
                            variant="outline"
                            size="sm"
                            onClick={() => console.log('Download', file.id)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </ModernButton>
                          <ModernButton
                            variant="outline"
                            size="sm"
                            onClick={() => console.log('Share', file.id)}
                          >
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoCard>
            )}

            {/* File Categories */}
            <BentoList
              title="File Categories"
              items={fileListItems}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Storage Usage */}
            <ProgressCard
              title="Storage Usage"
              current={68}
              goal={100}
              unit=" GB"
              icon={<HardDrive className="w-5 h-5" />}
            />

            {/* Quick Actions */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton
                  variant="primary"
                  className="w-full justify-start"
                  onClick={() => console.log('Upload')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </ModernButton>
                <ModernButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => console.log('New folder')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Folder
                </ModernButton>
                <ModernButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => console.log('Share')}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Files
                </ModernButton>
                <ModernButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => console.log('Download')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </ModernButton>
              </div>
            </BentoCard>

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Quick Stats */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Files This Week" value="45" change={12.5} />
                <MiniKPI label="Shared Files" value="234" change={8.3} />
                <MiniKPI label="Downloads" value="89" change={15.2} />
                <MiniKPI label="Storage Growth" value="+2.4 GB" change={5.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
