"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ActivityFeed,
  RankingList,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
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

/**
 * Media Library V2 - Professional Media Management
 * Manages images, videos, audio, and documents
 */
export default function MediaLibraryV2() {
  const [selectedType, setSelectedType] = useState<'all' | 'images' | 'videos' | 'audio' | 'documents'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const stats = [
    { label: 'Total Files', value: '12,847', change: 23.4, icon: <FileText className="w-5 h-5" /> },
    { label: 'Storage Used', value: '847 GB', change: 15.2, icon: <HardDrive className="w-5 h-5" /> },
    { label: 'Total Views', value: '2.4M', change: 34.7, icon: <Eye className="w-5 h-5" /> },
    { label: 'Downloads', value: '89K', change: 18.3, icon: <Download className="w-5 h-5" /> }
  ]

  const mediaItems = [
    {
      id: '1',
      name: 'Product Hero Image.jpg',
      type: 'image',
      size: '2.4 MB',
      dimensions: '3840x2160',
      views: 34700,
      downloads: 892,
      uploaded: '2024-02-10',
      thumbnail: '🖼️',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      name: 'Marketing Video.mp4',
      type: 'video',
      size: '124 MB',
      dimensions: '1920x1080',
      views: 28400,
      downloads: 567,
      uploaded: '2024-02-11',
      thumbnail: '🎬',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      name: 'Podcast Episode 12.mp3',
      type: 'audio',
      size: '45 MB',
      dimensions: '48kHz',
      views: 12700,
      downloads: 423,
      uploaded: '2024-02-09',
      thumbnail: '🎵',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      name: 'Brand Guidelines.pdf',
      type: 'document',
      size: '8.2 MB',
      dimensions: '42 pages',
      views: 8920,
      downloads: 234,
      uploaded: '2024-02-08',
      thumbnail: '📄',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      name: 'Team Photo.jpg',
      type: 'image',
      size: '5.1 MB',
      dimensions: '4096x2730',
      views: 15600,
      downloads: 678,
      uploaded: '2024-02-12',
      thumbnail: '📸',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: '6',
      name: 'Tutorial Screencast.mov',
      type: 'video',
      size: '189 MB',
      dimensions: '2560x1440',
      views: 19200,
      downloads: 445,
      uploaded: '2024-02-07',
      thumbnail: '🎥',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: '7',
      name: 'Background Music.wav',
      type: 'audio',
      size: '67 MB',
      dimensions: '96kHz',
      views: 6700,
      downloads: 189,
      uploaded: '2024-02-11',
      thumbnail: '🎼',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: '8',
      name: 'Financial Report Q1.xlsx',
      type: 'document',
      size: '1.2 MB',
      dimensions: '12 sheets',
      views: 5400,
      downloads: 156,
      uploaded: '2024-02-06',
      thumbnail: '📊',
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  const folders = [
    { id: '1', name: 'Marketing Assets', files: 247, size: '12.4 GB', color: 'from-blue-500 to-cyan-500' },
    { id: '2', name: 'Product Images', files: 189, size: '8.7 GB', color: 'from-purple-500 to-pink-500' },
    { id: '3', name: 'Video Content', files: 67, size: '24.1 GB', color: 'from-green-500 to-emerald-500' },
    { id: '4', name: 'Documents', files: 423, size: '3.2 GB', color: 'from-orange-500 to-red-500' },
    { id: '5', name: 'Audio Files', files: 92, size: '5.8 GB', color: 'from-pink-500 to-rose-500' },
    { id: '6', name: 'Brand Resources', files: 134, size: '6.3 GB', color: 'from-indigo-500 to-purple-500' }
  ]

  const topFiles = [
    { rank: 1, name: 'Product Hero Image', avatar: '🖼️', value: '34.7K', change: 45.2 },
    { rank: 2, name: 'Marketing Video', avatar: '🎬', value: '28.4K', change: 32.1 },
    { rank: 3, name: 'Team Photo', avatar: '📸', value: '15.6K', change: 23.7 },
    { rank: 4, name: 'Tutorial Screencast', avatar: '🎥', value: '19.2K', change: 18.9 },
    { rank: 5, name: 'Podcast Episode', avatar: '🎵', value: '12.7K', change: 12.3 }
  ]

  const recentActivity = [
    { icon: <Upload className="w-4 h-4" />, title: 'Uploaded Marketing Video', time: '10m ago', type: 'success' as const },
    { icon: <Download className="w-4 h-4" />, title: 'File downloaded 24 times', time: '1h ago', type: 'info' as const },
    { icon: <Share2 className="w-4 h-4" />, title: 'Brand Guidelines shared', time: '3h ago', type: 'warning' as const },
    { icon: <Trash2 className="w-4 h-4" />, title: 'Deleted old files', time: '5h ago', type: 'error' as const }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'audio': return <Music className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 p-6">
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
          <BentoQuickAction icon={<ImageIcon />} title="Images" description="View photos" onClick={() => setSelectedType('images')} />
          <BentoQuickAction icon={<Video />} title="Videos" description="Watch clips" onClick={() => setSelectedType('videos')} />
          <BentoQuickAction icon={<Music />} title="Audio" description="Listen" onClick={() => setSelectedType('audio')} />
          <BentoQuickAction icon={<FileText />} title="Documents" description="Read files" onClick={() => setSelectedType('documents')} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PillButton variant={selectedType === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedType('all')}>
              All Files
            </PillButton>
            <PillButton variant={selectedType === 'images' ? 'primary' : 'ghost'} onClick={() => setSelectedType('images')}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Images
            </PillButton>
            <PillButton variant={selectedType === 'videos' ? 'primary' : 'ghost'} onClick={() => setSelectedType('videos')}>
              <Video className="w-4 h-4 mr-2" />
              Videos
            </PillButton>
            <PillButton variant={selectedType === 'audio' ? 'primary' : 'ghost'} onClick={() => setSelectedType('audio')}>
              <Music className="w-4 h-4 mr-2" />
              Audio
            </PillButton>
            <PillButton variant={selectedType === 'documents' ? 'primary' : 'ghost'} onClick={() => setSelectedType('documents')}>
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
                  {mediaItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors group">
                      <div className="space-y-3">
                        <div className={`aspect-video rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center text-6xl`}>
                          {item.thumbnail}
                        </div>
                        <div>
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-sm truncate flex-1">{item.name}</h4>
                            <ModernButton variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                              <MoreVertical className="w-3 h-3" />
                            </ModernButton>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.dimensions}</p>
                          <p className="text-xs text-muted-foreground">{item.size}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{(item.views / 1000).toFixed(1)}K</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            <span>{item.downloads}</span>
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
                            <Star className="w-3 h-3" />
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {mediaItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center text-3xl flex-shrink-0`}>
                          {item.thumbnail}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.dimensions} • {item.size}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{(item.views / 1000).toFixed(1)}K views</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              <span>{item.downloads} downloads</span>
                            </div>
                            <span>Uploaded {item.uploaded}</span>
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
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => console.log('Open folder', folder.id)}
                    className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${folder.color} flex items-center justify-center text-white mb-3`}>
                      <Folder className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold mb-1">{folder.name}</h4>
                    <p className="text-xs text-muted-foreground">{folder.files} files</p>
                    <p className="text-xs text-muted-foreground">{folder.size}</p>
                  </button>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="👁️ Most Viewed" items={topFiles} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Library Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Files" value="12,847" change={23.4} />
                <MiniKPI label="Storage Used" value="847 GB" change={15.2} />
                <MiniKPI label="Total Views" value="2.4M" change={34.7} />
                <MiniKPI label="Downloads" value="89K" change={18.3} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Storage Limit"
              value={847}
              target={1000}
              label="GB used of 1TB"
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
                    <span className="text-xs font-semibold">6,247 files</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '48%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Videos</span>
                    </div>
                    <span className="text-xs font-semibold">892 files</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '7%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Documents</span>
                    </div>
                    <span className="text-xs font-semibold">4,234 files</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: '33%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Audio</span>
                    </div>
                    <span className="text-xs font-semibold">1,474 files</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '12%' }} />
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
